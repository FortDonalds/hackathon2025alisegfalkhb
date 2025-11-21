import { AnalysisResult } from '../types';

const AI_API_URL = 'http://localhost:8000';

export const uploadVideoForAnalysis = async (videoBlob: Blob):Promise<AnalysisResult> => {
  const formData = new FormData();
  // Append the video blob. Ensure filename ends with .webm or similar supported format
  formData.append('file', videoBlob, 'session_recording.webm');

  try {
    const response = await fetch(`${AI_API_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // The Python server returns { analysis: string_json } where string_json needs parsing
    if (typeof data.analysis === 'string') {
        let cleanJson = data.analysis.replace(/```json\n/g, '').replace(/\n```/g, '');
        return JSON.parse(cleanJson);
    }
    return data;
  } catch (error) {
    console.warn("Backend analysis unavailable, using mock data for demonstration.");
    
    // Return mock data so the UI can be tested
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          summary: "Simulation: The patient demonstrated clear signs of progress in emotional regulation. Primary stressors identified were work-life balance and social anxiety.",
          verbal_cues: [
            { timestamp: "02:15", speaker: "Patient", spoken_text: "I feel much better about the situation.", tone_analysis: "Steady, Calm", intent_or_meaning: "Expressing relief" },
            { timestamp: "05:30", speaker: "Patient", spoken_text: "But I still worry sometimes.", tone_analysis: "Hesitant, Lower volume", intent_or_meaning: "Admitting lingering insecurity" }
          ],
          nonverbal_cues: [
            { timestamp: "02:15", person: "Patient", expression: "Smile", body_language: "Open posture", inferred_emotion: "Happiness", confidence: 0.9 },
            { timestamp: "05:30", person: "Patient", expression: "Frown", body_language: "Looking down", inferred_emotion: "Worry", confidence: 0.85 }
          ],
          emotions_over_time: [
            { timestamp: "00:00", emotion: "Neutral", confidence: 0.7, source: "Visual" },
            { timestamp: "05:00", emotion: "Anxious", confidence: 0.6, source: "Audio" },
            { timestamp: "10:00", emotion: "Relieved", confidence: 0.9, source: "Both" }
          ],
          conversation_dynamics: {
            dominance_or_control: "Balanced",
            rapport_level: "High",
            conflict_points: "None",
            supportive_behaviors: "Therapist validated patient feelings multiple times."
          },
          environment_context: {
            setting_description: "Indoor, quiet room",
            comfort_or_discomfort_signals: "Patient appears comfortable"
          },
          overall_sentiment: "Positive"
        });
      }, 2000);
    });
  }
};