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
  status?: 'UNSOLVED' | 'SOLVED';
  content: string[];
  page?: number;
};
