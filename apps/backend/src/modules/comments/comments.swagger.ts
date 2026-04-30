import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import {
  CommentErrorResponseSchema,
  CreateCommentBodySchema,
  CreateCommentParamsSchema,
  CreateCommentResponseSchema,
} from './comments.dto.js';

export function registerCommentsSwagger(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'post',
    path: '/issues/{id}/comments',
    tags: ['Comments'],
    summary: '댓글 생성',
    description: '일반 댓글 또는 대댓글을 생성합니다.',
    request: {
      params: CreateCommentParamsSchema,
      body: {
        required: true,
        content: {
          'application/json': {
            schema: CreateCommentBodySchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: '댓글 생성 성공',
        content: {
          'application/json': {
            schema: CreateCommentResponseSchema,
          },
        },
      },
      400: {
        description: '잘못된 요청',
        content: {
          'application/json': {
            schema: CommentErrorResponseSchema,
          },
        },
      },
      401: {
        description: '인증 실패',
        content: {
          'application/json': {
            schema: CommentErrorResponseSchema,
          },
        },
      },
      404: {
        description: '부모 댓글을 찾을 수 없음',
        content: {
          'application/json': {
            schema: CommentErrorResponseSchema,
          },
        },
      },
    },
  });
}
