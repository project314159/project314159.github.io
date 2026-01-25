import React, { useState } from 'react';

interface Props {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<Props> = ({ onSearch, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative z-20">
      <form onSubmit={handleSubmit} className="relative group">
        
        {/* Subtle Glow behind */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
        
        <div className="relative flex items-center bg-[#0a0a0a] rounded-full border border-white/10 transition-all duration-300 focus-within:border-white/20 shadow-lg shadow-black/50">
          
          <div className="pl-6 text-white/40">
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>

          <input
            type="text"
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-white/30 px-4 py-4 text-lg font-sans outline-none w-full"
            placeholder="What do you want to research?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          
          <div className="pr-2">
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`p-2 rounded-full transition-all duration-300 ${
                input.trim() ? 'bg-white text-black hover:scale-105' : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5 transform -rotate-45 translate-x-[1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
