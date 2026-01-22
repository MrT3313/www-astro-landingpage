import React from 'react';
import { TrendingUp, Code, Briefcase } from 'lucide-react';
import type { EmploymentNode } from '../types/index';

interface EmploymentNodeProps {
  node: EmploymentNode;
  index: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const EmploymentNode: React.FC<EmploymentNodeProps> = ({ node, index, onMouseEnter, onMouseLeave }) => {
  return (
    <div 
      className={`relative flex items-center my-[30px] md:my-5 z-[2] node-wrapper ${node.position === 'left' ? 'justify-center md:justify-start pr-0 md:pr-[55%]' : 'justify-center md:justify-end pl-0 md:pl-[55%]'}`}
      data-node-type="employment"
      data-node-index={index}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#1a1a1a] border-2 border-[#00ff41] rounded-full z-[3] shadow-[0_0_10px_rgba(0,255,65,0.5)] hidden md:block center-dot" />
      <div className="bg-gradient-to-br from-[#151515] to-[#0a0a0a] border border-[#2a2a2a] p-4 rounded transition-all duration-300 cursor-pointer relative w-80 min-w-80 max-w-80 hover:border-[#00ff41] hover:shadow-[0_6px_30px_rgba(0,255,65,0.15)] employment-node">
        <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5 w-full roles-grid">
          {node.roles.map((role, roleIndex) => (
            <div key={roleIndex} className="bg-[#1a1a1a] border border-[#2a2a2a] border-l-2 border-l-[#555] p-3 rounded transition-all duration-200 hover:border-l-[#00ff41] hover:bg-[#1f1f1f] hover:translate-x-[3px] role-card">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-[rgba(0,255,65,0.1)] rounded-full flex items-center justify-center">
                  {role.title.includes('Director') || role.title.includes('Lead') ? 
                    <TrendingUp className="text-[#00ff41] w-3 h-3" /> : 
                    role.company === 'Studios' ? <Code className="text-[#00ff41] w-3 h-3" /> : <Briefcase className="text-[#00ff41] w-3 h-3" />
                  }
                </div>
                <div className="text-[13px] font-bold text-white font-['Space_Mono',monospace]">{role.company}</div>
              </div>
              <div className="text-[11px] text-[#888] mb-1 font-normal">{role.title}</div>
              {role.highlight && (
                <div className="text-[10px] text-[#00ff41] font-light opacity-80">// {role.highlight}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmploymentNode;
