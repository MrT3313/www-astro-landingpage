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
            summary: [
                'Designed and managed all financial systems',
                'Exit: Sold company to LinkBusters'
            ],
            industry: 'Digital Piracy Protection'
        }
        ],
        position: 'right'
    },
    {
        type: 'education',
        institution: 'Lambda School',
        institute_subtitle: 'now Bloom Tech',
        degree: 'Full Stack Web Development',
        field: 'Certificate',
        position: 'left'
    },
    {
        type: 'employment',
        roles: [
        {
            company: 'Lambda School',
            company_subtitle: 'now Bloom Tech',
            title: 'Full-Stack Team Lead & CS Section Lead',
            summary: [
                'Team Lead: Technical mentor for daily 1:1s and stand-ups for 7-10 students', 
                'Section Lead: Managed 16 Team Leads overseeing ~150 students',
            ],
            industry: 'EdTech & Technical Leadership'
        },
        {
            company: 'Studios',
            title: 'Backend Lead (Contract)',
            summary: [
                'Document & signature management platform',
                'Client progress update platform'
            ],
            industry: 'Construction Compliance & Consulting'
        },
        {
            company: 'Colvinrun',
            title: 'Full Stack Software Developer',
            summary: ['Executed against various Small Business Innovation Research (SBIR) grants'],
            industry: 'Government',
        },
        {
            company: 'HQ',
            title: 'Full Stack Developer',
            summary: ['Full-stack IC on multiple platforms supporting thousands of users and processing hundreds of thousands of dollars per month.'],
            industry: 'Death Care, Documentary Filmmaking, & Custom Printing',
        },
        {
            company: 'Meratas',
            title: 'Lead Dev → Director of Engineering',
            summary: ['Lead developer responsible for all frontend, backend, & devops for the Meratas Lender Marketplace Platform.'],
            industry: 'FinTech & Technical / Professional Leadership',
        }
        ],
        position: 'right'
    },
    {
        type: 'education',
        institution: 'Aitra',
        institute_subtitle: 'now Gauntlet AI',
        degree: 'AI Engineering',
        field: 'Certificate',
        position: 'left'
    },
    {
        type: 'education',
        institution: 'Indiana University Bloomington',
        degree: 'Graduate School',
        field: 'MS in Data Science',
        year: 'Current',
        position: 'left'
    },
];