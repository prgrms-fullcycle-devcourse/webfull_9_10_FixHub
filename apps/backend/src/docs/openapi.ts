import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { registerHealthSwagger } from '../modules/health/health.swagger.js';
import { registerAuthSwagger } from '../modules/auth/auth.swagger.js';
import { registerUsersSwagger } from '../modules/users/users.swagger.js';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

registerHealthSwagger(registry);
registerAuthSwagger(registry);
registerUsersSwagger(registry);

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
      url: process.env.OPENAPI_URL ?? 'http://localhost:3000',
    },
  ],
});
