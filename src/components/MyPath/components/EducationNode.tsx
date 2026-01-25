import React from 'react';
import { GraduationCap } from 'lucide-react';
import type { EducationNode } from '../types/index';
import cx from 'classnames';

interface EducationNodeProps {
  node: EducationNode;
  index: number;
  isLast?: boolean;
}

const EducationNode: React.FC<EducationNodeProps> = ({ node, index, isLast = false }) => {
  return (
    <div 
      className={cx(
        'relative flex items-center justify-center w-full',
        'my-[30px] md:my-5 z-[2] node-wrapper',
        node.position === 'left'
          ? 'md:justify-end md:pr-[calc(50%+60px)]'
          : 'md:justify-start md:pl-[calc(50%+60px)]',
      )}
      data-node-type="education"
      data-node-index={index}
    >
      {/* Timeline Dot */}
      <div className={cx(
        'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
        'w-3 h-3 rounded-full z-[3]',
        'bg-[var(--color-dot-bg)]',
        'border-2 border-[var(--color-dot-border)]',
        'shadow-[0_0_10px_var(--color-dot-shadow)]',
        'hidden md:block center-dot',
      )} />

      {/* Education Card */}
      <div className={cx(
        'education-node relative',
        'bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f]',  // ← MISSING: #0f0f0f
        'w-80 min-w-80 max-w-80 p-5 rounded',
        'border border-[var(--color-container-border)]',
        'border-l-[3px] border-l-[var(--color-container-border-hover)]',  // ← Different from employment
        'transition-all duration-300 cursor-pointer',
        'shadow-[0_4px_20px_rgba(0,0,0,0.5)]',  // ← MISSING: black shadow
        'hover:border-[var(--color-container-border-hover)]',
        'hover:shadow-[0_6px_30px_rgba(0,255,65,0.2)]',  // ← MISSING: 0.2 opacity (vs 0.15)
        'hover:-translate-y-0.5',  // ← Different from employment
      )}>
        {/* Header with Icon */}
        <div className="flex items-center gap-2.5 mb-3 relative">
          <div className={cx(
            'w-8 h-8 rounded flex items-center justify-center',
            'bg-icon-bg border border-icon',
          )}>
            <GraduationCap className="text-icon-color w-[18px] h-[18px]" />
          </div>
          <div>
            <div className="text-base font-bold text-white font-['Space_Mono',monospace] tracking-[-0.5px]">
              {node.institution}
            </div>
            {node.institute_subtitle && (
              <div className="text-xs text-text-dark-grey italic mt-0.5">
                {node.institute_subtitle}
              </div>
            )}
          </div>
        </div>

        {/* Degree */}
        <div className="text-[13px] text-text-neon-green mb-1 font-medium">
          {node.degree}
        </div>

        {/* Field */}
        <div className="text-sm text-text-light-grey">
          {node.field}
        </div>

        {/* Year Badge */}
        {node.year && (
          <div className={cx(
            'inline-block mt-2 px-2 py-[3px] rounded year-badge',
            'bg-icon-bg border border-icon',
            'text-[10px] text-icon-color',
            'uppercase tracking-[1px]',
          )}>
            {node.year}
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationNode;