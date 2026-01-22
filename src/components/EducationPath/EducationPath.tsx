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
    <div className="path-container" id="education-path-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Space+Mono:wght@400;700&display=swap');

        * {
          box-sizing: border-box;
        }

        .path-container {
          position: relative;
          width: 100%;
          min-height: 100vh;
          min-width: 100vw;
          background: #0a0a0a;
          overflow: hidden;
          padding: 60px 40px;
          font-family: 'JetBrains Mono', monospace;
        }

        /* Matrix rain background effect */
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

        /* Scanline effect */
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

        .journey-path {
          position: relative;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
        }

        /* Central connecting line */
        .path-svg {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
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

        /* Node wrapper for positioning */
        .node-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          margin: 20px 0;
          z-index: 2;
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

        .node-wrapper.left {
          justify-content: flex-start;
          padding-right: 55%;
        }

        .node-wrapper.right {
          justify-content: flex-end;
          padding-left: 55%;
        }

        /* Center connector dot */
        .center-dot {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          background: #1a1a1a;
          border: 2px solid #00ff41;
          border-radius: 50%;
          z-index: 3;
          box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
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

        /* Education nodes */
        .education-node {
          background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
          border: 1px solid #2a2a2a;
          border-left: 3px solid #00ff41;
          padding: 20px;
          border-radius: 4px;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          width: 320px;
          min-width: 320px;
          max-width: 320px;
        }

        .education-node:hover {
          border-left-width: 5px;
          transform: translateY(-2px);
          box-shadow: 0 6px 30px rgba(0, 255, 65, 0.2);
          border-color: #00ff41;
        }

        .node-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          position: relative;
        }

        .node-icon {
          width: 32px;
          height: 32px;
          background: rgba(0, 255, 65, 0.1);
          border: 1px solid rgba(0, 255, 65, 0.3);
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .node-icon svg {
          color: #00ff41;
          width: 18px;
          height: 18px;
        }

        .institution-name {
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
          font-family: 'Space Mono', monospace;
          letter-spacing: -0.5px;
        }

        .degree-info {
          font-size: 13px;
          color: #00ff41;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .field-info {
          font-size: 12px;
          color: #888;
          font-weight: 300;
        }

        .year-badge {
          display: inline-block;
          margin-top: 8px;
          padding: 3px 8px;
          background: rgba(0, 255, 65, 0.1);
          border: 1px solid rgba(0, 255, 65, 0.2);
          border-radius: 2px;
          font-size: 10px;
          color: #00ff41;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Employment nodes */
        .employment-node {
          background: linear-gradient(135deg, #151515 0%, #0a0a0a 100%);
          border: 1px solid #2a2a2a;
          padding: 16px;
          border-radius: 4px;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          width: 320px;
          min-width: 320px;
          max-width: 320px;
        }

        .employment-node:hover {
          border-color: #00ff41;
          box-shadow: 0 6px 30px rgba(0, 255, 65, 0.15);
        }

        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 10px;
          width: 100%;
        }

        .role-card {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-left: 2px solid #555;
          padding: 12px;
          border-radius: 3px;
          transition: all 0.2s ease;
        }

        .role-card:hover {
          border-left-color: #00ff41;
          background: #1f1f1f;
          transform: translateX(3px);
        }

        .role-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .role-icon {
          width: 20px;
          height: 20px;
          background: rgba(0, 255, 65, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .role-icon svg {
          color: #00ff41;
          width: 12px;
          height: 12px;
        }

        .company-name {
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
          font-family: 'Space Mono', monospace;
        }

        .role-title {
          font-size: 11px;
          color: #888;
          margin-bottom: 4px;
          font-weight: 400;
        }

        .role-highlight {
          font-size: 10px;
          color: #00ff41;
          font-weight: 300;
          opacity: 0.8;
        }

        /* Current node pulse */
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

        /* Terminal prompt header */
        .terminal-header {
          position: absolute;
          top: 20px;
          left: 40px;
          font-size: 14px;
          color: #00ff41;
          font-weight: 400;
          opacity: 0.7;
          font-family: 'JetBrains Mono', monospace;
        }

        .terminal-header::before {
          content: '$ ';
          color: #00ff41;
          font-weight: 700;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .path-container {
            padding: 40px 20px;
          }

          .node-wrapper.left,
          .node-wrapper.right {
            padding: 0;
            justify-content: center;
          }

          .node-wrapper {
            margin: 30px 0;
          }

          .center-dot {
            display: none;
          }

          .roles-grid {
            grid-template-columns: 1fr;
          }

          .terminal-header {
            left: 20px;
            font-size: 12px;
          }
        }
      `}</style>

      <div className="terminal-header">cat ~/journey/education-path.log</div>

      <div className="journey-path" ref={journeyPathRef}>
        <svg className="path-svg" xmlns="http://www.w3.org/2000/svg">
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
          if (node.type === 'education') {
            return (
              <EducationNode
                key={index}
                node={node}
                index={index}
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
