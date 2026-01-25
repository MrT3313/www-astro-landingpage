import React from 'react';
import { Briefcase } from 'lucide-react';
import type { EmploymentNode } from '../types/index';
import cx from 'classnames';

interface EmploymentNodeProps {
  node: EmploymentNode;
  index: number;
}

const EmploymentNode: React.FC<EmploymentNodeProps> = ({ node, index }) => {
  return (
    <div 
      className={cx(
        `relative flex items-center justify-center w-full`, 
        `my-[30px] md:my-5 z-[2] node-wrapper`, 
        node.position === 'left'
          ? 'md:justify-end md:pr-[calc(50%+60px)]'
          : 'md:justify-start md:pl-[calc(50%+60px)]',
      )}
      data-node-type="employment"
      data-node-index={index}
    >
      {/* Timeline Dot */}
      <div className={cx(
        "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2", 
        "w-3 h-3 rounded-full z-[3]", 
        "bg-[var(--color-dot-bg)]", 
        "border-2 border-[var(--color-dot-border)]", 
        "shadow-[0_0_10px_var(--color-dot-shadow)]", 
        "hidden md:block center-dot",
      )}/>

      {/* Container */}
      <div className={cx(
        "employment-node relative",
        "bg-gradient-to-br from-[var(--color-container-bg-from)] to-[var(--color-container-bg-to)]",  
        "w-auto min-w-80 max-w-[700px] p-4 rounded", 
        "border border-[var(--color-container-border)]", 
        "transition-all duration-300 cursor-pointer", 
        "hover:border-[var(--color-container-border-hover)]",
        "hover:shadow-[0_6px_30px_var(--color-container-shadow-hover)]",
      )}>
        {/* Roles Grid */}
        <div className={cx(
          "roles-grid grid grid-cols-1 w-full gap-2.5", 
        )}>
          {node.roles.map((role, roleIndex) => (
            <div key={roleIndex} className={cx(
              "role-card p-3 rounded transition-all duration-200",
              "bg-[var(--color-node-bg)]", 
              "border border-[var(--color-node-border)]",
              "border-l-2 border-l-[var(--color-node-border-left)]", 
              "hover:border-l-[var(--color-node-border-left-hover)]",
              "hover:bg-[var(--color-node-bg-hover)]",
              "hover:translate-x-[3px]", 
            )}>
              {/* Role Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className={cx(
                  "flex items-center justify-center w-8 h-8 rounded", 
                  "bg-icon-bg border border-icon", 
                )}>
                  <Briefcase className="text-icon-color w-[18px] h-[18px]" />
                </div>
                <div>
                  <div className="text-base font-bold text-white font-['Space_Mono',monospace]">
                    {role.company}
                  </div>
                  {role.company_subtitle && (
                    <div className="text-xs text-text-dark-grey italic mt-0.5">
                      {role.company_subtitle}
                    </div>
                  )}
                </div>
              </div>

              {/* Role Title */}
              <div className="text-sm text-text-light-grey mb-1 font-normal">
                {role.title}
              </div>

              {/* Summary Points */}
              {role.summary && role.summary.length > 0 && (
                <div className="flex flex-col gap-1">
                  {role.summary.map((item, summaryIndex) => (
                    <div key={summaryIndex} className="text-sm text-text-neon-green">
                      &gt; {item}
                    </div>
                  ))}
                </div>
              )}

              {/* Industry Footer */}
              {role.industry && (
                <div className={cx(
                  "mt-2 pt-2 text-sm leading-relaxed",
                  "border-t border-[var(--color-node-border)]",
                  "text-text-light-grey",
                )}>
                  {role.industry}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmploymentNode;