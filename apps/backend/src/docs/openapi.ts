import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { registerHealthSwagger } from '../modules/health/health.swagger.js';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

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
