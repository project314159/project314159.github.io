
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

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

    const colors = ['#6366f1', '#818cf8', '#a855f7', '#4f46e5'];

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.current = Array.from({ length: 150 }).map(() => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        return {
          x, y,
          originX: x,
          originY: y,
          vx: 0,
          vy: 0,
          size: Math.random() * 2 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)]
        };
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current.forEach(p => {
        const dx = mousePos.x - p.x;
        const dy = mousePos.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 180) {
          const force = (180 - dist) / 180;
          const angle = Math.atan2(dy, dx);
          p.vx -= Math.cos(angle) * force * 3;
          p.vy -= Math.sin(angle) * force * 3;
        }

        // Return to origin
        p.vx += (p.originX - p.x) * 0.03;
        p.vy += (p.originY - p.y) * 0.03;
        
        // Friction
        p.vx *= 0.92;
        p.vy *= 0.92;
        
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.35;
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
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Calculate rotation based on cursor distance from center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const rX = (e.clientY - centerY) / 30;
      const rY = (centerX - e.clientX) / 30;
      setRotation({ x: rX, y: rY });
    };
    
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-[#050505] cursor-none select-none">
      <InteractiveBackground mousePos={mousePos} />
      
      {/* Dynamic Glow */}
      <div 
        className="cursor-glow" 
        style={{ 
          left: mousePos.x,
          top: mousePos.y
        }} 
      />

      {/* Main Content */}
      <div 
        className="z-10 text-center transition-transform duration-200 ease-out"
        style={{ 
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
        }}
      >
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white animate-float drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]">
          Hey World
        </h1>
        <div className="mt-4 flex items-center justify-center gap-4 opacity-30">
          <div className="h-[1px] w-12 bg-indigo-500"></div>
          <p className="font-mono text-[10px] tracking-[0.6em] uppercase text-indigo-300">
            Interactive Node v1.0
          </p>
          <div className="h-[1px] w-12 bg-indigo-500"></div>
        </div>
      </div>

      {/* Interface Decorations */}
      <div className="absolute top-10 left-10 z-20 font-mono text-[10px] text-indigo-500/40 uppercase tracking-[0.3em] hidden sm:block">
        System_Status: Stable
      </div>
      
      <div className="absolute top-10 right-10 z-20 font-mono text-[10px] text-indigo-500/40 uppercase tracking-[0.3em] hidden sm:block">
        Latency: 0.2ms
      </div>

      {/* User Coordinates */}
      <div className="absolute bottom-10 left-10 z-20 font-mono text-[9px] text-gray-700 tracking-[0.2em] hidden sm:block">
        X_{Math.round(mousePos.x).toString().padStart(4, '0')} // Y_{Math.round(mousePos.y).toString().padStart(4, '0')}
      </div>

      {/* MADE WITH LOVE */}
      <div className="absolute bottom-10 right-10 z-20 font-mono text-[11px] text-gray-500/80 tracking-widest flex items-center gap-2">
        <span className="opacity-40 italic">00:00:01</span>
        <span className="text-gray-400">Made With Love</span>
        <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 animate-pulse"></div>
      </div>

      {/* Custom Crosshair */}
      <div 
        className="fixed w-6 h-6 z-50 pointer-events-none"
        style={{ left: mousePos.x - 12, top: mousePos.y - 12 }}
      >
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/20"></div>
        <div className="absolute left-1/2 top-0 w-[1px] h-full bg-white/20"></div>
        <div className="absolute inset-0 border border-white/5 rounded-full"></div>
      </div>
    </div>
  );
};

// --- Mount with standard error handling ---
const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<App />);
}
