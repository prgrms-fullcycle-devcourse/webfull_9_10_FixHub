import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { CreateTeamBodySchema, CreateTeamResponseSchema } from './teams.dto.js';

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export function registerTeamsSwagger(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'post',
    path: '/teams',
    tags: ['Teams'],

    summary: '팀 생성',
    description: '새로운 팀을 생성합니다.',

    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateTeamBodySchema,
          },
        },
      },
    },

    responses: {
      201: {
        description: '팀 생성 성공',
        content: {
          'application/json': {
            schema: CreateTeamResponseSchema,
          },
        },
      },

      400: {
        description: '입력 값 오류',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },

      401: {
        description: '인증 필요',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });
}
