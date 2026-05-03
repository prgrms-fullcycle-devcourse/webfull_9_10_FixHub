import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import {
  SearchIssuesQuerySchema,
  SearchIssuesResponseSchema,
} from './issues.dto.js';
import { zod as z } from '../../common/lib/zod.js';

const publicIssueItemSchema = z
  .object({
    id: z.string().openapi({ example: 'issue-uuid-020' }),
    title: z.string().openapi({ example: 'Spring Security 403 오류' }),
    teamName: z.string().openapi({ example: '백엔드 팀' }),
    author: z.string().openapi({ example: '홍길동' }),
    tags: z.array(z.string()).openapi({ example: ['BACKEND', 'SECURITY'] }),
    summary: z
      .string()
      .openapi({ example: '권한 처리 과정에서 403 에러가 발생합니다.' }),
    commentCount: z.number().openapi({ example: 3 }),
    createdAt: z.string().openapi({ example: '2026-04-30T10:00:00.000Z' }),
  })
  .openapi('PublicIssueItem');

const getPublicIssuesResponseSchema = z
  .object({
    meta: z.object({
      totalItemCount: z.number().openapi({ example: 80 }),
      currentItemCount: z.number().openapi({ example: 20 }),
      itemsPerPage: z.number().openapi({ example: 20 }),
      currentPage: z.number().openapi({ example: 1 }),
      totalPages: z.number().openapi({ example: 4 }),
    }),
    data: z.array(publicIssueItemSchema),
  })
  .openapi('GetPublicIssuesResponse');

const errorResponseSchema = z
  .object({
    error: z.object({
      code: z.string().openapi({ example: 'VALIDATION_ERROR' }),
      message: z.string().openapi({ example: '잘못된 쿼리 파라미터입니다.' }),
    }),
  })
  .openapi('IssueErrorResponse');

export function registerIssuesSwagger(registry: OpenAPIRegistry) {
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

  registry.registerPath({
    method: 'get',
    path: '/issues/public',
    tags: ['Issue'],
    summary: '최신 이슈 피드 조회',
    request: {
      query: z.object({
        page: z.number().optional().openapi({ example: 1 }),
        limit: z.number().optional().openapi({ example: 20 }),
      }),
    },
    responses: {
      200: {
        description: '최신 이슈 피드 조회 성공',
        content: {
          'application/json': {
            schema: getPublicIssuesResponseSchema,
          },
        },
      },
      400: {
        description: '잘못된 요청',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
  });
}
