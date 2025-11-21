
import React, { useState } from 'react';
import { UserRole, AnalysisResult, Patient, Note, Appointment, Session } from './types';
import { TherapistDashboard } from './components/TherapistDashboard';
import { PatientDashboard } from './components/PatientDashboard';
import { PatientProfile } from './components/PatientProfile';
import { Questionnaire } from './components/Questionnaire';
import { VideoRoom } from './components/VideoRoom';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { SessionDetail } from './components/SessionDetail';
import { Activity, LogOut, UserCircle, X } from 'lucide-react';

// Mock Initial Data
const INITIAL_PATIENTS: Patient[] = [
  { id: '1', name: 'Sarah Miller', status: 'Active', riskLevel: 'Low', nextSession: 'Today, 2:00 PM', email: 'sarah.m@gmail.com', phone: '(555) 123-4567', avatarClass: 'bg-teal-500', nickname: 'Sarah' },
  { id: '2', name: 'James Chen', status: 'Active', riskLevel: 'Medium', nextSession: 'Tomorrow, 10:00 AM', email: 'j.chen@work.com', phone: '(555) 987-6543', avatarClass: 'bg-indigo-500' },
];

const INITIAL_NOTES: Note[] = [
  { id: '1', patientId: '1', title: 'Morning Anxiety', date: 'Oct 23', content: 'Felt a bit overwhelmed today when thinking about the presentation...', type: 'Journal' }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: '101', patientId: '1', patientName: 'Sarah Miller', date: new Date().toISOString().split('T')[0], time: '14:00', type: 'Video', status: 'Upcoming' },
];

const INITIAL_SESSIONS: Session[] = [];

type ViewState = 'dashboard' | 'session' | 'analysis' | 'profile' | 'questionnaire' | 'sessionDetail';

