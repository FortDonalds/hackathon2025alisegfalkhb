
import React, { useState } from 'react';
import { Patient, Note, Appointment } from '../types';
import { ArrowLeft, Mail, Phone, Calendar, AlertTriangle, FileText, Plus, Clock } from 'lucide-react';

interface Props {
  patient: Patient;
  notes: Note[];
  onBack: () => void;
  onUpdatePatient: (updated: Patient) => void;
  onAddSession: (patientId: string, date: string, time: string) => void;
}

export const PatientProfile: React.FC<Props> = ({ patient, notes, onBack, onUpdatePatient, onAddSession }) => {
  const [riskLevel, setRiskLevel] = useState(patient.riskLevel);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newSessionTime, setNewSessionTime] = useState('');

  const handleRiskChange = (newRisk: 'Low' | 'Medium' | 'High') => {
    setRiskLevel(newRisk);
    onUpdatePatient({ ...patient, riskLevel: newRisk });
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if(newSessionDate && newSessionTime) {
        onAddSession(patient.id, newSessionDate, newSessionTime);
        setShowSessionForm(false);
        setNewSessionDate('');
        setNewSessionTime('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="border-b border-gray-200 p-6 flex items-center justify-between bg-gray-50 rounded-t-xl">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1"><Mail size={14} /> {patient.email}</span>
              <span className="flex items-center gap-1"><Phone size={14} /> {patient.phone}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Risk Level</span>
            <select 
              value={riskLevel}
              onChange={(e) => handleRiskChange(e.target.value as any)}
              className={`mt-1 block w-32 px-3 py-1 text-sm font-medium rounded border-0 ring-1 ring-inset focus:ring-2 sm:leading-6 cursor-pointer ${
                riskLevel === 'High' ? 'bg-red-50 text-red-700 ring-red-600/20' : 
                riskLevel === 'Medium' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' : 
                'bg-blue-50 text-blue-700 ring-blue-600/20'
              }`}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Left Sidebar: Sessions & Actions */}
        <div className="p-6 border-r border-gray-200 lg:col-span-1 space-y-8">
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-brand-600" /> Next Session
            </h3>
            <div className="bg-brand-50 p-4 rounded-lg border border-brand-100 text-center">
                <p className="text-lg font-bold text-brand-900">{patient.nextSession || "Not Scheduled"}</p>
                {patient.nextSession && <p className="text-xs text-brand-600 mt-1">Video Session</p>}
            </div>
          </div>

          <div>
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Actions</h3>
             </div>
             <button 
                onClick={() => setShowSessionForm(!showSessionForm)}
                className="w-full py-2 px-4 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
             >
               <Plus size={16} /> Schedule New Session
             </button>
             
             {showSessionForm && (
                <form onSubmit={handleAddSession} className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-medium text-gray-500">Date</label>
                            <input 
                                type="date" 
                                required
                                value={newSessionDate}
                                onChange={e => setNewSessionDate(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Time</label>
                            <input 
                                type="time" 
                                required
                                value={newSessionTime}
                                onChange={e => setNewSessionTime(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded bg-white"
                            />
                        </div>
                        <button type="submit" className="w-full bg-brand-600 text-white text-sm py-2 rounded hover:bg-brand-700">
                            Confirm Schedule
                        </button>
                    </div>
                </form>
             )}
          </div>
        </div>

        {/* Right Content: Patient Journals & History */}
        <div className="p-6 lg:col-span-2 bg-gray-50/50">
           <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-teal-600" /> Patient Journal & Notes
           </h3>
           <div className="space-y-4 h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {notes.length === 0 ? (
                  <p className="text-gray-500 text-center py-10 italic">No journal entries or notes found for this patient.</p>
              ) : (
                  notes.map(note => (
                    <div key={note.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-gray-900">{note.title}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${note.type === 'Questionnaire' ? 'bg-purple-100 text-purple-700' : 'bg-teal-50 text-teal-700'}`}>
                                    {note.type}
                                </span>
                            </div>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock size={12} /> {note.date}
                            </span>
                        </div>
                        <div className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed mt-3 pl-3 border-l-2 border-gray-100">
                            {note.content}
                        </div>
                    </div>
                  ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
