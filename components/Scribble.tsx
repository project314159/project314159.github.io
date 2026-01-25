import React from 'react';

const Scribble = () => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] md:w-[1300px] md:h-[900px] pointer-events-none z-0 opacity-80 mix-blend-screen">
      <svg 
        viewBox="0 0 1000 800" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="glow-strong" x="-20%" y="-20%" width="140%" height="140%">
             <feGaussianBlur stdDeviation="8" result="blur" />
             <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Complex chaotic spiral loop - smooth curves expanding outward */}
        <path 
          d="M500,400 
             C530,350 600,350 580,450 
             S450,550 400,450 
             S450,250 600,300 
             S800,500 600,650 
             S300,600 350,400 
             S650,150 750,350 
             S600,800 400,700 
             S100,400 300,200 
             S850,200 900,500
             S500,900 200,750" 
          stroke="#7dd3fc" 
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw"
          filter="url(#glow-strong)"
          style={{ strokeDasharray: 12000 }}
        />
        
        {/* Secondary faint detail line for depth and complexity */}
        <path 
          d="M510,410 
             C540,360 590,360 570,440 
             S460,540 410,440 
             S460,260 590,310 
             S780,490 590,640" 
          stroke="#3b82f6" 
          strokeWidth="1"
          strokeLinecap="round"
          className="animate-draw"
          style={{ strokeDasharray: 12000, animationDelay: '0.2s', opacity: 0.3 }}
        />
      </svg>
    </div>
  );
};

export default Scribble;
