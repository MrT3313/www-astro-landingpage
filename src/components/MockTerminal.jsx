import React, { useState, useEffect } from 'react';

function RotatingTitle({ cellSize, terminalWidth }) {
  const titles = [
    "Senior Full Stack Software Engineer",
    "Builder",
    "Eagle Scout",
    "Explorer",
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % titles.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [titles.length]);

  const nextIndex = (currentIndex + 1) % titles.length;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <p 
        key={`current-${currentIndex}`}
        className="text-green-300/80 tracking-wide absolute w-full animate-slideDown"
        style={{ 
          fontSize: `clamp(0.875rem, ${terminalWidth * cellSize * 0.025}px, 1.125rem)`,
          top: 0,
          left: 0
        }}
      >
        {titles[currentIndex]}
      </p>
      
      <p 
        key={`next-${nextIndex}`}
        className="text-green-300/80 tracking-wide absolute w-full animate-slideDownIn"
        style={{ 
          fontSize: `clamp(0.875rem, ${terminalWidth * cellSize * 0.025}px, 1.125rem)`,
          top: 0,
          left: 0
        }}
      >
        {titles[nextIndex]}
      </p>
    </div>
  );
}

export default function MockTerminal({ terminalBounds, cellSize }) {
  if (terminalBounds.width === 0) {
    return null;
  }

  return (
    <>
      <div 
        className="absolute z-10 transition-all duration-300"
        style={{
          left: `${terminalBounds.x * cellSize}px`,
          top: `${terminalBounds.y * cellSize}px`,
          width: `${terminalBounds.width * cellSize}px`,
          height: `${terminalBounds.height * cellSize}px`,
        }}
      >
        <div className="w-full h-full bg-black/90 backdrop-blur-sm border border-green-500/30 rounded-sm shadow-2xl flex flex-col overflow-hidden"
             style={{ boxShadow: '0 0 40px rgba(34, 197, 94, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5)' }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-green-500/30 bg-black/50">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>

          <div className="flex-1 px-8 py-6 overflow-hidden flex flex-col justify-center">
            <div className="space-y-6">
              <div className="space-y-0">
                <div className="text-green-500 text-sm opacity-70">$ whoami</div>
                <h1 className="text-white font-bold tracking-tight leading-tight"
                    style={{ 
                      fontSize: `clamp(1.5rem, ${terminalBounds.width * cellSize * 0.08}px, 3.5rem)`,
                      textShadow: '0 0 20px rgba(34, 197, 94, 0.3)'
                    }}>
                  Reed Turgeon
                </h1>
              </div>
              
              <div className="space-y-1">
                <div className="text-green-500 text-sm opacity-70">$ reedturgeon --title</div>
                <div className="relative overflow-hidden"
                     style={{ 
                       height: `clamp(1.25rem, ${terminalBounds.width * cellSize * 0.025}px, 1.625rem)`
                     }}>
                  <RotatingTitle cellSize={cellSize} terminalWidth={terminalBounds.width} />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-green-500 text-sm opacity-70">$ skills</div>
                <div className="flex flex-wrap gap-3">
                  {['Node.js', 'Python', 'Go', 'AWS', 'Docker', 'Kubernetes'].map((skill) => (
                    <span
                      key={skill}
                      className="px-4 py-2 border border-green-500/40 text-green-400 rounded-sm text-xs hover:bg-green-500/10 hover:border-green-500/60 transition-all duration-300 cursor-default"
                      style={{
                        fontSize: `clamp(0.625rem, ${terminalBounds.width * cellSize * 0.018}px, 0.875rem)`,
                        textShadow: '0 0 10px rgba(34, 197, 94, 0.2)'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100%); opacity: 0; }
        }
        
        @keyframes slideDownIn {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-slideDown {
          animation: slideDown 0.5s ease-in-out forwards;
        }
        
        .animate-slideDownIn {
          animation: slideDownIn 0.5s ease-in-out forwards;
        }
      `}</style>
    </>
  );
}
