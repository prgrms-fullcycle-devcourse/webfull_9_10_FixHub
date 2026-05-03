import { z } from 'zod';

export const issueStatusSchema = z.enum(['UNSOLVED', 'SOLVED']);

export const getPublicIssuesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
  search: z.string().trim().optional(),
  tag: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      return Array.isArray(value) ? value : [value];
    }),
  status: issueStatusSchema.optional(),
});

export type GetPublicIssuesQuery = z.infer<typeof getPublicIssuesQuerySchema>;
