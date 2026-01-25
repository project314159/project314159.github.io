import React from 'react';
import { ResearchData } from '../types';

interface Props {
  data: ResearchData;
}

const ChatGPTBridge: React.FC<Props> = ({ data }) => {
  const handleRedirect = () => {
    // Highly engineered prompt for academic context
    const prompt = `
Role: Senior Research Scientist / Principal Investigator
Topic: ${data.topic}

Objective: Provide a rigorous academic synthesis of the current state of research for this topic.

Input Context:
"${data.overview.substring(0, 500)}..."

Requirements:
1.  **Literature Gap Analysis**: Identify 3 specific areas where current research is inconclusive or conflicting.
2.  **Key Methodology Table**: Create a markdown table comparing the top 3 standard methodologies/approaches used to study this, including pros/cons.
3.  **Interdisciplinary Fusion**: Propose a novel research direction combining "${data.topic}" with Artificial Intelligence or Material Science.
4.  **PhD Thesis Proposals**: Outline 2 concrete, viable titles for a modern PhD thesis on this topic.

Format: Markdown, Technical, Concise.
    `.trim();

    navigator.clipboard.writeText(prompt).then(() => {
      window.open(`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`, '_blank');
    });
  };

  return (
    <div className="mt-20 mb-12 flex justify-center animate-fade-in" style={{ animationDelay: '600ms' }}>
      <button 
        onClick={handleRedirect}
        className="group relative inline-flex items-center gap-4 px-10 py-5 bg-white text-black rounded-lg font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)]"
      >
        <div className="flex flex-col items-start">
            <span className="text-xs font-bold tracking-widest uppercase opacity-50">LLM Bridge</span>
            <span className="text-lg font-display font-bold">Generate Deep Synthesis</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center transform group-hover:rotate-45 transition-transform duration-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </button>
    </div>
  );
};

export default ChatGPTBridge;
