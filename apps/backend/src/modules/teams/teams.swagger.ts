import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import {
  SearchTeamsCommentsParamsSchema,
  SearchTeamsCommentsQuerySchema,
  SearchTeamsCommentsResponseSchema,
} from './teams.dto.js';

export function registerTeamsSwagger(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'get',
    path: '/teams/{id}/comments',
    tags: ['Teams'],

    summary: '팀 댓글 검색',
    description: '팀 내 이슈 댓글을 검색합니다.',

    request: {
      params: SearchTeamsCommentsParamsSchema,
      query: SearchTeamsCommentsQuerySchema,
    },

    responses: {
      200: {
        description: '댓글 목록 조회 성공',
        content: {
          'application/json': {
            schema: SearchTeamsCommentsResponseSchema,
          },
        },
      },
    },
  });
}
