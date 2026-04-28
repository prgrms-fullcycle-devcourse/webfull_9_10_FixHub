import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import {
  HealthCheckQuerySchema,
  HealthCheckResponseSchema,
} from './health.dto.js';

export function registerHealthSwagger(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'get',
    path: '/',
    description: 'Health check API',
    request: {
      query: HealthCheckQuerySchema,
    },
    responses: {
      200: {
        description: 'Health check result',
        content: {
          'application/json': {
            schema: HealthCheckResponseSchema,
          },
        },
      },
    },
  });
}
