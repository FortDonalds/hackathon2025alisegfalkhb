
import React, { useState } from 'react';
import { ClipboardList, Save, X } from 'lucide-react';

interface Props {
  onSave: (answers: any) => void;
  onCancel: () => void;
}

export const Questionnaire: React.FC<Props> = ({ onSave, onCancel }) => {
  const [mood,QV] = useState(5);
  const [sleep, setSleep] = useState('');
  const [topics, setTopics] = useState('');
  const [anxietyLevel, setAnxietyLevel] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      mood,
      sleep,
      topics,
      anxietyLevel,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="bg-brand-600 p-6 text-white flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList /> Pre-Session Check-in
          </h2>
          <p className="text-brand-100 mt-1">Help Dr. Thompson understand how you've been feeling.</p>
        </div>
        <button onClick={onCancel} className="text-brand-100 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">How would you rate your mood today? (1-10)</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={mood} 
            onChange={(e) => QV(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Very Low</span>
            <span className="font-bold text-brand-600 text-lg">{mood}</span>
            <span>Excellent</span>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Current Anxiety Level (1-5)</label>
          <div className="flex gap-4 justify-between">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setAnxietyLevel(level)}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                  anxietyLevel === level 
                    ? 'bg-brand-600 text-white ring-4 ring-brand-100 transform scale-110' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">How many hours did you sleep last night?</label>
          <select 
            value={sleep} 
            onChange={(e) => setSleep(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
            required
          >
            <option value="">Select duration...</option>
            <option value="<4">Less than 4 hours</option>
            <option value="4-6">4-6 hours</option>
            <option value="6-8">6-8 hours</option>
            <option value="8+">8+ hours</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Is there a specific topic you want to discuss today?</label>
          <textarea 
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="e.g., Work stress, Family conflict..."
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg h-24 resize-none focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 flex items-center gap-2 shadow-lg shadow-brand-600/20">
            <Save size={18} /> Submit Check-in
          </button>
        </div>
      </form>
    </div>
  );
};
