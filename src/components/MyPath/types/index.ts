import { z } from 'zod';

// Zod Schemas
export const EducationNodeSchema = z.object({
  type: z.literal('education'),
  institution: z.string().min(1, 'Institution name is required'),
  institute_subtitle: z.string().optional(),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().min(1, 'Field of study is required'),
  year: z.string().optional(),
  position: z.enum(['left', 'right']),
  summary: z.string().optional()
});

export const EmploymentNodeSchema = z.object({
  type: z.literal('employment'),
  roles: z.array(z.object({
    company: z.string().min(1, 'Company name is required'),
    company_subtitle: z.string().optional(),
    title: z.string().min(1, 'Job title is required'),
    industry: z.string().optional(),
    summary: z.array(z.string()).optional()
  })).min(1, 'At least one role is required'),
  position: z.enum(['left', 'right'])
});

export const PathNodeSchema = z.discriminatedUnion('type', [
  EducationNodeSchema,
  EmploymentNodeSchema
]);

// TypeScript types inferred from Zod schemas
export type EducationNode = z.infer<typeof EducationNodeSchema>;
export type EmploymentNode = z.infer<typeof EmploymentNodeSchema>;
export type PathNode = z.infer<typeof PathNodeSchema>;