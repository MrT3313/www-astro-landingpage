import React, { useState, useEffect } from 'react';

const TITLES = [
  "Senior Full Stack Software Engineer ",
  "Tech Stack Optimizer ",
  "Eagle Scout ",
  "Data Science Grad Student @ IU Bloomington ",
  "Pickleballer ",
  "Finance Undergraduate @ Babson College ",
  "Startup Survivor ",
  "Boston Native ",
  "Finance-to-Tech Convert ",
  "8-State Nomad ",
];

interface RotatingTitleProps {
  cellWidth: number;
  terminalWidth: number;
}

function RotatingTitle({ cellWidth, terminalWidth }: RotatingTitleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const targetText = TITLES[currentIndex];
    
    if (isTyping) {
      if (displayText.length < targetText.length) {
        const timeout = setTimeout(() => {
          setDisplayText(targetText.slice(0, displayText.length + 1));
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 30);
        return () => clearTimeout(timeout);
      } else {
        setCurrentIndex((prev) => (prev + 1) % TITLES.length);
        setIsTyping(true);
      }
    }
  }, [displayText, isTyping, currentIndex]);

  return (
    <p className="text-green-300/80 tracking-wide text-lg">
      {displayText}
      <span className="animate-pulse">▌</span>
    </p>
  );
}

interface MockTerminalProps {
  terminalBounds: { x: number; y: number; width: number; height: number };
  cellWidth: number;
  cellHeight: number;
  debug?: boolean;
}

export default function MockTerminal({ 
  terminalBounds, 
  cellWidth, 
  cellHeight, 
  debug = false 
}: MockTerminalProps) {
  if (terminalBounds.width === 0) {
    return null;
  }

  // Tailwind responsive border classes for debug mode
  // xs: red, sm: orange, md: yellow, lg: green, xl: blue, 2xl: purple
  const debugBorderClass = debug 
    ? 'border-2 border-red-500 sm:border-orange-500 md:border-yellow-500 lg:border-green-500 xl:border-blue-500 2xl:border-purple-500'
    : 'border border-green-500/30';

  const debugDividerClass = debug
    ? 'border-red-500 sm:border-orange-500 md:border-yellow-500 lg:border-green-500 xl:border-blue-500 2xl:border-purple-500'
    : 'border-green-500/30';

  return (
    <div 
      className="absolute z-10 transition-all duration-300"
      style={{
        left: `${terminalBounds.x * cellWidth}px`,
        top: `${terminalBounds.y * cellHeight}px`,
        width: `${terminalBounds.width * cellWidth}px`,
        height: `${terminalBounds.height * cellHeight}px`,
      }}
    >
      <div 
        className={`w-full h-full bg-black/90 backdrop-blur-sm rounded-sm shadow-2xl flex flex-col overflow-hidden ${debugBorderClass}`}
        style={{ 
          boxShadow: '0 0 40px rgba(34, 197, 94, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className={`flex items-center gap-2 px-4 py-3 bg-black/50 border-b ${debugDividerClass}`}>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="ml-auto">
            <span className="text-slate-400 text-sm font-mono italic tracking-wide">Site Under Construction</span>
          </div>
        </div>

        <div className="flex-1 pl-4 pr-4 flex flex-col justify-center">
          <div className="space-y-3">
            <div className="space-y-0">
              <div className="text-green-500 text-sm opacity-70">$ whoami</div>
              <h1 className="text-white font-bold tracking-tight leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
                  style={{ 
                    textShadow: '0 0 20px rgba(34, 197, 94, 0.3)'
                  }}>
                Reed Turgeon
              </h1>
            </div>
            
            <div className="space-y-1">
              <div className="text-green-500 text-sm opacity-70">$ reedturgeon --title</div>
              <RotatingTitle cellWidth={cellWidth} terminalWidth={terminalBounds.width} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}