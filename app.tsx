import React, { useState, useEffect, useCallback, useRef } from 'react';
import InteractiveBackground from './components/InteractiveBackground.tsx';
import { MousePosition, GreetingState } from './types.ts';
import { fetchDynamicGreeting } from './services/geminiService.ts';

const App: React.FC = () => {
  const [mousePos, setMousePos] = useState<MousePosition>({ 
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, 
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 
  });
  const [greeting, setGreeting] = useState<GreetingState>({
    text: "Hey World",
    loading: false,
    error: null
  });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { clientX, clientY } = e;
    setMousePos({ x: clientX, y: clientY });

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const rotX = (clientY - centerY) / 30;
    const rotY = (centerX - clientX) / 30;
    setRotation({ x: rotX, y: rotY });
  }, []);

  const updateGreeting = useCallback(async () => {
    if (greeting.loading) return;
    setGreeting(prev => ({ ...prev, loading: true }));
    try {
      const newText = await fetchDynamicGreeting(mousePos, { w: window.innerWidth, h: window.innerHeight });
      setGreeting({
        text: newText,
        loading: false,
        error: null
      });
    } catch (err) {
      setGreeting(prev => ({ ...prev, loading: false, text: "Hello Again" }));
    }
  }, [mousePos, greeting.loading]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center select-none bg-[#050505]"
      onClick={updateGreeting}
    >
      <InteractiveBackground mousePos={mousePos} />
      
      <div 
        className="cursor-follower" 
        style={{ 
          transform: `translate(calc(${mousePos.x}px - 50%), calc(${mousePos.y}px - 50%))`
        }} 
      />

      <div 
        className="z-10 text-center transition-transform duration-300 ease-out pointer-events-none px-4"
        style={{ 
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
        }}
      >
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white opacity-95 transition-all duration-700 animate-float drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          {greeting.text}
        </h1>
        <p className="mt-8 text-indigo-400 font-light tracking-[0.6em] uppercase text-[10px] md:text-xs opacity-70">
          {greeting.loading ? "Shifting Reality..." : "Click anywhere to change the vibe"}
        </p>
      </div>

      <div className="absolute bottom-10 left-10 z-20 hidden md:flex flex-col gap-2 font-mono text-[10px] text-gray-500 uppercase tracking-widest border-l border-indigo-500/30 pl-4">
        <div className="flex gap-4">
          <span>POS_X</span>
          <span className="text-indigo-400">{Math.round(mousePos.x).toString().padStart(4, '0')}</span>
        </div>
        <div className="flex gap-4">
          <span>POS_Y</span>
          <span className="text-indigo-400">{Math.round(mousePos.y).toString().padStart(4, '0')}</span>
        </div>
      </div>

      <div className="absolute top-10 right-10 z-20 font-mono text-[10px] text-indigo-300/40 uppercase tracking-[0.3em]">
        Status: Online
      </div>
    </div>
  );
};

export default App;
