import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';

import { registerCommentsSwagger } from '../modules/comments/comments.swagger.js';
import { registerHealthSwagger } from '../modules/health/health.swagger.js';

const registry = new OpenAPIRegistry();

registerCommentsSwagger(registry);
registerHealthSwagger(registry);

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
