import React, { useState, useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';

import { pathData } from './educationPath';
import EducationNode from './components/EducationNode';
import EmploymentNode from './components/EmploymentNode';

const EducationPath = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [linePositions, setLinePositions] = useState<Array<{ y1: number; y2: number }>>([]);
  const journeyPathRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateLinePositions = () => {
      if (!journeyPathRef.current) return;

      const nodeWrappers = journeyPathRef.current.querySelectorAll('.node-wrapper');
      const positions: Array<{ y1: number; y2: number }> = [];

      for (let i = 0; i < nodeWrappers.length - 1; i++) {
        const currentWrapper = nodeWrappers[i] as HTMLElement;
        const nextWrapper = nodeWrappers[i + 1] as HTMLElement;
        
        const currentRect = currentWrapper.getBoundingClientRect();
        const nextRect = nextWrapper.getBoundingClientRect();
        const journeyPathRect = journeyPathRef.current.getBoundingClientRect();
        
        const currentCenterY = currentRect.top - journeyPathRect.top + currentRect.height / 2;
        const nextCenterY = nextRect.top - journeyPathRect.top + nextRect.height / 2;
        
        positions.push({
          y1: currentCenterY,
          y2: nextCenterY
        });
      }

      setLinePositions(positions);
    };

    calculateLinePositions();
    
    window.addEventListener('resize', calculateLinePositions);
    return () => window.removeEventListener('resize', calculateLinePositions);
  }, []);

  return (
    <div className="relative w-full min-h-screen min-w-full bg-[#0a0a0a] overflow-hidden py-10 px-5 md:py-[60px] md:px-10 font-['JetBrains_Mono',monospace] path-container" id="education-path-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Space+Mono:wght@400;700&display=swap');

        .path-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.03) 2px, rgba(0, 255, 65, 0.03) 4px),
            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0, 255, 65, 0.03) 2px, rgba(0, 255, 65, 0.03) 4px);
          background-size: 100% 100%;
          pointer-events: none;
          opacity: 0.5;
        }

        .path-container::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00ff41, transparent);
          animation: scanline 3s linear infinite;
          pointer-events: none;
          opacity: 0.3;
        }

        @keyframes scanline {
          0% { top: 0%; }
          100% { top: 100%; }
        }

        .connection-line {
          fill: none;
          stroke: #1a1a1a;
          stroke-width: 2;
          stroke-dasharray: 5, 5;
        }

        .connection-line-glow {
          fill: none;
          stroke: #00ff41;
          stroke-width: 1;
          stroke-dasharray: 8, 12;
          animation: flowPath 2s linear infinite;
          opacity: 0.6;
        }

        @keyframes flowPath {
          to {
            stroke-dashoffset: -20;
          }
        }

        .node-wrapper {
          animation: slideIn 0.6s ease-out backwards;
        }

        .node-wrapper:nth-child(1) { animation-delay: 0.1s; }
        .node-wrapper:nth-child(2) { animation-delay: 0.2s; }
        .node-wrapper:nth-child(3) { animation-delay: 0.3s; }
        .node-wrapper:nth-child(4) { animation-delay: 0.4s; }
        .node-wrapper:nth-child(5) { animation-delay: 0.5s; }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .center-dot::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          border: 1px solid #00ff41;
          border-radius: 50%;
          animation: ping 2s ease-out infinite;
        }

        @keyframes ping {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.8);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.8);
          }
        }

        .education-node:hover {
          border-left-width: 5px;
        }

        .node-wrapper:last-child .education-node {
          border-left-color: #00ff41;
          animation: currentPulse 2s ease-in-out infinite;
        }

        @keyframes currentPulse {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(0, 255, 65, 0.2);
          }
          50% {
            box-shadow: 0 4px 30px rgba(0, 255, 65, 0.4);
          }
        }

        .node-wrapper:last-child .year-badge {
          background: rgba(0, 255, 65, 0.2);
          border-color: #00ff41;
          animation: badgePulse 2s ease-in-out infinite;
        }

        @keyframes badgePulse {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }

        .terminal-header::before {
          content: '$ ';
          color: #00ff41;
          font-weight: 700;
        }
      `}</style>

      <div className="absolute top-5 left-5 md:left-10 text-xs md:text-sm text-[#00ff41] font-normal opacity-70 font-['JetBrains_Mono',monospace] terminal-header">cat ~/journey/education-path.log</div>

      <div className="relative w-full max-w-[900px] mx-auto journey-path" ref={journeyPathRef}>
        <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-[1] path-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Connection lines between nodes */}
          {linePositions.map((pos, index) => (
            <g key={index}>
              <line 
                className="connection-line" 
                x1="50%" 
                y1={pos.y1} 
                x2="50%" 
                y2={pos.y2}
              />
              <line 
                className="connection-line-glow" 
                x1="50%" 
                y1={pos.y1} 
                x2="50%" 
                y2={pos.y2}
                filter="url(#glow)"
              />
            </g>
          ))}
        </svg>

        {pathData.map((node, index) => {
          const isLast = index === pathData.length - 1;
          if (node.type === 'education') {
            return (
              <EducationNode
                key={index}
                node={node}
                index={index}
                isLast={isLast}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          } else {
            return (
              <EmploymentNode
                key={index}
                node={node}
                index={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

export default EducationPath;
