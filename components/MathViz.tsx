import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Desmos: any;
  }
}

interface Props {
  expression: string;
}

const MathViz: React.FC<Props> = ({ expression }) => {
  const calculatorRef = useRef<HTMLDivElement>(null);
  const calculatorInstance = useRef<any>(null);

  useEffect(() => {
    if (calculatorRef.current && !calculatorInstance.current && window.Desmos) {
      // Initialize Desmos Calculator
      calculatorInstance.current = window.Desmos.GraphingCalculator(calculatorRef.current, {
        keypad: true,
        settingsMenu: false,
        zoomButtons: true,
        expressions: true,
        invertedColors: true, // Dark mode to match app theme
        border: false,
        lockViewport: false
      });
    }

    if (calculatorInstance.current) {
      // Set the expression
      // If the expression doesn't have an equal sign or generic function syntax, 
      // Desmos might treat it as a variable or computation. 
      // We assume the service passed a valid latex or simple math string.
      calculatorInstance.current.setExpression({ 
        id: 'graph1', 
        latex: expression,
        color: '#3b82f6' // Match primary color
      });
      
      // Attempt to set a reasonable viewport
      calculatorInstance.current.setMathBounds({
        left: -10,
        right: 10,
        bottom: -10,
        top: 10
      });
    }

    return () => {
      if (calculatorInstance.current) {
        calculatorInstance.current.destroy();
        calculatorInstance.current = null;
      }
    };
  }, [expression]);

  return (
    <div className="w-full max-w-4xl mx-auto mb-12 animate-fade-in delay-200">
      <div className="flex items-center gap-2 mb-4 px-2">
        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <h3 className="text-xl font-display text-white">Interactive Graph</h3>
      </div>
      
      <div className="h-[500px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0f0f10] relative">
         <div ref={calculatorRef} className="w-full h-full" />
         {/* Overlay to ensure it feels integrated */}
         <div className="absolute inset-0 pointer-events-none rounded-3xl shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]"></div>
      </div>
      <p className="text-center text-white/30 text-xs mt-3 font-mono">
        Powered by Desmos API
      </p>
    </div>
  );
};

export default MathViz;
