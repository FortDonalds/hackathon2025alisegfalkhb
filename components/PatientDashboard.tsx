
import React, { useState } from 'react';
import { CheckSquare, BookOpen, Sun, PenTool, Save, Video, ClipboardList, User, Frown, Meh, Smile, PlayCircle } from 'lucide-react';
import { Homework, Note, Session } from '../types';

interface Props {
  onStartSession: () => void;
  onStartQuestionnaire: () => void;
  onOpenProfile: () => void;
  notes: Note[];
  onSaveNote: (title: string, content: string) => void;
  lastSession?: Session;
}

export const PatientDashboard: React.FC<Props> = ({ onStartSession, onStartQuestionnaire, onOpenProfile, notes, onSaveNote, lastSession }) => {
  const [homework, setHomework] = useState<Homework[]>([
    { id: '1', text: 'Journal emotions for 10 minutes', completed: false },
    { id: '2', text: 'Get 30 minutes of sunlight', completed: true },
  ]);

  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [dailyMood, setDailyMood] = useState(5);

  const handleSaveNote = () => {
    if (!newNoteContent.trim()) return;
    onSaveNote(newNoteTitle || 'Untitled Entry', newNoteContent);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hello, Sarah</h1>
          <p className="text-gray-500">Welcome to your safe space.</p>
        </div>
        <div className="flex gap-3">
            <button onClick={onOpenProfile} className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2">
                <User size={20} /> Profile
            </button>
            <button 
                onClick={onStartSession}
                className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors transform hover:scale-105"
            >
                <Video size={20} />
                Join Session
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
            {/* Mood Tracker */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">How are you feeling today?</h3>
                <div className="flex justify-between text-gray-400 mb-2 px-2">
                    <Frown size={20} className={dailyMood <= 3 ? 'text-red-500' : ''} />
                    <Meh size={20} className={dailyMood > 3 && dailyMood < 8 ? 'text-yellow-500' : ''} />
                    <Smile size={20} className={dailyMood >= 8 ? 'text-green-500' : ''} />
                </div>
                <input 
                    type="range" min="1" max="10" 
                    value={dailyMood} onChange={e => setDailyMood(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600 mb-4"
                />
                <input 
                    placeholder="Short note (e.g. Feeling energetic...)" 
                    className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded"
                    maxLength={200}
                />
            </div>

            <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-6 rounded-xl text-white shadow-md">
                <h3 className="font-semibold mb-2">Upcoming Session</h3>
                <p className="text-brand-100 text-sm mb-4">Today, 2:00 PM with Dr. Thompson</p>
                <button onClick={onStartQuestionnaire} className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                    <ClipboardList size={16} /> Pre-session Check-in
                </button>
            </div>

            {lastSession && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <PlayCircle size={18} className="text-purple-600" /> Last Session
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{lastSession.analysis.summary}</p>
                    {lastSession.studentNotes && (
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-100 text-xs text-yellow-800 mt-2">
                            <strong>Note from Dr. Thompson:</strong><br/>
                            {lastSession.studentNotes}
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Journaling Column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[700px]">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="text-teal-600" size={20} />
                Private Journal
            </h3>
            
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <input 
                    type="text"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="Title your entry..."
                    className="w-full bg-transparent border-b border-gray-200 px-0 py-2 mb-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:ring-0 font-bold text-lg outline-none"
                />
                <div className="relative">
                    <textarea 
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder="How are you feeling right now?..."
                        className="w-full p-3 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none h-24 transition-all outline-none text-sm"
                    />
                    <div className="absolute bottom-2 right-2 flex gap-2">
                        <button 
                            onClick={handleSaveNote}
                            disabled={!newNoteContent.trim()}
                            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors shadow-sm"
                        >
                            <Save size={14} /> Save Entry
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {notes.filter(n => n.type === 'Journal' || n.type === 'Questionnaire').map(note => (
                    <div key={note.id} className="group relative p-4 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-all hover:border-brand-100">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-800 text-sm">{note.title}</h4>
                                {note.type === 'Questionnaire' && (
                                    <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">Check-in</span>
                                )}
                            </div>
                            <span className="text-xs text-gray-400">{note.date}</span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    </div>
                ))}
                {notes.length === 0 && (
                    <div className="text-center text-gray-400 py-10">
                        <PenTool className="mx-auto mb-2 opacity-50" size={32} />
                        <p className="text-sm">Your journal is empty. Start writing to track your journey.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};