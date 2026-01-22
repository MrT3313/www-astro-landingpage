import type { PathNode } from './types/index';

export const pathData: PathNode[] = [
    {
        type: 'education',
        institution: 'Babson College',
        degree: 'Undergraduate',
        field: 'BS in Business Administration, Finance',
        position: 'left'
    },
    {
        type: 'employment',
        roles: [
        {
            company: 'PiraShield',
            title: 'Comptroller & COO',
            highlight: 'Startup operations'
        }
        ],
        position: 'right'
    },
    {
        type: 'education',
        institution: 'Lambda School',
        degree: 'Full Stack Development',
        field: 'Certificate',
        position: 'left'
    },
    {
        type: 'employment',
        roles: [
        {
            company: 'Studios',
            title: 'Backend Lead'
        },
        {
            company: 'Colvinrun',
            title: 'Full Stack Engineer'
        },
        {
            company: 'HQ',
            title: 'Full Stack Developer'
        },
        {
            company: 'Meratas',
            title: 'Lead Dev → Director',
            highlight: 'Lender Marketplace'
        }
        ],
        position: 'right'
    },
    {
        type: 'education',
        institution: 'IU Bloomington',
        degree: 'Graduate School',
        field: 'Data Science',
        year: 'Current',
        position: 'left'
    }
];