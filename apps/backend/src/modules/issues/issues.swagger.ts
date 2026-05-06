import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import {
  SearchIssuesQuerySchema,
  SearchIssuesResponseSchema,
  GetIssueDetailParamsSchema,
  GetIssueDetailResponseSchema,
  CreateIssueParamsSchema,
  CreateIssueBodySchema,
  CreateIssueResponseSchema,
  UpdateIssueParamsSchema,
  UpdateIssueBodySchema,
  UpdateIssueResponseSchema,
  DeleteIssueParamsSchema,
  DeleteIssueResponseSchema,
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

const publicBadRequestSchema = z
  .object({
    error: z.object({
      code: z.string().openapi({ example: 'VALIDATION_ERROR' }),
      message: z.string().openapi({ example: '요청 값이 올바르지 않습니다.' }),
    }),
  })
  .openapi('PublicBadRequest');

const detailBadRequestSchema = z
  .object({
    error: z.object({
      code: z.string().openapi({ example: 'VALIDATION_ERROR' }),
      message: z.string().openapi({ example: '값이 올바르지 않습니다.' }),
    }),
  })
  .openapi('DetailBadRequest');

const notFoundSchema = z
  .object({
    error: z.object({
      code: z.string().openapi({ example: 'NOT_FOUND' }),
      message: z.string().openapi({ example: '이슈를 찾을 수 없습니다.' }),
    }),
  })
  .openapi('NotFound');

const createBadRequestSchema = z
  .object({
    error: z.object({
      code: z.string().openapi({ example: 'VALIDATION_ERROR' }),
      message: z
        .string()
        .openapi({ example: '요청 본문 값이 올바르지 않습니다.' }),
    }),
  })
  .openapi('CreateBadRequest');

const unauthorizedSchema = z
  .object({
    error: z.object({
      code: z.string().openapi({ example: 'UNAUTHORIZED' }),
      message: z.string().openapi({ example: '로그인이 필요합니다.' }),
    }),
  })
  .openapi('Unauthorized');

const forbiddenSchema = z
  .object({
    error: z.object({
      code: z.string().openapi({ example: 'FORBIDDEN' }),
      message: z
        .string()
        .openapi({ example: '해당 팀에 이슈를 등록할 권한이 없습니다.' }),
    }),
  })
  .openapi('Forbidden');

const issueDetailExample = {
  id: 'issue-uuid-010',
  title: 'Redis 연결 타임아웃 오류',
  content: '## 문제\nRedis 연결 시 타임아웃이 발생합니다.\n\n## 시도한 것\n...',
  tag: ['BACKEND', 'INFRA'],
  author: '홍길동',
  errorLog: 'Error: connect ETIMEDOUT 127.0.0.1:6379\n    at TCPConnectWrap...',
  isPublic: true,
  status: 'UNSOLVED',
  logs: [
    {
      logId: 'log-uuid-001',
      logType: 'SENT',
      source: 'RedisClient',
      message: 'connect ETIMEDOUT 127.0.0.1:6379',
    },
    {
      logId: 'log-uuid-002',
      logType: 'RECEIVED',
      source: 'ConnectionPool',
      message: 'Max retries exceeded',
    },
  ],
};

const createIssueRequestExample = {
  title: 'Redis 연결 타임아웃 오류',
  content: '## 문제\nRedis 연결 시 타임아웃이 발생합니다.\n\n## 시도한 것\n...',
  tag: ['BACKEND', 'INFRA'],
  isPublic: true,
  logs: [
    {
      logType: 'SENT',
      source: 'RedisClient',
      message: 'connect ETIMEDOUT 127.0.0.1:6379',
    },
    {
      logType: 'RECEIVED',
      source: 'ConnectionPool',
      message: 'Max retries exceeded',
    },
  ],
};

const createIssueResponseExample = {
  id: 'issue-uuid-010',
  createdAt: '2025-04-22T10:00:00Z',
};

const updateIssueRequestExample = {
  title: '수정된 제목',
  content: '수정된 내용입니다.',
  tags: ['BACKEND'],
  isPublic: false,
  logs: [
    {
      logType: 'SENT',
      stackTrace: '에러 로그 내용',
    },
    {
      logType: 'RECEIVED',
      stackTrace: '요청 정보 내용',
    },
  ],
};

const updateIssueResponseExample = {
  id: 'issue-uuid-010',
  updatedAt: '2025-04-22T11:00:00Z',
};

const deleteIssueResponseExample = {
  success: true,
};

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
            schema: publicBadRequestSchema,
          },
        },
      },
    },
  });

  /* 이슈 상세 조회 */
  registry.registerPath({
    method: 'get',
    path: '/teams/{teamId}/issues/{issueId}',
    tags: ['Issue'],
    summary: '이슈 상세 조회',
    description: '팀에 속한 특정 이슈의 상세 정보를 조회합니다.',
    request: {
      params: GetIssueDetailParamsSchema,
    },
    responses: {
      200: {
        description: '이슈 상세 조회 성공',
        content: {
          'application/json': {
            schema: GetIssueDetailResponseSchema,
            example: issueDetailExample,
          },
        },
      },
      400: {
        description: '잘못된 요청',
        content: {
          'application/json': {
            schema: detailBadRequestSchema,
          },
        },
      },
      404: {
        description: '이슈를 찾을 수 없음',
        content: {
          'application/json': {
            schema: notFoundSchema,
          },
        },
      },
    },
  });

  /* 이슈 등록 */
  registry.registerPath({
    method: 'post',
    path: '/teams/{teamId}/issues',
    tags: ['Issue'],
    summary: '이슈 등록',
    description: '팀에 새로운 이슈를 등록합니다.',
    request: {
      params: CreateIssueParamsSchema,
      body: {
        content: {
          'application/json': {
            schema: CreateIssueBodySchema,
            example: createIssueRequestExample,
          },
        },
      },
    },
    responses: {
      201: {
        description: '이슈 등록 성공',
        content: {
          'application/json': {
            schema: CreateIssueResponseSchema,
            example: createIssueResponseExample,
          },
        },
      },
      400: {
        description: '잘못된 요청',
        content: {
          'application/json': {
            schema: createBadRequestSchema,
          },
        },
      },
      401: {
        description: '인증 필요',
        content: {
          'application/json': {
            schema: unauthorizedSchema,
          },
        },
      },
      403: {
        description: '권한 없음',
        content: {
          'application/json': {
            schema: forbiddenSchema,
          },
        },
      },
    },
  });

  /* 이슈 수정 */
  registry.registerPath({
    method: 'patch',
    path: '/teams/{teamId}/issues/{issueId}',
    tags: ['Issue'],
    summary: '이슈 수정',
    description: '팀에 속한 특정 이슈를 수정합니다.',
    request: {
      params: UpdateIssueParamsSchema,
      body: {
        content: {
          'application/json': {
            schema: UpdateIssueBodySchema,
            example: updateIssueRequestExample,
          },
        },
      },
    },
    responses: {
      200: {
        description: '이슈 수정 성공',
        content: {
          'application/json': {
            schema: UpdateIssueResponseSchema,
            example: updateIssueResponseExample,
          },
        },
      },
      400: {
        description: '잘못된 요청',
        content: {
          'application/json': {
            schema: createBadRequestSchema,
          },
        },
      },
      401: {
        description: '인증 필요',
        content: {
          'application/json': {
            schema: unauthorizedSchema,
          },
        },
      },
      403: {
        description: '권한 없음',
        content: {
          'application/json': {
            schema: forbiddenSchema,
          },
        },
      },
      404: {
        description: '이슈를 찾을 수 없음',
        content: {
          'application/json': {
            schema: notFoundSchema,
          },
        },
      },
    },
  });

  /* 이슈 삭제 */
  registry.registerPath({
    method: 'delete',
    path: '/teams/{teamId}/issues/{issueId}',
    tags: ['Issue'],
    summary: '이슈 삭제',
    description: '팀에 속한 특정 이슈를 삭제합니다.',
    request: {
      params: DeleteIssueParamsSchema,
    },
    responses: {
      200: {
        description: '이슈 삭제 성공',
        content: {
          'application/json': {
            schema: DeleteIssueResponseSchema,
            example: deleteIssueResponseExample,
          },
        },
      },
      400: {
        description: '잘못된 요청',
        content: {
          'application/json': {
            schema: createBadRequestSchema,
          },
        },
      },
      401: {
        description: '인증 필요',
        content: {
          'application/json': {
            schema: unauthorizedSchema,
          },
        },
      },
      403: {
        description: '권한 없음',
        content: {
          'application/json': {
            schema: forbiddenSchema,
          },
        },
      },
      404: {
        description: '이슈를 찾을 수 없음',
        content: {
          'application/json': {
            schema: notFoundSchema,
          },
        },
      },
    },
  });
}
