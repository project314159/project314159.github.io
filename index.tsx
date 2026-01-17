
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
interface MousePosition {
  x: number;
  y: number;
}

// --- Background Component ---
const InteractiveBackground: React.FC<{ mousePos: MousePosition }> = ({ mousePos }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<any[]>([]);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = ['#6366f1', '#a855f7', '#4f46e5', '#312e81'];

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.current = Array.from({ length: 100 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        originX: Math.random() * canvas.width,
        originY: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        size: Math.random() * 2 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current.forEach(p => {
        const dx = mousePos.x - p.x;
        const dy = mousePos.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 180) {
          const force = (180 - dist) / 180;
          p.vx -= (dx / dist) * force * 1.8;
          p.vy -= (dy / dist) * force * 1.8;
        }

        p.vx += (p.originX - p.x) * 0.015;
        p.vy += (p.originY - p.y) * 0.015;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', init);
    init();
    animate();
    return () => {
      window.removeEventListener('resize', init);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [mousePos]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

// --- Main Application ---
const App: React.FC = () => {
  const [mousePos, setMousePos] = useState<MousePosition>({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [greeting, setGreeting] = useState({ text: "Hey World", loading: false });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const fetchGreeting = async () => {
    if (greeting.loading) return;
    setGreeting(prev => ({ ...prev, loading: true }));
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const xRatio = mousePos.x / window.innerWidth;
      const vibe = xRatio < 0.5 ? "ethereal and whispery" : "neon and glitchy";
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a ultra-short 2-word greeting for the world. Theme: ${vibe}. No punctuation. Be creative.`,
      });

      const text = response.text || "Hey World";
      setGreeting({ text: text.trim(), loading: false });
    } catch (err) {
      console.error("Gemini Error:", err);
      setGreeting({ text: "Hello Again", loading: false });
    }
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const rX = (e.clientY - window.innerHeight / 2) / 40;
      const rY = (window.innerWidth / 2 - e.clientX) / 40;
      setRotation({ x: rX, y: rY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div 
      className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-[#050505] cursor-none"
      onClick={fetchGreeting}
    >
      <InteractiveBackground mousePos={mousePos} />
      
      <div 
        className="cursor-glow" 
        style={{ 
          transform: `translate(calc(${mousePos.x}px - 50%), calc(${mousePos.y}px - 50%))`
        }} 
      />

      <div 
        className="z-10 text-center pointer-events-none transition-transform duration-300 ease-out"
        style={{ transform: `perspective(1200px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
      >
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white animate-float drop-shadow-[0_0_30px_rgba(99,102,241,0.2)]">
          {greeting.text}
        </h1>
        <p className="mt-8 text-indigo-400 font-mono text-[9px] tracking-[1em] uppercase opacity-40">
          {greeting.loading ? "Synthesizing Node..." : "Initiate consciousness shift // Click"}
        </p>
      </div>

      {/* Interface Elements */}
      <div className="absolute top-10 left-10 z-20 font-mono text-[10px] text-indigo-500/30 uppercase tracking-widest hidden sm:block">
        V_0.8 // Neural Greeting System
      </div>
      
      <div className="absolute bottom-10 right-10 z-20 font-mono text-[10px] text-gray-700 tracking-[0.2em] hidden sm:block">
        X: {Math.round(mousePos.x)} | Y: {Math.round(mousePos.y)}
      </div>

      {/* Stylized Crosshair */}
      <div 
        className="fixed w-4 h-4 z-50 pointer-events-none"
        style={{ left: mousePos.x - 8, top: mousePos.y - 8 }}
      >
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/40"></div>
        <div className="absolute left-1/2 top-0 w-[1px] h-full bg-white/40"></div>
      </div>
    </div>
  );
};

// --- Mount with Error Checking ---
try {
  const rootEl = document.getElementById('root');
  if (rootEl) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(<App />);
  }
} catch (e) {
  console.error("Mounting error:", e);
}
