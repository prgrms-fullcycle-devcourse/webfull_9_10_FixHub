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

const CommentResponseBaseSchema = z.object({
  id: z.string().openapi({
    example: 'comment-uuid-001',
  }),
  content: z.string().openapi({
    example: '환경변수에서 Redis 호스트 설정을 확인해보세요.',
  }),
  author: z.string().openapi({
    example: '김철수',
  }),
  parentId: z.string().nullable().openapi({
    example: null,
  }),
  isAdopted: z.boolean().openapi({
    example: false,
  }),
  createdAt: z.string().openapi({
    example: '2025-04-22T10:30:00.000Z',
  }),
});

const CommentReplyResponseSchema = CommentResponseBaseSchema.extend({
  replies: z.array(z.object({})).openapi({
    example: [],
  }),
});

export const GetCommentsParamsSchema = z.object({
  id: z.string().min(1),
});

export const GetCommentsResponseSchema = z.object({
  data: z.array(
    CommentResponseBaseSchema.extend({
      replies: z.array(CommentReplyResponseSchema),
    }),
  ),
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

export type CreateCommentParamsDto = z.infer<typeof CreateCommentParamsSchema>;
export type CreateCommentBodyDto = z.infer<typeof CreateCommentBodySchema>;
export type CreateCommentResponseDto = z.infer<
  typeof CreateCommentResponseSchema
>;
export type GetCommentsParamsDto = z.infer<typeof GetCommentsParamsSchema>;
export type GetCommentsResponseDto = z.infer<typeof GetCommentsResponseSchema>;
