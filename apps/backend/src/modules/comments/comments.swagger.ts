import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import {
  AdoptCommentParamsSchema,
  AdoptCommentResponseSchema,
  CommentErrorResponseSchema,
  CreateCommentBodySchema,
  CreateCommentParamsSchema,
  CreateCommentResponseSchema,
  GetCommentsParamsSchema,
  GetCommentsResponseSchema,
} from './comments.dto.js';

export function registerCommentsSwagger(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'get',
    path: '/issues/{id}/comments',
    operationId: 'getComments',
    tags: ['Comments'],
    summary: '댓글 목록 조회',
    description: '이슈에 작성된 일반 댓글과 대댓글 목록을 조회합니다.',
    request: {
      params: GetCommentsParamsSchema,
    },
    responses: {
      200: {
        description: '댓글 목록 조회 성공',
        content: {
          'application/json': {
            schema: GetCommentsResponseSchema,
          },
        },
      },
      404: {
        description: '이슈를 찾을 수 없음',
        content: {
          'application/json': {
            schema: CommentErrorResponseSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/issues/{id}/comments/{commentId}/adopt',
    operationId: 'adoptComment',
    tags: ['Comments'],
    summary: '댓글 채택',
    description: '이슈 작성자가 해결 제안 댓글을 채택합니다.',
    request: {
      params: AdoptCommentParamsSchema,
    },
    responses: {
      200: {
        description: '댓글 채택 성공',
        content: {
          'application/json': {
            schema: AdoptCommentResponseSchema,
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
      403: {
        description: '이슈 작성자 권한 없음',
        content: {
          'application/json': {
            schema: CommentErrorResponseSchema,
          },
        },
      },
      404: {
        description: '댓글 또는 팀 멤버를 찾을 수 없음',
        content: {
          'application/json': {
            schema: CommentErrorResponseSchema,
          },
        },
      },
      409: {
        description: '이미 채택된 댓글이 있음',
        content: {
          'application/json': {
            schema: CommentErrorResponseSchema,
          },
        },
      },
    },
  });

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
