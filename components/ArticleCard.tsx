import React from 'react';
import { ResearchLink } from '../types';

interface Props {
  portal: ResearchLink;
  delay: number;
}

const ArticleCard: React.FC<Props> = ({ portal, delay }) => {
  return (
    <a 
      href={portal.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="h-full glass glass-hover rounded-2xl p-6 transition-all duration-500 ease-out flex flex-col hover:-translate-y-1">
        
        <div className="flex justify-between items-start mb-4">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
            ${portal.type === 'scholar' ? 'bg-blue-500/10 text-blue-400' : ''}
            ${portal.type === 'database' ? 'bg-purple-500/10 text-purple-400' : ''}
            ${portal.type === 'code' ? 'bg-emerald-500/10 text-emerald-400' : ''}
          `}>
            {portal.type[0].toUpperCase()}
          </div>
          <svg className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>

        <h3 className="text-lg font-medium text-white mb-2 group-hover:text-primary transition-colors">
          {portal.title}
        </h3>
        
        <p className="text-sm text-white/50 leading-relaxed mb-4 flex-grow">
          {portal.description}
        </p>

        <span className="text-xs font-medium text-white/30 group-hover:text-white/60 transition-colors">
          {portal.source}
        </span>
      </div>
    </a>
  );
};

export default ArticleCard;
