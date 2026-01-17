import React, { useState, useEffect, useCallback } from 'react';
import InteractiveBackground from './components/InteractiveBackground';
import { MousePosition, GreetingState } from './types';
import { fetchDynamicGreeting } from './services/geminiService';

const App: React.FC = () => {
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });
  const [greeting, setGreeting] = useState<GreetingState>({
    text: "Hey World",
    loading: false,
    error: null
  });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    const { clientX, clientY } = e;
    setMousePos({ x: clientX, y: clientY });

    // Calculate rotation for the heading
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const rotX = (clientY - centerY) / 25;
    const rotY = (centerX - clientX) / 25;
    setRotation({ x: rotX, y: rotY });
  };

  const updateGreeting = useCallback(async () => {
    if (greeting.loading) return;
    setGreeting(prev => ({ ...prev, loading: true }));
    const newText = await fetchDynamicGreeting(mousePos, { w: window.innerWidth, h: window.innerHeight });
    setGreeting({
      text: newText,
      loading: false,
      error: null
    });
  }, [mousePos, greeting.loading]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center select-none"
      onClick={updateGreeting}
    >
      {/* Background Layer */}
      <InteractiveBackground mousePos={mousePos} />
      
      {/* Glow Follower */}
      <div 
        className="cursor-follower" 
        style={{ 
          left: `${mousePos.x}px`, 
          top: `${mousePos.y}px` 
        }} 
      />

      {/* Main Content */}
      <div 
        className="z-10 text-center transition-transform duration-200 ease-out pointer-events-none"
        style={{ 
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
        }}
      >
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white opacity-90 transition-all duration-500">
          {greeting.text}
        </h1>
        <p className="mt-8 text-indigo-400 font-light tracking-[0.5em] uppercase text-xs animate-pulse">
          {greeting.loading ? "Generating Magic..." : "Click anywhere to shift the vibe"}
        </p>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-8 left-8 z-20 text-[10px] text-gray-600 font-mono tracking-widest uppercase flex flex-col gap-1">
        <span>X: {Math.round(mousePos.x)}</span>
        <span>Y: {Math.round(mousePos.y)}</span>
      </div>

      <div className="absolute bottom-8 right-8 z-20 text-[10px] text-indigo-900 font-mono tracking-widest uppercase">
        Built with Love
      </div>
    </div>
  );
};

export default App;
 
