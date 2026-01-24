import React from 'react';
import { ResearchData } from '../types';

interface Props {
  data: ResearchData;
}

const ChatGPTBridge: React.FC<Props> = ({ data }) => {
  const handleRedirect = () => {
    const prompt = `
Act as a Principal Investigator. I am researching "${data.topic}".

Context Provided (Source: Wikipedia):
"${data.overview.substring(0, 1000)}..."

Task:
1. Identify the key academic debates currently surrounding this topic.
2. Outline 3 potential PhD thesis directions that identify gaps in the current literature.
3. Suggest a cross-disciplinary approach combining this topic with AI or Material Science.
4. Provide a list of 5 seminal keywords to search for in Google Scholar.

Tone: Rigorous, Technical, Forward-looking.
    `.trim();

    navigator.clipboard.writeText(prompt).then(() => {
      window.open(`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`, '_blank');
    });
  };

  return (
    <div className="mt-20 flex justify-center animate-fade-in" style={{ animationDelay: '600ms' }}>
      <button 
        onClick={handleRedirect}
        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-medium transition-transform duration-300 hover:scale-105 active:scale-95"
      >
        <span className="relative z-10">Generate Deep Synthesis</span>
        <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" /></svg>
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full blur-lg bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>
    </div>
  );
};

export default ChatGPTBridge;
