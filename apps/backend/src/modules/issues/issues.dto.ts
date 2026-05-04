import { IssueStatus } from '@prisma/client';

import { zod as z } from '../../common/lib/zod.js';

export const SearchIssuesQuerySchema = z.object({
  search: z.string().min(1).optional(),
});

export const SearchIssuesResponseSchema = z.object({
  meta: z.object({
    totalItemCount: z.number(),
    currentItemCount: z.number(),
    itemsPerPage: z.number(),
    currentPage: z.number(),
    totalPages: z.number(),
  }),
  data: z.array(
    z.object({
      id: z.uuidv7(),
      title: z.string(),
      teamName: z.string(),
      author: z.string(),
      tag: z.array(z.string()),
      status: z.enum(['UNSOLVED', 'SOLVED']),
      commentCount: z.number(),
      createdAt: z.string(),
    }),
  ),
});

export type SearchIssuesQueryDto = z.infer<typeof SearchIssuesQuerySchema>;
export type SearchIssuesResponseDto = z.infer<
  typeof SearchIssuesResponseSchema
>;

export type SearchIssuesQueryObjectDto = {
  teamId?: string;
  title: string[];
  author?: string;
  tag: string[];
  status?: IssueStatus;
  content: string[];
  page?: number;
};

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
