import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { registerCommentsSwagger } from '../modules/comments/comments.swagger.js';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const HealthResponseSchema = z.object({
  message: z.string().openapi({
    example: 'ok',
  }),
});

registry.registerPath({
  method: 'get',
  path: '/health',
  tags: ['Health'],
  summary: '서버 상태 확인',
  responses: {
    200: {
      description: '서버 정상 응답',
      content: {
        'application/json': {
          schema: HealthResponseSchema,
        },
      },
    },
  },
});

registerCommentsSwagger(registry);

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'FixHub API',
    version: '1.0.0',
    description: 'FixHub backend API docs',
  },
  servers: [
    {
      url: 'http://localhost:3000',
    },
  ],
});