function App() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);

  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // Patient Profile Modal
  const [showPatientProfileModal, setShowPatientProfileModal] = useState(false);
  const [patientProfileName, setPatientProfileName] = useState('Sarah Miller');
  const [patientProfileNickname, setPatientProfileNickname] = useState('Sarah');

  // Therapist Dashboard Active Tab (lifted to allow navigation after recording)
  const [therapistActiveTab, setTherapistActiveTab] = useState<'patients' | 'schedule' | 'sessions'>('schedule');

  const toggleRole = (newRole: UserRole) => {
    setRole(newRole);
    setCurrentView('dashboard');
    setSelectedPatientId(null);
  };

  const handleStartSession = () => {
    setCurrentView('session');
    setAnalysisResult(null);
  };

  const handleLeaveSession = () => {
    setCurrentView('dashboard');
  };

  const handleAnalysisComplete = (result: AnalysisResult, videoBlob: Blob) => {
    // Create a new session record automatically
    const newSession: Session = {
        id: Date.now().toString(),
        patientId: '1', // Default to Sarah for this demo
        patientName: 'Sarah Miller',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}),
        title: 'Live Video Session',
        videoBlob: videoBlob,
        videoUrl: URL.createObjectURL(videoBlob),
        analysis: result,
        counselorNotes: '',
        studentNotes: ''
    };

    setSessions([newSession, ...sessions]);
    
    // Switch view to Therapist Session List so they can see it
    setRole(UserRole.THERAPIST); // Ensure we are in therapist view to see the result
    setTherapistActiveTab('sessions');
    setCurrentView('dashboard');
  };

  // --- Patient Actions ---
  const handleSaveNote = (title: string, content: string) => {
    const newNote: Note = {
        id: Date.now().toString(),
        patientId: '1',
        title,
        content,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        type: 'Journal'
    };
    setNotes([newNote, ...notes]);
  };

  const handleSaveQuestionnaire = (answers: any) => {
    const summary = `Mood: ${answers.mood}/10\nAnxiety: ${answers.anxietyLevel}/5\nSleep: ${answers.sleep}\nTopic: ${answers.topics}`;
    const newNote: Note = {
        id: Date.now().toString(),
        patientId: '1',
        title: 'Pre-Session Check-in',
        content: summary,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        type: 'Questionnaire'
    };
    setNotes([newNote, ...notes]);
    setCurrentView('dashboard');
  };

  const handleSavePatientProfile = () => {
    const me = patients.find(p => p.id === '1');
    if (me) {
        setPatients(patients.map(p => p.id === '1' ? { ...p, name: patientProfileName, nickname: patientProfileNickname } : p));
    }
    setShowPatientProfileModal(false);
  };

  // --- Therapist Actions ---
  const handleViewPatient = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setCurrentView('profile');
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const handleAddPatient = (patient: Patient) => {
    setPatients([...patients, patient]);
  };

  const handleSessionCreated = (session: Session) => {
    setSessions([session, ...sessions]);
  };

  const handleViewSession = (session: Session) => {
    setSelectedSession(session);
    setCurrentView('sessionDetail');
  };

  const handleUpdateSession = (updated: Session) => {
    setSessions(sessions.map(s => s.id === updated.id ? updated : s));
    setSelectedSession(updated);
  };

  const handleAddSession = (patientId: string, date: string, time: string) => {
    const patient = patients.find(p => p.id === patientId);
    if(!patient) return;
    const newApt: Appointment = {
        id: Date.now().toString(),
        patientId,
        patientName: patient.name,
        date,
        time,
        type: 'Video',
        status: 'Upcoming'
    };
    setAppointments([...appointments, newApt]);
    handleUpdatePatient({ ...patient, nextSession: `${new Date(date).toLocaleDateString('en-US', {weekday: 'short'})}, ${time}` });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center text-white shadow-md">
                <Activity size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">Mirror<span className="text-brand-600">AI</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            {currentView !== 'session' && (
                <div className="hidden md:flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => toggleRole(UserRole.PATIENT)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${role === UserRole.PATIENT ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'}`}>Patient View</button>
                    <button onClick={() => toggleRole(UserRole.THERAPIST)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${role === UserRole.THERAPIST ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'}`}>Therapist View</button>
                </div>
            )}
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                <UserCircle className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{role === UserRole.PATIENT ? patients.find(p=>p.id==='1')?.nickname : 'Dr. Thompson'}</span>
                <button title="Sign Out" className="ml-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                    <LogOut size={18} />
                </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'session' ? (
            <div className="h-[calc(100vh-8rem)] animate-in fade-in duration-500">
                <VideoRoom onLeave={handleLeaveSession} onAnalysisComplete={handleAnalysisComplete} />
            </div>
        ) : currentView === 'analysis' && analysisResult ? (
            <AnalysisDisplay result={analysisResult} onClose={() => setCurrentView('dashboard')} />
        ) : currentView === 'questionnaire' ? (
            <Questionnaire onSave={handleSaveQuestionnaire} onCancel={() => setCurrentView('dashboard')} />
        ) : role === UserRole.THERAPIST ? (
            currentView === 'profile' && selectedPatientId ? (
                <PatientProfile 
                    patient={patients.find(p => p.id === selectedPatientId)!}
                    notes={notes.filter(n => n.patientId === selectedPatientId)}
                    onBack={() => setCurrentView('dashboard')}
                    onUpdatePatient={handleUpdatePatient}
                    onAddSession={handleAddSession}
                />
            ) : currentView === 'sessionDetail' && selectedSession ? (
                <SessionDetail 
                    session={selectedSession}
                    onBack={() => setCurrentView('dashboard')}
                    onUpdateSession={handleUpdateSession}
                />
            ) : (
                <TherapistDashboard 
                    onStartSession={handleStartSession} 
                    patients={patients}
                    appointments={appointments}
                    sessions={sessions}
                    onViewPatient={handleViewPatient}
                    onAddPatient={handleAddPatient}
                    onSessionCreated={handleSessionCreated}
                    onViewSession={handleViewSession}
                    activeTab={therapistActiveTab} 
                    setActiveTab={setTherapistActiveTab}
                />
            )
        ) : (
            <PatientDashboard 
                onStartSession={handleStartSession} 
                onStartQuestionnaire={() => setCurrentView('questionnaire')}
                onOpenProfile={() => setShowPatientProfileModal(true)}
                notes={notes.filter(n => n.patientId === '1')}
                onSaveNote={handleSaveNote}
                lastSession={sessions.filter(s => s.patientId === '1')[0]}
            />
        )}
      </main>

      {/* Patient Profile Edit Modal */}
      {showPatientProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-96 shadow-xl animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Edit Profile</h2>
                    <button onClick={() => setShowPatientProfileModal(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input className="w-full border rounded p-2" value={patientProfileName} onChange={e => setPatientProfileName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
                        <input className="w-full border rounded p-2" value={patientProfileNickname} onChange={e => setPatientProfileNickname(e.target.value)} />
                    </div>
                    <button onClick={handleSavePatientProfile} className="w-full bg-brand-600 text-white py-2 rounded font-medium hover:bg-brand-700">Save Changes</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default App;
