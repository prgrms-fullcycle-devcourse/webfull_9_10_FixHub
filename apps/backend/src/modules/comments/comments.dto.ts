import { zod as z } from '../../common/lib/zod.js';

export const CreateCommentParamsSchema = z.object({
  id: z.string().min(1),
});

export const CreateCommentBodySchema = z.object({
  content: z.string().trim().min(1).max(1000),
  parentId: z.string().min(1).nullable(),
});

export const CreateCommentResponseSchema = z.object({
  id: z.string().openapi({
    example: 'comment-uuid-004',
  }),
  author: z.string().openapi({
    example: '홍길동',
  }),
  createdAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}\([일월화수목금토]\)$/)
    .openapi({
      example: '2025-04-22(화)',
    }),
});

export const AdoptCommentParamsSchema = z.object({
  id: z.string().min(1),
  commentId: z.string().min(1),
});

export const AdoptCommentResponseSchema = z.object({
  issueId: z.string().openapi({
    example: 'issue-uuid-010',
  }),
  commentId: z.string().openapi({
    example: 'comment-uuid-003',
  }),
  rewardedScore: z.number().openapi({
    example: 50,
  }),
  reason: z.string().openapi({
    example: '댓글 채택 보상',
  }),
  status: z.enum(['SOLVED']).openapi({
    example: 'SOLVED',
  }),
});

export const CommentErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().openapi({
      example: 'VALIDATION_ERROR',
    }),
    message: z.string().openapi({
      example: '요청 본문이 올바르지 않습니다.',
    }),
  }),
});

export type AdoptCommentParamsDto = z.infer<typeof AdoptCommentParamsSchema>;
export type AdoptCommentResponseDto = z.infer<
  typeof AdoptCommentResponseSchema
>;
export type CreateCommentParamsDto = z.infer<typeof CreateCommentParamsSchema>;
export type CreateCommentBodyDto = z.infer<typeof CreateCommentBodySchema>;
export type CreateCommentResponseDto = z.infer<
  typeof CreateCommentResponseSchema
>;
