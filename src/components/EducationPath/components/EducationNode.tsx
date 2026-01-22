import React from 'react';
import { GraduationCap } from 'lucide-react';
import type { EducationNode } from '../types/index';

interface EducationNodeProps {
  node: EducationNode;
  index: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const EducationNode: React.FC<EducationNodeProps> = ({ node, index, onMouseEnter, onMouseLeave }) => {
  return (
    <div 
      className={`node-wrapper ${node.position}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="center-dot" />
      <div className="education-node">
        <div className="node-header">
          <div className="node-icon">
            <GraduationCap />
          </div>
          <div className="institution-name">{node.institution}</div>
        </div>
        <div className="degree-info">{node.degree}</div>
        <div className="field-info">{node.field}</div>
        {node.year && <div className="year-badge">{node.year}</div>}
      </div>
    </div>
  );
};

export default EducationNode;
