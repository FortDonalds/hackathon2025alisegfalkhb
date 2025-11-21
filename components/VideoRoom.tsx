
import React, { useEffect, useRef, useState } from 'react';
import { Camera, Mic, MicOff, Video, VideoOff, PhoneOff, Activity, Save, Download, User, Copy, Phone, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { uploadVideoForAnalysis } from '../services/api';
import { AnalysisResult } from '../types';
import { io, Socket } from 'socket.io-client';

interface VideoRoomProps {
  onLeave: () => void;
  onAnalysisComplete: (data: AnalysisResult, videoBlob: Blob) => void;
}

export const VideoRoom: React.FC<VideoRoomProps> = ({ onLeave, onAnalysisComplete }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  
  // WebRTC & Socket State
  const [me, setMe] = useState('');
  const [idToCall, setIdToCall] = useState('');
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState<any>();
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketError, setSocketError] = useState(false);

  const userVideo = useRef<HTMLVideoElement>(null);
  const partnerVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<RTCPeerConnection | null>(null);
  const socket = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  // Initialize Media and Socket
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const init = async () => {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(currentStream);
        if (userVideo.current) {
          userVideo.current.srcObject = currentStream;
        }

        // Initialize Socket
        socket.current = io('http://localhost:5000', {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5
        });
        
        socket.current.on('connect', () => {
          setSocketConnected(true);
          setSocketError(false);
        });

        socket.current.on('connect_error', (err) => {
            console.error("Socket connection failed:", err);
            setSocketError(true);
            setSocketConnected(false);
        });

        socket.current.on('me', (id: string) => {
            console.log("Received My ID:", id);
            setMe(id);
        });

        socket.current.on('callUser', (data: any) => {
          setReceivingCall(true);
          setCaller(data.from);
          setCallerSignal(data.signal);
        });

        socket.current.on('callAccepted', (signal: any) => {
          setCallAccepted(true);
          connectionRef.current?.setRemoteDescription(new RTCSessionDescription(signal));
        });

      } catch (err) {
        console.error("Error accessing media devices or socket:", err);
        alert("Could not access camera/microphone. Please ensure you're on HTTPS or Localhost and have granted permissions.");
      }
    };

    init();

    return () => {
      // Cleanup function to stop tracks and prevent "Device in use" errors
      if (currentStream) {
        currentStream.getTracks().forEach(track => {
            track.stop();
        });
      }
      if (socket.current) socket.current.disconnect();
      if (connectionRef.current) connectionRef.current.close();
    };
  }, []);

  const callUser = (id: string) => {
    const peer = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    connectionRef.current = peer;

    stream?.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
         // For simple-peer style signaling we often wait for all candidates or send them.
         // Here we assume the offer includes candidates or network allows.
      }
    };

    peer.ontrack = (event) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = event.streams[0];
      }
    };

    peer.createOffer().then((offer) => {
      peer.setLocalDescription(offer);
      socket.current?.emit('callUser', {
        userToCall: id,
        signalData: offer,
        from: me,
        name: 'User'
      });
    });
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    connectionRef.current = peer;

    stream?.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.ontrack = (event) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = event.streams[0];
      }
    };

    peer.setRemoteDescription(new RTCSessionDescription(callerSignal));

    peer.createAnswer().then((answer) => {
      peer.setLocalDescription(answer);
      socket.current?.emit('answerCall', { signal: answer, to: caller });
    });
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !micOn;
      });
      setMicOn(!micOn);
    }
  };

  const toggleCamera = () => {
    if (stream) {
        stream.getVideoTracks().forEach(track => {
            track.enabled = !cameraOn;
        });
      setCameraOn(!cameraOn);
    }
  };

  const startRecording = () => {
    if (!stream) return;
    try {
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];
        mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        mediaRecorder.start();
        setRecording(true);
        setRecordedBlob(null);
    } catch (e) {
        console.error("MediaRecorder error:", e);
        alert("Could not start recording. MediaRecorder might not be supported in this browser.");
    }
  };

  const stopRecordingAndAnalyze = async () => {
    if (!mediaRecorderRef.current) return;
    setRecording(false);
    setAnalyzing(true);
    
    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      try {
        const result = await uploadVideoForAnalysis(blob);
        onAnalysisComplete(result, blob);
      } catch (err) {
        console.error("Analysis failed", err);
        setAnalyzing(false);
        alert("Analysis failed. Check if backend is running on port 8000.");
      }
    };
    
    mediaRecorderRef.current.stop();
  };

  const copyId = () => {
    navigator.clipboard.writeText(me);
    alert("ID Copied to clipboard!");
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden relative shadow-2xl">
      {/* Connection Info Bar */}
      <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md p-3 rounded-xl text-white text-xs flex items-center gap-4 shadow-lg border border-white/10">
        <div className="flex items-center gap-2">
            {socketConnected ? <Wifi size={14} className="text-green-400"/> : <WifiOff size={14} className="text-red-400"/>}
            <span className={socketConnected ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                {socketConnected ? 'Online' : socketError ? 'Backend Offline (5000)' : 'Connecting...'}
            </span>
        </div>
        <div className="h-4 w-px bg-gray-600" />
        <div className="flex items-center gap-2">
             <span className="text-gray-400 uppercase tracking-wider text-[10px]">My ID</span>
             <div className="bg-black/40 px-2 py-1 rounded font-mono select-all min-w-[100px] text-center border border-white/10">
                {me || 'Generating...'}
             </div>
             <button onClick={copyId} disabled={!me} className="hover:text-brand-400 disabled:opacity-50 p-1 rounded hover:bg-white/10 transition-colors">
                <Copy size={14}/>
             </button>
        </div>
      </div>

      {/* Call Interface Overlay (if not connected) */}
      {!callAccepted && !callEnded && (
        <div className="absolute top-20 left-4 z-20 bg-white p-5 rounded-xl shadow-2xl w-80 border border-gray-100 animate-in slide-in-from-left-4">
            {receivingCall ? (
                <div className="text-center">
                    <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Phone size={32} className="text-brand-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Incoming Call...</h3>
                    <p className="text-sm text-gray-500 mb-4">ID: {caller.slice(0,8)}...</p>
                    <button onClick={answerCall} className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-green-500/30 transition-all transform hover:scale-105">
                        Answer Call
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Start a Call</h3>
                        <p className="text-xs text-gray-500">Enter the ID from your partner's screen.</p>
                    </div>
                    <div className="space-y-2">
                        <input 
                            type="text" 
                            value={idToCall}
                            onChange={(e) => setIdToCall(e.target.value)}
                            placeholder="Enter Partner ID"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                        <button 
                            onClick={() => callUser(idToCall)}
                            disabled={!idToCall || !socketConnected}
                            className="w-full bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold hover:bg-brand-700 flex items-center justify-center gap-2 transition-all"
                        >
                            <Phone size={18} /> Call Now
                        </button>
                    </div>
                    {!socketConnected && (
                        <div className="bg-red-50 border border-red-100 rounded p-2 text-[10px] text-red-600 leading-tight">
                             ⚠️ Backend not connected. Ensure `node index.js` is running on port 5000.
                        </div>
                    )}
                </div>
            )}
        </div>
      )}

      {analyzing && (
        <div className="absolute inset-0 z-50 bg-gray-900/95 flex flex-col items-center justify-center text-white backdrop-blur-sm">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-teal-500 blur-xl opacity-20 animate-pulse" />
            <Activity className="w-20 h-20 text-teal-500 relative z-10" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Analyzing Session</h3>
          <p className="text-gray-400 animate-pulse">Processing facial expressions and tone...</p>
        </div>
      )}

      <div className="flex-1 flex relative">
        {/* Partner Video */}
        <div className="flex-1 bg-black relative flex items-center justify-center">
             <video ref={partnerVideo} playsInline autoPlay className="w-full h-full object-cover" />
             {!callAccepted && (
                 <div className="absolute text-gray-500 flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <User size={40} className="opacity-50" />
                    </div>
                    <p className="font-medium">Waiting for partner...</p>
                 </div>
             )}
        </div>
        
        {/* Self View */}
        <div className="absolute bottom-6 right-6 w-64 h-48 bg-gray-900 rounded-xl border-2 border-gray-700 overflow-hidden shadow-2xl z-10 group transition-transform hover:scale-105">
           <video playsInline muted ref={userVideo} autoPlay className={`w-full h-full object-cover ${!cameraOn ? 'hidden' : ''} transform scale-x-[-1]`} />
           {!cameraOn && <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-800"><VideoOff size={32} /></div>}
           <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-white text-[10px] font-medium flex items-center gap-2">
                You {recording && <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/> REC</span>}
           </div>
        </div>
      </div>

      {/* Controls */}
      <div className="h-24 bg-gray-900/90 backdrop-blur border-t border-gray-800 flex items-center justify-center gap-6 px-8">
        <button onClick={toggleMic} className={`p-4 rounded-full transition-all ${micOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}>
            {micOn ? <Mic size={24}/> : <MicOff size={24}/>}
        </button>
        <button onClick={toggleCamera} className={`p-4 rounded-full transition-all ${cameraOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}>
            {cameraOn ? <Video size={24}/> : <VideoOff size={24}/>}
        </button>
        
        {!recording ? (
           <button onClick={startRecording} className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-brand-600/20 flex items-center gap-3 transform active:scale-95 transition-all">
             <div className="w-3 h-3 rounded-full bg-red-200 border-2 border-red-500" /> Start Recording
           </button>
        ) : (
           <button onClick={stopRecordingAndAnalyze} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-red-600/20 flex items-center gap-2 animate-pulse">
             <Save size={20} /> End & Analyze
           </button>
        )}

        <button onClick={onLeave} className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white ml-4 shadow-lg shadow-red-500/30"><PhoneOff size={24} /></button>
      </div>
    </div>
  );
};
