
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
interface MousePosition {
  x: number;
  y: number;
}

interface GreetingState {
  text: string;
  loading: boolean;
  error: string | null;
}

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

// --- Gemini Service ---
const fetchDynamicGreeting = async (position: MousePosition, windowSize: { w: number, h: number }): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const xRatio = position.x / windowSize.w;
    const yRatio = position.y / windowSize.h;
    
    let vibe = "mysterious";
    if (xRatio < 0.5 && yRatio < 0.5) vibe = "optimistic and bright";
    else if (xRatio >= 0.5 && yRatio < 0.5) vibe = "cyberpunk and neon-soaked";
    else if (xRatio < 0.5 && yRatio >= 0.5) vibe = "calm, zen and ethereal";
    else vibe = "bold, futuristic and aggressive";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a creative, short greeting that says "Hello" or "Hey" to the world. Theme: ${vibe}. Max 4 words. No terminal punctuation. Be innovative.`,
      config: {
        temperature: 0.9,
      }
    });

    return response.text?.trim().replace(/[".]/g, '') || "Hey World";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Hello Reality";
  }
};

// --- Components ---

const InteractiveBackground: React.FC<{ mousePos: MousePosition }> = ({ mousePos }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = ['#4f46e5', '#818cf8', '#6366f1', '#a855f7'];

    const initParticles = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const p: Particle[] = [];
      const count = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 8000), 200);
      for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        p.push({
          x, y,
          originX: x,
          originY: y,
          vx: 0,
          vy: 0,
          size: Math.random() * 1.5 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      particles.current = p;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach(p => {
        const dx = mousePos.x - p.x;
        const dy = mousePos.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 180;

        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          const angle = Math.atan2(dy, dx);
          p.vx -= Math.cos(angle) * force * 4;
          p.vy -= Math.sin(angle) * force * 4;
        }

        p.vx += (p.originX - p.x) * 0.04;
        p.vy += (p.originY - p.y) * 0.04;
        p.vx *= 0.91;
        p.vy *= 0.91;
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    initParticles();
    window.addEventListener('resize', initParticles);
    animate();

    return () => {
      window.removeEventListener('resize', initParticles);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [mousePos]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 bg-transparent pointer-events-none" />;
};

const App: React.FC = () => {
  const [mousePos, setMousePos] = useState<MousePosition>({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [greeting, setGreeting] = useState<GreetingState>({ text: "Hey World", loading: false, error: null });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glitch, setGlitch] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    const rotX = (e.clientY - window.innerHeight / 2) / 35;
    const rotY = (window.innerWidth / 2 - e.clientX) / 35;
    setRotation({ x: rotX, y: rotY });
  }, []);

  const updateGreeting = async () => {
    if (greeting.loading) return;
    setGreeting(prev => ({ ...prev, loading: true }));
    setGlitch(true);
    setTimeout(() => setGlitch(false), 500);

    try {
      const newText = await fetchDynamicGreeting(mousePos, { w: window.innerWidth, h: window.innerHeight });
      setGreeting({ text: newText, loading: false, error: null });
    } catch (err) {
      setGreeting({ text: "Hello Again", loading: false, error: null });
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div 
      className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-[#050505] select-none cursor-crosshair"
      onClick={updateGreeting}
    >
      <InteractiveBackground mousePos={mousePos} />
      
      {/* Dynamic Cursor Glow */}
      <div 
        className="cursor-glow" 
        style={{ 
          left: mousePos.x,
          top: mousePos.y
        }} 
      />

      {/* HUD Elements */}
      <div className="absolute top-8 left-8 z-20 flex flex-col gap-1">
        <div className="font-mono text-[10px] text-indigo-500/50 tracking-[0.4em] uppercase">System_Active</div>
        <div className="w-16 h-[1px] bg-indigo-500/20"></div>
      </div>
      
      <div className="absolute top-8 right-8 z-20 text-right">
        <div className="font-mono text-[10px] text-indigo-500/50 tracking-[0.4em] uppercase">Latency_0.02ms</div>
      </div>

      <div className="absolute bottom-8 left-8 z-20 font-mono text-[9px] text-gray-600 tracking-widest uppercase">
        X_{Math.round(mousePos.x).toString().padStart(4, '0')} // Y_{Math.round(mousePos.y).toString().padStart(4, '0')}
      </div>

      {/* Main Display */}
      <div 
        className={`z-10 text-center transition-all duration-300 ease-out pointer-events-none px-6 ${glitch ? 'skew-x-12 opacity-50 blur-sm' : ''}`}
        style={{ 
          transform: `perspective(1200px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
        }}
      >
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white animate-float drop-shadow-[0_0_30px_rgba(99,102,241,0.2)]">
          {greeting.text}
        </h1>
        <p className="mt-8 text-indigo-400 font-mono tracking-[0.5em] uppercase text-[10px] opacity-40">
          {greeting.loading ? "Synthesizing Vibe..." : "Tap to recalibrate reality"}
        </p>
      </div>

      {/* Watermark */}
      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3 font-mono text-[10px] text-gray-700">
        <span className="tracking-[0.3em]">REL_VERSION_2.0</span>
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40 animate-pulse"></div>
      </div>

      {/* Custom Crosshair UI */}
      <div 
        className="fixed w-10 h-10 z-50 pointer-events-none flex items-center justify-center transition-transform duration-75"
        style={{ left: mousePos.x - 20, top: mousePos.y - 20 }}
      >
        <div className="absolute w-full h-[1px] bg-white/10"></div>
        <div className="absolute h-full w-[1px] bg-white/10"></div>
        <div className="w-2 h-2 border border-white/20 rounded-sm"></div>
      </div>
    </div>
  );
};

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<App />);
}
