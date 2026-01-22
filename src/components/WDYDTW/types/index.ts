import { z } from 'zod';

// Zod schemas
export const taskSchema = z.object({
    category: z.string(),
    title: z.string(),
    updates: z.array(z.string()),
    link: z.string().optional(),
});

const dateStringSchema = z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Date must be in YYYY-MM-DD format'
);
export const entrySchema = z.object({
    group: z.string(),
    dates: z.object({
        start: dateStringSchema,
        end: dateStringSchema,
    }),
    tasks: z.array(taskSchema),
});

export const entriesSchema = z.array(entrySchema);

// Inferred TypeScript types
export type Task = z.infer<typeof taskSchema>;
export type Entry = z.infer<typeof entrySchema>;
export type Entries = z.infer<typeof entriesSchema>;
