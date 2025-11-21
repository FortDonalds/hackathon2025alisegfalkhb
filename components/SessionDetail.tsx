
import React, { useState } from 'react';
import { Session } from '../types';
import { ArrowLeft, FileText, Video, MessageSquare, Paperclip, Save, AlignLeft } from 'lucide-react';
import { AnalysisDisplay } from './AnalysisDisplay';

interface Props {
  session: Session;
  onBack: () => void;
  onUpdateSession: (updated: Session) => void;
}

export const SessionDetail: React.FC<Props> = ({ session, onBack, onUpdateSession }) => {
  const [counselorNotes, setCounselorNotes] = useState(session.counselorNotes);
  const [studentNotes, setStudentNotes] = useState(session.studentNotes);
  const [activeTab, setActiveTab] = useState<'insights' | 'transcript' | 'notes'>('insights');
  const [showVideo, setShowVideo] = useState(false);

  const handleSave = () => {
    onUpdateSession({
        ...session,
        counselorNotes,
        studentNotes
    });
    alert("Notes saved successfully.");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <header className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20} /></button>
            <div>
                <h1 className="text-xl font-bold text-gray-900">{session.title}</h1>
                <p className="text-gray-500 text-sm">{session.date} • {session.patientName}</p>
            </div>
        </div>
        <div className="flex gap-2">
            {session.videoUrl && (
                <button onClick={() => setShowVideo(!showVideo)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700">
                    <Video size={16} /> {showVideo ? 'Hide Recording' : 'Watch Recording'}
                </button>
            )}
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 rounded-lg text-sm font-medium text-white">
                <Save size={16} /> Save Changes
            </button>
        </div>
      </header>
      
      {showVideo && session.videoUrl && (
        <div className="bg-black rounded-xl overflow-hidden shadow-lg aspect-video">
            <video src={session.videoUrl} controls className="w-full h-full" />
        </div>
      )}

      <div className="flex gap-4 border-b border-gray-200 bg-white px-4 rounded-t-xl">
        <button 
            onClick={() => setActiveTab('insights')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'insights' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
            AI Insights
        </button>
        <button 
            onClick={() => setActiveTab('transcript')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'transcript' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
            <AlignLeft size={16} /> Transcript
        </button>
        <button 
            onClick={() => setActiveTab('notes')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'notes' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
            Counselor Notes & Attachments
        </button>
      </div>

      {activeTab === 'insights' ? (
          <AnalysisDisplay result={session.analysis} onClose={() => {}} />
      ) : activeTab === 'transcript' ? (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="text-teal-600" size={20} /> Session Transcript
              </h3>
              <div className="space-y-4">
                {session.analysis.verbal_cues.length === 0 ? (
                    <p className="text-gray-500 italic">No verbal cues detected in this session.</p>
                ) : (
                    session.analysis.verbal_cues.map((cue, idx) => (
                        <div key={idx} className="flex gap-4 group">
                            <div className="w-16 text-xs text-gray-400 pt-1 font-mono">{cue.timestamp}</div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900 text-sm">{cue.speaker}</span>
                                    <span className="text-[10px] bg-gray-100 px-1.5 rounded text-gray-500">{cue.tone_analysis}</span>
                                </div>
                                <p className="text-gray-700">{cue.spoken_text}</p>
                                <div className="mt-1 text-xs text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Intent: {cue.intent_or_meaning}
                                </div>
                            </div>
                        </div>
                    ))
                )}
              </div>
          </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="text-brand-600" size={20} /> Private Counselor Notes
                  </h3>
                  <textarea 
                      value={counselorNotes}
                      onChange={(e) => setCounselorNotes(e.target.value)}
                      placeholder="Write your private observations here..."
                      className="w-full h-64 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  />
              </div>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MessageSquare className="text-teal-600" size={20} /> Notes to Student
                    </h3>
                    <textarea 
                        value={studentNotes}
                        onChange={(e) => setStudentNotes(e.target.value)}
                        placeholder="Shared feedback or homework for the student..."
                        className="w-full h-32 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                    />
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Paperclip className="text-gray-600" size={20} /> Attachments
                    </h3>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                        <p className="text-sm text-gray-500">Click to upload resources (PDF, DOCX)</p>
                    </div>
                </div>
              </div>
          </div>
      )}
    </div>
  );
};
