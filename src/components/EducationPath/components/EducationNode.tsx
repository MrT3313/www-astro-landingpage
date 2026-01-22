import React from 'react';
import { GraduationCap } from 'lucide-react';
import type { EducationNode } from '../types/index';

interface EducationNodeProps {
  node: EducationNode;
  index: number;
  isLast?: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const EducationNode: React.FC<EducationNodeProps> = ({ node, index, isLast = false, onMouseEnter, onMouseLeave }) => {
  return (
    <div 
      className={`relative flex items-center my-[30px] md:my-5 z-[2] node-wrapper ${node.position === 'left' ? 'justify-center md:justify-start pr-0 md:pr-[55%]' : 'justify-center md:justify-end pl-0 md:pl-[55%]'}`}
      data-node-type="education"
      data-node-index={index}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#1a1a1a] border-2 border-[#00ff41] rounded-full z-[3] shadow-[0_0_10px_rgba(0,255,65,0.5)] hidden md:block center-dot" />
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] border-l-[3px] border-l-[#00ff41] p-5 rounded transition-all duration-300 cursor-pointer relative shadow-[0_4px_20px_rgba(0,0,0,0.5)] w-80 min-w-80 max-w-80 hover:-translate-y-0.5 hover:shadow-[0_6px_30px_rgba(0,255,65,0.2)] hover:border-[#00ff41] education-node">
        <div className="flex items-center gap-2.5 mb-3 relative">
          <div className="w-8 h-8 bg-[rgba(0,255,65,0.1)] border border-[rgba(0,255,65,0.3)] rounded flex items-center justify-center">
            <GraduationCap className="text-[#00ff41] w-[18px] h-[18px]" />
          </div>
          <div>
            <div className="text-base font-bold text-white font-['Space_Mono',monospace] tracking-[-0.5px]">{node.institution}</div>
            {node.institute_subtitle && (
              <div className="text-xs text-[#888] italic font-light mt-0.5">{node.institute_subtitle}</div>
            )}
          </div>
        </div>
        <div className="text-[13px] text-[#00ff41] mb-1 font-medium">{node.degree}</div>
        <div className="text-xs text-[#888] font-light">{node.field}</div>
        {node.year && <div className="inline-block mt-2 px-2 py-[3px] bg-[rgba(0,255,65,0.1)] border border-[rgba(0,255,65,0.2)] rounded text-[10px] text-[#00ff41] font-medium uppercase tracking-[1px] year-badge">{node.year}</div>}
      </div>
    </div>
  );
};

export default EducationNode;
