import React from 'react';
import { AnalysisResult } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Brain, Activity, MessageCircle, Smile } from 'lucide-react';

interface Props {
  result: AnalysisResult;
  onClose: () => void;
}

export const AnalysisDisplay: React.FC<Props> = ({ result, onClose }) => {
  // Transform data for chart if timestamp is "MM:SS"
  const chartData = result.emotions_over_time.map(item => ({
    time: item.timestamp,
    confidence: item.confidence * 100,
    emotion: item.emotion,
    source: item.source
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-8 animate-fade-in">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="text-brand-600" />
            Session Insight Report
            </h2>
            <p className="text-gray-500 text-sm mt-1">Powered by Gemini 1.5 Flash</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close Report</button>
      </div>

      {/* Summary Section */}
      <div className="bg-brand-50 p-6 rounded-lg border border-brand-100">
        <h3 className="text-lg font-semibold text-brand-900 mb-2">Executive Summary</h3>
        <p className="text-brand-800 leading-relaxed">{result.summary}</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
           <div className="flex items-center gap-2 text-gray-500 mb-2">
             <Smile size={18} />
             <span className="text-sm font-medium">Overall Sentiment</span>
           </div>
           <div className="text-lg font-bold text-gray-800 capitalize">{result.overall_sentiment}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
           <div className="flex items-center gap-2 text-gray-500 mb-2">
             <Activity size={18} />
             <span className="text-sm font-medium">Rapport Level</span>
           </div>
           <div className="text-lg font-bold text-gray-800">{result.conversation_dynamics.rapport_level}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
           <div className="flex items-center gap-2 text-gray-500 mb-2">
             <MessageCircle size={18} />
             <span className="text-sm font-medium">Dominant Speaker</span>
           </div>
           <div className="text-lg font-bold text-gray-800 truncate">{result.conversation_dynamics.dominance_or_control}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Emotional Intensity Over Time</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="time" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Line type="monotone" dataKey="confidence" name="Intensity (%)" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Cues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <h3 className="text-lg font-semibold mb-4">Verbal Cues</h3>
            <div className="space-y-3 h-64 overflow-y-auto pr-2 custom-scrollbar">
                {result.verbal_cues.map((cue, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-100 text-sm">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{cue.timestamp}</span>
                            <span className="font-medium text-gray-700">{cue.speaker}</span>
                        </div>
                        <p className="italic text-gray-600">"{cue.spoken_text}"</p>
                        <div className="mt-2 text-xs bg-white p-1 rounded inline-block border text-teal-600">
                            {cue.intent_or_meaning}
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold mb-4">Non-Verbal Signals</h3>
            <div className="space-y-3 h-64 overflow-y-auto pr-2 custom-scrollbar">
                {result.nonverbal_cues.map((cue, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-100 text-sm">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{cue.timestamp}</span>
                            <span className="font-medium text-gray-700">{cue.person}</span>
                        </div>
                        <div className="flex items-start gap-2">
                           <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs whitespace-nowrap">{cue.inferred_emotion}</span>
                           <p className="text-gray-600">{cue.body_language}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
