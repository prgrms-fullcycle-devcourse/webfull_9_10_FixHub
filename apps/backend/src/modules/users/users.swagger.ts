import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import {
  GetMyProfileResponseSchema,
  UpdateMyProfileBodySchema,
  UpdateMyProfileResponseSchema,
  GetUserProfileParamsSchema,
  GetUserProfileResponseSchema,
  GetMyIssuesQuerySchema,
  GetMyIssuesResponseSchema,
  GetMySolvedQuerySchema,
  GetMySolvedResponseSchema,
  GetMyScoreQuerySchema,
  GetMyScoreResponseSchema,
  GetMyScoreLogsQuerySchema,
  GetMyScoreLogsResponseSchema,
  UserErrorResponseSchema,
} from './users.dto.js';

export function registerUsersSwagger(registry: OpenAPIRegistry) {
  // GET /users/me
  registry.registerPath({
    method: 'get',
    path: '/users/me',
    operationId: 'getMyProfile',
    tags: ['Users'],
    summary: '내 프로필 조회',
    description: '로그인한 사용자의 프로필 정보를 조회합니다.',
    security: [{ cookieAuth: [] }],
    responses: {
      200: {
        description: '프로필 조회 성공',
        content: { 'application/json': { schema: GetMyProfileResponseSchema } },
      },
      401: {
        description: '인증 실패',
        content: { 'application/json': { schema: UserErrorResponseSchema } },
      },
    },
  });

  // PATCH /users/me
  registry.registerPath({
    method: 'patch',
    path: '/users/me',
    operationId: 'updateMyProfile',
    tags: ['Users'],
    summary: '내 프로필 수정',
    description: '이름, 프로필 이미지, 비밀번호를 수정합니다.',
    security: [{ cookieAuth: [] }],
    request: {
      body: {
        required: true,
        content: { 'application/json': { schema: UpdateMyProfileBodySchema } },
      },
    },
    responses: {
      200: {
        description: '프로필 수정 성공',
        content: {
          'application/json': { schema: UpdateMyProfileResponseSchema },
        },
      },
      400: {
        description: '잘못된 요청',
        content: { 'application/json': { schema: UserErrorResponseSchema } },
      },
      401: {
        description: '인증 실패 또는 현재 비밀번호 불일치',
        content: { 'application/json': { schema: UserErrorResponseSchema } },
      },
    },
  });

  // GET /users/:userId
  registry.registerPath({
    method: 'get',
    path: '/users/{userId}',
    operationId: 'getUserProfile',
    tags: ['Users'],
    summary: '다른 유저 프로필 조회',
    description: '특정 유저의 공개 프로필 정보를 조회합니다.',
    request: {
      params: GetUserProfileParamsSchema,
    },
    responses: {
      200: {
        description: '유저 프로필 조회 성공',
        content: {
          'application/json': { schema: GetUserProfileResponseSchema },
        },
      },
      400: {
        description: '잘못된 userId 형식',
        content: { 'application/json': { schema: UserErrorResponseSchema } },
      },
      404: {
        description: '유저를 찾을 수 없음',
        content: { 'application/json': { schema: UserErrorResponseSchema } },
      },
    },
  });

  // GET /users/me/issues
  registry.registerPath({
    method: 'get',
    path: '/users/me/issues',
    operationId: 'getMyIssues',
    tags: ['Users'],
    summary: '내가 작성한 이슈 목록',
    description:
      '로그인한 사용자가 작성한 이슈 목록을 페이지네이션으로 조회합니다.',
    security: [{ cookieAuth: [] }],
    request: {
      query: GetMyIssuesQuerySchema,
    },
    responses: {
      200: {
        description: '내가 작성한 이슈 목록 조회 성공',
        content: { 'application/json': { schema: GetMyIssuesResponseSchema } },
      },
      401: {
        description: '인증 실패',
        content: { 'application/json': { schema: UserErrorResponseSchema } },
      },
    },
  });

  // GET /users/me/solved
  registry.registerPath({
    method: 'get',
    path: '/users/me/solved',
    operationId: 'getMySolved',
    tags: ['Users'],
    summary: '내가 해결한 이슈 목록',
    description: '내 댓글이 채택된 이슈 목록을 페이지네이션으로 조회합니다.',
    security: [{ cookieAuth: [] }],
    request: {
      query: GetMySolvedQuerySchema,
    },
    responses: {
      200: {
        description: '내가 해결한 이슈 목록 조회 성공',
        content: { 'application/json': { schema: GetMySolvedResponseSchema } },
      },
      401: {
        description: '인증 실패',
        content: { 'application/json': { schema: UserErrorResponseSchema } },
      },
    },
  });

  // GET /users/me/score
  registry.registerPath({
    method: 'get',
    path: '/users/me/score',
    operationId: 'getMyScore',
    tags: ['Users'],
    summary: '점수 히스토리 (잔디 그래프용)',
    description:
      '연도별 날짜별 점수 획득 내역을 조회합니다. year 미입력 시 현재 연도.',
    security: [{ cookieAuth: [] }],
    request: {
      query: GetMyScoreQuerySchema,
    },
    responses: {
      200: {
        description: '점수 히스토리 조회 성공',
        content: { 'application/json': { schema: GetMyScoreResponseSchema } },
      },
      401: {
        description: '인증 실패',
        content: { 'application/json': { schema: UserErrorResponseSchema } },
      },
    },
  });

  // GET /users/me/score/logs
  registry.registerPath({
    method: 'get',
    path: '/users/me/score/logs',
    operationId: 'getMyScoreLogs',
    tags: ['Users'],
    summary: '점수 획득 목록',
    description:
      '점수 획득 내역을 페이지네이션으로 조회합니다. (마이페이지 점수 획득 목록 섹션)',
    security: [{ cookieAuth: [] }],
    request: {
      query: GetMyScoreLogsQuerySchema,
    },
    responses: {
      200: {
        description: '점수 획득 목록 조회 성공',
        content: {
          'application/json': { schema: GetMyScoreLogsResponseSchema },
        },
      },
      401: {
        description: '인증 실패',
        content: { 'application/json': { schema: UserErrorResponseSchema } },
      },
    },
  });
}
