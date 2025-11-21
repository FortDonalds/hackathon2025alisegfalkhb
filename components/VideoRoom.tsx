
import React, { useEffect, useRef, useState } from 'react';
import { Camera, Mic, MicOff, Video, VideoOff, PhoneOff, Activity, Save, Download, User, Copy, Phone, AlertCircle } from 'lucide-react';
import { uploadVideoForAnalysis } from '../services/api';
import { AnalysisResult } from '../types';
import { io, Socket } from 'socket.io-client';

interface VideoRoomProps {
  onLeave: () => void;
  onAnalysisComplete: (data: AnalysisResult) => void;
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

  const userVideo = useRef<HTMLVideoElement>(null);
  const partnerVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<RTCPeerConnection | null>(null);
  const socket = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  // Initialize Media and Socket
  useEffect(() => {
    const init = async () => {
      try {
        const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(currentStream);
        if (userVideo.current) {
          userVideo.current.srcObject = currentStream;
        }

        // Initialize Socket
        socket.current = io('http://localhost:5000');
        
        socket.current.on('connect', () => {
          setSocketConnected(true);
        });

        socket.current.on('me', (id: string) => setMe(id));

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
      }
    };

    init();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
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
         // In a robust app we send candidates individually, but for simple-peer style signaling 
         // we might wait. However, standard WebRTC requires exchanging candidates.
         // For this hackathon level, we assume local network or handle standard SDP exchange.
         // Note: The backend expects 'signalData'. 
      }
    };

    peer.onicecandidate = (event) => {
        // Ideally send candidate to peer
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
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micOn;
        setMicOn(!micOn);
      }
    }
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !cameraOn;
        setCameraOn(!cameraOn);
      }
    }
  };

  const startRecording = () => {
    if (!stream) return;
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mediaRecorder.start();
    setRecording(true);
    setRecordedBlob(null);
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
        onAnalysisComplete(result);
      } catch (err) {
        console.error("Analysis failed", err);
        setAnalyzing(false);
      }
    };
    mediaRecorderRef.current.stop();
  };

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-rec-${new Date().getTime()}.webm`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden relative shadow-2xl">
      {/* Connection Info Bar */}
      <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-sm p-2 rounded-lg text-white text-xs flex items-center gap-3">
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {socketConnected ? 'Server Online' : 'Offline'}
        </div>
        <div className="h-4 w-px bg-gray-600" />
        <div className="flex items-center gap-2">
             <span className="text-gray-400">My ID:</span>
             <span className="font-mono select-all">{me || '...'}</span>
             <button onClick={() => navigator.clipboard.writeText(me)} className="hover:text-brand-400"><Copy size={12}/></button>
        </div>
      </div>

      {/* Call Interface Overlay (if not connected) */}
      {!callAccepted && !callEnded && (
        <div className="absolute top-16 left-4 z-20 bg-white p-4 rounded-lg shadow-xl w-72">
            {receivingCall ? (
                <div className="text-center">
                    <h3 className="font-bold text-lg mb-2">Incoming Call...</h3>
                    <button onClick={answerCall} className="bg-green-500 text-white px-6 py-2 rounded-full font-bold animate-pulse">
                        Answer
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <h3 className="font-bold text-gray-800">Start a Call</h3>
                    <input 
                        type="text" 
                        value={idToCall}
                        onChange={(e) => setIdToCall(e.target.value)}
                        placeholder="Enter Partner ID to Call"
                        className="w-full p-2 border rounded text-sm"
                    />
                    <button 
                        onClick={() => callUser(idToCall)}
                        className="w-full bg-brand-600 text-white py-2 rounded hover:bg-brand-700 flex items-center justify-center gap-2"
                    >
                        <Phone size={16} /> Call
                    </button>
                    <p className="text-[10px] text-gray-500 mt-2 leading-tight">
                        <AlertCircle size={10} className="inline mr-1"/>
                        To test P2P: Open app on two devices (LAN IP). Ensure backend is running on port 5000.
                    </p>
                </div>
            )}
        </div>
      )}

      {analyzing && (
        <div className="absolute inset-0 z-50 bg-gray-900/95 flex flex-col items-center justify-center text-white backdrop-blur-sm">
          <Activity className="w-16 h-16 animate-pulse text-teal-500 mb-4" />
          <h3 className="text-xl font-semibold">Mirror AI is analyzing session dynamics...</h3>
        </div>
      )}

      <div className="flex-1 flex relative">
        {/* Partner Video */}
        <div className="flex-1 bg-black relative flex items-center justify-center">
             <video ref={partnerVideo} playsInline autoPlay className="w-full h-full object-cover" />
             {!callAccepted && (
                 <div className="absolute text-gray-500 flex flex-col items-center">
                    <User size={64} className="mb-4 opacity-20" />
                    <p>Waiting for connection...</p>
                 </div>
             )}
        </div>
        
        {/* Self View */}
        <div className="absolute bottom-6 right-6 w-56 h-40 bg-gray-900 rounded-xl border-2 border-gray-700 overflow-hidden shadow-2xl z-10 group">
           <video playsInline muted ref={userVideo} autoPlay className={`w-full h-full object-cover ${!cameraOn ? 'hidden' : ''} transform scale-x-[-1]`} />
           {!cameraOn && <div className="absolute inset-0 flex items-center justify-center text-gray-500"><VideoOff /></div>}
           <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-white text-[10px]">You {recording && <span className="text-red-500 ml-1">● REC</span>}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="h-24 bg-gray-800 flex items-center justify-center gap-6 px-8 border-t border-gray-700">
        <button onClick={toggleMic} className={`p-4 rounded-full ${micOn ? 'bg-gray-700' : 'bg-red-500'}`}>{micOn ? <Mic size={24} className="text-white"/> : <MicOff size={24} className="text-white"/>}</button>
        <button onClick={toggleCamera} className={`p-4 rounded-full ${cameraOn ? 'bg-gray-700' : 'bg-red-500'}`}>{cameraOn ? <Video size={24} className="text-white"/> : <VideoOff size={24} className="text-white"/>}</button>
        
        {!recording ? (
           <button onClick={startRecording} className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-full font-semibold flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-red-500" /> Record
           </button>
        ) : (
           <button onClick={stopRecordingAndAnalyze} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 animate-pulse">
             <Save size={20} /> Stop & Analyze
           </button>
        )}

        <button onClick={onLeave} className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white ml-8"><PhoneOff size={24} /></button>
        
        {recordedBlob && !analyzing && (
            <button onClick={downloadRecording} className="absolute right-8 bg-gray-700 p-4 rounded-full hover:bg-gray-600 text-white" title="Download Recording">
                <Download size={24} />
            </button>
        )}
      </div>
    </div>
  );
};