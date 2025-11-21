
export enum UserRole {
  PATIENT = 'PATIENT',
  THERAPIST = 'THERAPIST'
}

export interface Patient {
  id: string;
  name: string;
  nickname?: string;
  status: 'Active' | 'On Hold' | 'Inactive';
  riskLevel: 'Low' | 'Medium' | 'High';
  nextSession: string;
  email: string;
  phone: string;
  avatarClass?: string; // For color coding placeholders
}

export interface Note {
  id: string;
  patientId: string; // To link to specific patient
  date: string;
  title: string;
  content: string;
  type: 'Journal' | 'Session Note' | 'Questionnaire';
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: 'Video' | 'In-Person';
  status: 'Upcoming' | 'Completed' | 'Cancelled';
}

export interface Homework {
  id: string;
  text: string;
  completed: boolean;
}

export interface Session {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  title: string;
  videoUrl?: string; // Blob URL or file path
  analysis: AnalysisResult;
  counselorNotes: string;
  studentNotes: string; // Notes visible to student
}

export interface AnalysisResult {
  summary: string;
  verbal_cues: Array<{
    timestamp: string;
    speaker: string;
    spoken_text: string;
    tone_analysis: string;
    intent_or_meaning: string;
  }>;
  nonverbal_cues: Array<{
    timestamp: string;
    person: string;
    expression: string;
    body_language: string;
    inferred_emotion: string;
    confidence: number;
  }>;
  emotions_over_time: Array<{
    timestamp: string;
    emotion: string;
    confidence: number;
    source: string;
  }>;
  conversation_dynamics: {
    dominance_or_control: string;
    rapport_level: string;
    conflict_points: string;
    supportive_behaviors: string;
  };
  environment_context: {
    setting_description: string;
    comfort_or_discomfort_signals: string;
  };
  overall_sentiment: string;
}