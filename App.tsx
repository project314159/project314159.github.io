import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import ArticleCard from './components/ArticleCard';
import ChatGPTBridge from './components/ChatGPTBridge';
import Scribble from './components/Scribble';
import MathViz from './components/MathViz';
import { fetchResearchData } from './services/geminiService';
import { SearchState, HistoryItem } from './types';

const App: React.FC = () => {
  const [searchState, setSearchState] = useState<SearchState>({
    status: 'idle',
    data: null,
  });
  const [showAbout, setShowAbout] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('research_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  // Handle Hash Navigation (Deep Linking for GitHub Pages compatibility)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1); // Remove #
      if (hash) {
        const decodedQuery = decodeURIComponent(hash.replace(/_/g, ' '));
        // We pass false to updateUrl to prevent infinite loop
        handleSearch(decodedQuery, false);
      } else {
        setSearchState({ status: 'idle', data: null });
      }
    };

    // Handle initial hash on load
    const initialHash = window.location.hash.substring(1);
    if (initialHash) {
       handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const addToHistory = (query: string) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item.query.toLowerCase() !== query.toLowerCase());
      const newHistory = [{ query, timestamp: Date.now() }, ...filtered].slice(0, 10);
      localStorage.setItem('research_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const handleSearch = async (searchTerm: string, updateUrl: boolean = true) => {
    const formattedTerm = searchTerm.trim();
    if (!formattedTerm) return;

    // If triggered by UI, update hash and let the listener trigger the actual search
    // This avoids "pushState" security errors in sandboxed environments
    if (updateUrl) {
      try {
        const encodedTerm = encodeURIComponent(formattedTerm.replace(/ /g, '_'));
        const targetHash = `#${encodedTerm}`;
        
        if (window.location.hash !== targetHash) {
          window.location.hash = targetHash;
          return; // Stop here, the hashchange listener will call handleSearch(term, false)
        }
      } catch (e) {
        console.warn("Navigation error:", e);
        // Fall through to manual search if hash update fails
      }
    }

    setSearchState({ status: 'loading', data: null });

    try {
      const data = await fetchResearchData(formattedTerm);
      setSearchState({ status: 'success', data });
      addToHistory(data.topic);
    } catch (err: any) {
      setSearchState({ status: 'error', data: null, error: err.message || "Something went wrong." });
    }
  };

  const aboutText = "an independent experiment by Dhruv Saxena, powered by Distributed Knowledge Graph. Designed for rapid, deep-context acquisition.";

  return (
    <div className="min-h-screen selection:bg-primary/30 selection:text-white font-sans overflow-x-hidden relative bg-background text-white">
      
      {/* About Overlay */}
      {showAbout && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-fade-in cursor-pointer"
          onClick={() => setShowAbout(false)}
        >
          <div className="max-w-2xl text-center">
            <h2 className="text-3xl font-display mb-6">About the Architecture</h2>
            <p className="text-xl font-light leading-relaxed text-white/70">
              {aboutText}
            </p>
            <div className="mt-12 text-sm text-white/30 font-mono">
              [Click to close]
            </div>
          </div>
        </div>
      )}

      {/* History Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-[90] w-80 bg-[#0a0a0a] border-l border-white/5 transform transition-transform duration-500 ease-out p-8 ${showHistory ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="flex justify-between items-center mb-8">
           <h3 className="text-lg font-display text-white/80">Search History</h3>
           <button onClick={() => setShowHistory(false)} className="text-white/40 hover:text-white">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
         </div>
         <div className="space-y-4">
           {history.length === 0 && <p className="text-white/20 text-sm">No recent searches.</p>}
           {history.map((item, idx) => (
             <button 
                key={idx}
                onClick={() => {
                  handleSearch(item.query);
                  setShowHistory(false);
                }}
                className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
             >
                <div className="text-sm font-medium text-white/90 group-hover:text-primary transition-colors truncate">{item.query}</div>
                <div className="text-xs text-white/30 mt-1">{new Date(item.timestamp).toLocaleDateString()}</div>
             </button>
           ))}
         </div>
      </div>

      {/* Subtle Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60vw] h-[60vh] bg-primary/5 rounded-full blur-[150px] opacity-30"></div>
         <div className="absolute bottom-[-10%] right-0 w-[40vw] h-[40vh] bg-accent/5 rounded-full blur-[150px] opacity-20"></div>
      </div>

      <nav className="relative z-50 w-full px-8 py-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
          setSearchState({status: 'idle', data: null});
          window.location.hash = '';
        }}>
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white/80 font-display">π</div>
          <div className="text-lg font-display font-medium tracking-tight text-white/90">
            Project<span className="text-white/40">314159</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowHistory(true)}
            className="text-sm font-medium text-white/50 hover:text-white transition-colors focus:outline-none flex items-center gap-2"
          >
            <span>History</span>
          </button>
          <button 
            onClick={() => setShowAbout(true)} 
            className="text-sm font-medium text-white/50 hover:text-white transition-colors focus:outline-none"
          >
            About
          </button>
        </div>
      </nav>

      <main className="relative z-10 w-full px-6 md:px-12 py-12 max-w-6xl mx-auto flex flex-col min-h-[80vh]">
        
        {/* Hero Section */}
        <div className={`relative transition-all duration-1000 ease-out flex flex-col items-center justify-center ${searchState.status === 'idle' ? 'flex-grow min-h-[50vh]' : 'mb-16'}`}>
          
          {searchState.status === 'idle' && <Scribble />}

          <div className="text-center w-full relative z-10">
            {searchState.status === 'idle' && (
              <div className="mb-12 space-y-4 animate-fade-in">
                <h1 className="text-5xl md:text-7xl font-display font-medium text-white tracking-tight glow-text">
                  Flow into discovery.
                </h1>
                <p className="text-lg text-white/40 max-w-xl mx-auto font-light">
                  Decentralized Research & Visualization Node
                </p>
              </div>
            )}
            
            <SearchBar onSearch={(q) => handleSearch(q, true)} isLoading={searchState.status === 'loading'} />
            
            {/* Quick Links for History in Idle State */}
            {searchState.status === 'idle' && history.length > 0 && (
              <div className="mt-8 flex justify-center flex-wrap gap-2 animate-fade-in" style={{animationDelay: '0.2s'}}>
                {history.slice(0, 3).map((h, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSearch(h.query)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                  >
                    {h.query}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error State */}
        {searchState.status === 'error' && (
           <div className="w-full text-center p-6 bg-red-900/10 rounded-2xl border border-red-500/10 text-red-200 animate-fade-in max-w-2xl mx-auto">
             <div className="mb-2 text-xl">⚠️ Connection Error</div>
             {searchState.error}
           </div>
        )}

        {/* Results Content */}
        {searchState.status === 'success' && searchState.data && (
          <div className="animate-fade-in w-full space-y-24 pb-24">
            
            {/* 1. Overview Section */}
            <div className="text-center max-w-4xl mx-auto relative">
               {/* Category Badge */}
               {searchState.data.category && searchState.data.category !== 'general' && (
                 <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold tracking-widest text-primary uppercase mb-8">
                   {searchState.data.category} DOMAIN
                 </span>
               )}

               <h2 className="text-4xl md:text-7xl font-display font-medium text-white mb-8 tracking-tight">
                 {searchState.data.topic}
               </h2>
               
               <div className="prose prose-invert prose-lg max-w-none text-white/70 font-light leading-relaxed">
                 {searchState.data.overview}
               </div>

               <div className="mt-8 flex justify-center gap-4">
                  <a href={searchState.data.wikipediaUrl} target="_blank" rel="noreferrer" className="text-xs text-white/30 hover:text-white transition-colors underline decoration-white/10 underline-offset-4">
                    Read full entry on Wikipedia
                  </a>
                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Link copied to clipboard!");
                    }}
                    className="text-xs text-white/30 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    Copy Link
                  </button>
               </div>
               
               {/* Related Terms as Chips */}
               <div className="flex flex-wrap justify-center gap-3 mt-12">
                 {searchState.data.relatedTerms.map((term, i) => (
                   <button 
                      key={i} 
                      onClick={() => handleSearch(term)}
                      className="px-5 py-2.5 bg-[#111] hover:bg-[#222] border border-white/5 hover:border-white/20 rounded-lg text-sm text-white/60 hover:text-white transition-all duration-300"
                   >
                     {term}
                   </button>
                 ))}
               </div>
            </div>

            {/* 2. Visuals: Math or Image */}
            {searchState.data.isMath && searchState.data.mathExpression && (
              <MathViz expression={searchState.data.mathExpression} />
            )}

            {!searchState.data.isMath && searchState.data.imageUrl && (
              <div className="w-full max-w-5xl mx-auto h-[500px] rounded-3xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
                <img 
                  src={searchState.data.imageUrl} 
                  alt={searchState.data.topic} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700 grayscale hover:grayscale-0"
                />
              </div>
            )}

            {/* 3. Portals Grid */}
            <div className="max-w-6xl mx-auto">
               <div className="flex items-end justify-between mb-10 px-2 border-b border-white/10 pb-4">
                 <h3 className="text-2xl font-display text-white">Research Portals</h3>
                 <span className="text-xs font-mono text-white/40">SECURE LINKS GENERATED</span>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {searchState.data.portals.map((portal, idx) => (
                   <ArticleCard key={idx} portal={portal} delay={idx * 100} />
                 ))}
               </div>
            </div>

            {/* 4. Deep Dive Action */}
            <ChatGPTBridge data={searchState.data} />
            
          </div>
        )}
      </main>

      <footer className="w-full py-12 text-center text-white/20 text-xs font-mono border-t border-white/5 mt-auto">
        <p>PROJECT_314159 // V2.0 // GITHUB_DEPLOY_READY</p>
      </footer>
    </div>
  );
};

export default App;
