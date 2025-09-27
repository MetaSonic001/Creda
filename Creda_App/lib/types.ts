import { z } from 'zod';

export const idea = z.object({
  link: z.string().url().nullable(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').nullable(),
  tags: z.array(z.string()).nullable(),
  folder_id: z.string().min(1, 'Folder id is required'),
  image: z.string().nullable(),
  notification: z
    .object({
      date: z.number(),
      recurrence: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']),
    })
    .nullable(),
});

export type Idea = z.infer<typeof idea>;
