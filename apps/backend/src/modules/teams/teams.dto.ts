import { zod as z } from '../../common/lib/zod.js';

export const SearchTeamsCommentsParamsSchema = z.object({
  id: z.uuidv7(),
});

export const SearchTeamsCommentsQuerySchema = z.object({
  search: z.string().min(1).optional(),
});

export const SearchTeamsCommentsResponseSchema = z.object({
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
      author: z.string(),
      tag: z.string(),
      status: z.enum(['UNSOLVED', 'SOLVED']),
      commentCount: z.number(),
    }),
  ),
});

export type SearchTeamsCommentsParamsDto = z.infer<
  typeof SearchTeamsCommentsParamsSchema
>;
export type SearchTeamsCommentsQueryDto = z.infer<
  typeof SearchTeamsCommentsQuerySchema
>;
export type SearchTeamsCommentsResponseDto = z.infer<
  typeof SearchTeamsCommentsResponseSchema
>;

export type SearchTeamsCommentsQueryObjectDto = {
  teamId: string;
  title: string[];
  author?: string;
  tag: string[];
  status?: 'UNSOLVED' | 'SOLVED';
  content: string[];
  page?: number;
};
