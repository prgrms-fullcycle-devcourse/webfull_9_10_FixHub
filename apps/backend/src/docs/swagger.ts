import swaggerUi from 'swagger-ui-express';

import { openApiDocument } from './openapi.js';

export const swaggerUiServe = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(openApiDocument);
