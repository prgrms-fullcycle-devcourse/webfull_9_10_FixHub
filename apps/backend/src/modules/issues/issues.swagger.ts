import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import {
  SearchIssuesQuerySchema,
  SearchIssuesResponseSchema,
} from './issues.dto.js';

export function registerTeamsSwagger(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'get',
    path: '/issues/search',
    tags: ['Issues'],

    summary: '이슈 검색',
    description: '검색 태그를 이용해 이슈를 검색합니다.',

    request: {
      query: SearchIssuesQuerySchema,
    },

    responses: {
      200: {
        description: '검색 목록 조회 성공',
        content: {
          'application/json': {
            schema: SearchIssuesResponseSchema,
          },
        },
      },
    },
  });
}
