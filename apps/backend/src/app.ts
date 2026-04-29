import cors from 'cors';
import express, { type Express } from 'express';

import { openApiDocument } from './docs/openapi.js';
import { swaggerUiServe, swaggerUiSetup } from './docs/swagger.js';
import commentsRouter from './modules/comments/comments.route.js';

const app: Express = express();

app.use(cors());
app.use(express.json());

// swagger 문서 경로
app.use('/api-docs', swaggerUiServe, swaggerUiSetup);
app.get('/openapi.json', (_req, res) => {
  res.json(openApiDocument);
});

// 서버 상태 확인용 라우트
app.get('/health', (_req, res) => {
  res.json({ message: 'ok' });
});

app.use('/issues/:id/comments', commentsRouter);

export default app;
