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
      className={`node-wrapper ${node.position}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="center-dot" />
      <div className="employment-node">
        <div className="roles-grid">
          {node.roles.map((role, roleIndex) => (
            <div key={roleIndex} className="role-card">
              <div className="role-card-header">
                <div className="role-icon">
                  {role.title.includes('Director') || role.title.includes('Lead') ? 
                    <TrendingUp /> : 
                    role.company === 'Studios' ? <Code /> : <Briefcase />
                  }
                </div>
                <div className="company-name">{role.company}</div>
              </div>
              <div className="role-title">{role.title}</div>
              {role.highlight && (
                <div className="role-highlight">// {role.highlight}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmploymentNode;
