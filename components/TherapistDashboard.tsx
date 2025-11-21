
import React, { useState } from 'react';
import { Users, Calendar, Clock, FileText, Plus, Video, ChevronRight, UploadCloud, Search, PlayCircle, X } from 'lucide-react';
import { Appointment, Patient, Session } from '../types';
import { uploadVideoForAnalysis } from '../services/api';

interface Props {
  onStartSession: () => void;
  patients: Patient[];
  appointments: Appointment[];
  sessions: Session[];
  onViewPatient: (patient: Patient) => void;
  onAddPatient: (patient: Patient) => void;
  onSessionCreated: (session: Session) => void;
  onViewSession: (session: Session) => void;
  activeTab?: 'patients' | 'schedule' | 'sessions';
  setActiveTab?: (tab: 'patients' | 'schedule' | 'sessions') => void;
}

export const TherapistDashboard: React.FC<Props> = ({ 
    onStartSession, patients, appointments, sessions, 
    onViewPatient, onAddPatient, onSessionCreated, onViewSession,
    activeTab: propActiveTab, setActiveTab: propSetActiveTab
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<'patients' | 'schedule' | 'sessions'>('schedule');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  
  // Use prop controlled state if available, else internal state
  const activeTab = propActiveTab || internalActiveTab;
  const setActiveTab = propSetActiveTab || setInternalActiveTab;

  // Add Patient State
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');

  // Upload Session State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDate, setUploadDate] = useState('');
  const [uploadStudentId, setUploadStudentId] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleAddPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient: Patient = {
        id: Date.now().toString(),
        name: newPatientName,
        email: newPatientEmail,
        status: 'Active',
        riskLevel: 'Low',
        nextSession: '',
        phone: '',
        avatarClass: 'bg-brand-500'
    };
    onAddPatient(newPatient);
    setShowAddPatient(false);
    setNewPatientName('');
    setNewPatientEmail('');
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadStudentId) return;

    setIsUploading(true);
    try {
        const analysis = await uploadVideoForAnalysis(uploadFile);
        const student = patients.find(p => p.id === uploadStudentId);
        const newSession: Session = {
            id: Date.now().toString(),
            patientId: uploadStudentId,
            patientName: student?.name || 'Unknown',
            date: uploadDate || new Date().toLocaleDateString(),
            title: uploadTitle,
            videoUrl: URL.createObjectURL(uploadFile),
            analysis: analysis,
            counselorNotes: '',
            studentNotes: ''
        };
        onSessionCreated(newSession);
        setShowUpload(false);
        setUploadFile(null);
        setUploadTitle('');
    } catch (error) {
        alert("Failed to analyze video");
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dr. Thompson's Dashboard</h1>
          <p className="text-gray-500">Good afternoon. You have {appointments.filter(a => a.status === 'Upcoming' && a.date === new Date().toISOString().split('T')[0]).length} sessions remaining today.</p>
        </div>
        <button 
            onClick={onStartSession}
            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors transform hover:scale-105"
        >
            <Video size={20} />
            Start Instant Session
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Total Patients</h3>
                <Users className="text-brand-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{patients.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Hours Conducted</h3>
                <Clock className="text-teal-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">128</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Pending Notes</h3>
                <FileText className="text-orange-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">5</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="border-b border-gray-200 flex overflow-x-auto">
            {['schedule', 'patients', 'sessions'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-3 text-sm font-medium transition-colors capitalize whitespace-nowrap ${activeTab === tab ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {tab === 'patients' ? 'Patient List' : tab === 'schedule' ? 'Weekly Schedule' : 'Session History'}
                </button>
            ))}
        </div>
        
        <div className="p-6">
            {activeTab === 'schedule' && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Appointments</h3>
                    {appointments.map(apt => (
                        <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="bg-white p-2 rounded border border-gray-200 text-center min-w-[60px]">
                                    <span className="block text-xs text-gray-500 font-bold uppercase">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="block text-xl font-bold text-gray-900">{new Date(apt.date).getDate()}</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{apt.patientName}</h4>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1"><Clock size={14} /> {apt.time}</span>
                                        <span className="flex items-center gap-1"><Video size={14} /> {apt.type}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {apt.type === 'Video' && (
                                    <button onClick={onStartSession} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm">Join</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'patients' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button 
                            onClick={() => setShowAddPatient(true)}
                            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-brand-700"
                        >
                            <Plus size={16} /> Add New Patient
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-900 uppercase font-semibold">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Name</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Risk Level</th>
                                    <th className="px-4 py-3">Next Session</th>
                                    <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {patients.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 group transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold ${p.avatarClass || 'bg-gray-400'}`}>
                                                {p.name.charAt(0)}
                                            </div>
                                            {p.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs border ${p.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs border ${p.riskLevel === 'High' ? 'bg-red-50 text-red-700 border-red-200' : p.riskLevel === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                {p.riskLevel}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{p.nextSession || '-'}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => onViewPatient(p)} className="text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1 ml-auto">
                                                Profile <ChevronRight size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'sessions' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input type="text" placeholder="Search history..." className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <button 
                            onClick={() => setShowUpload(true)}
                            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-teal-700"
                        >
                            <UploadCloud size={16} /> Upload Session
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sessions.map(session => (
                            <div key={session.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                                <div className="h-32 bg-gray-100 flex items-center justify-center relative group cursor-pointer" onClick={() => onViewSession(session)}>
                                    {session.videoUrl ? (
                                        <video src={session.videoUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                        <PlayCircle size={48} className="text-white drop-shadow-lg" />
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">Recorded</div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{session.title}</h4>
                                    <p className="text-sm text-gray-500 mb-3">{session.date} • {session.patientName}</p>
                                    <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                                            Sentiment: {session.analysis.overall_sentiment}
                                        </span>
                                        <button onClick={() => onViewSession(session)} className="text-sm text-brand-600 font-medium hover:underline">
                                            View Analysis
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {sessions.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                                <UploadCloud size={48} className="mx-auto mb-2 opacity-50" />
                                <p>No sessions recorded yet. Upload a video to get started.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-96 shadow-2xl animate-in zoom-in duration-200">
                <h2 className="text-xl font-bold mb-4">Add New Patient</h2>
                <form onSubmit={handleAddPatientSubmit} className="space-y-4">
                    <input 
                        placeholder="Full Name" required 
                        value={newPatientName}
                        onChange={e => setNewPatientName(e.target.value)}
                        className="w-full p-2 border rounded" 
                    />
                    <input 
                        placeholder="Email Address" type="email" required 
                        value={newPatientEmail}
                        onChange={e => setNewPatientEmail(e.target.value)}
                        className="w-full p-2 border rounded" 
                    />
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowAddPatient(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700">Add Patient</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl w-[500px] shadow-2xl animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Upload Session Video</h2>
                    <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                </div>
                
                {isUploading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-brand-700 font-medium">Analyzing video with Gemini...</p>
                        <p className="text-sm text-gray-500">This may take a moment.</p>
                    </div>
                ) : (
                    <form onSubmit={handleUploadSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Session Title</label>
                            <input required value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. Weekly Check-in" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" required value={uploadDate} onChange={e => setUploadDate(e.target.value)} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                                <select required value={uploadStudentId} onChange={e => setUploadStudentId(e.target.value)} className="w-full p-2 border rounded">
                                    <option value="">Select...</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                            <input type="file" accept="video/*" required onChange={e => setUploadFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <UploadCloud className="mx-auto text-gray-400 mb-2" size={32} />
                            <p className="text-sm text-gray-600">{uploadFile ? uploadFile.name : "Click or drag video file here"}</p>
                        </div>
                        <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 shadow-lg shadow-brand-600/20">
                            Upload & Analyze
                        </button>
                    </form>
                )}
            </div>
        </div>
      )}
    </div>
  );
};
