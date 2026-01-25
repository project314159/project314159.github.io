import React from 'react';
import { ResearchLink } from '../types';

interface Props {
  portal: ResearchLink;
  delay: number;
}

const ArticleCard: React.FC<Props> = ({ portal, delay }) => {
  // Helper to determine badge color
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'scholar': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'ai': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'bio': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'code': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-white/10 text-white/60 border-white/10';
    }
  };

  return (
    <a 
      href={portal.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="h-full bg-[#0f0f10] border border-white/10 hover:border-white/20 rounded-xl p-6 transition-all duration-300 ease-out flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 hover:bg-[#141415]">
        
        <div className="flex justify-between items-start mb-4">
          <div className={`
            px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border
            ${getBadgeStyle(portal.type)}
          `}>
            {portal.type}
          </div>
          <svg className="w-4 h-4 text-white/20 group-hover:text-white/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>

        <h3 className="text-lg font-medium text-white mb-2 group-hover:text-primary transition-colors leading-tight">
          {portal.title}
        </h3>
        
        <p className="text-sm text-white/40 leading-relaxed mb-4 flex-grow font-light">
          {portal.description}
        </p>

        <div className="pt-4 border-t border-white/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
            <span className="text-xs font-mono text-white/30 group-hover:text-white/50 transition-colors uppercase">
            {portal.source}
            </span>
        </div>
      </div>
    </a>
  );
};

export default ArticleCard;
