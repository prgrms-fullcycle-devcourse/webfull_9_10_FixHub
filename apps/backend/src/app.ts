import cors from 'cors';
import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';

import { errorHandler } from './common/errors/errorHandler.js';

import { swaggerUiServe, swaggerUiSetup } from './docs/swagger.js';
import { authRouter } from './modules/auth/auth.route.js';
import commentsRouter from './modules/comments/comments.route.js';
import errorsRouter from './modules/errors/errors.route.js';
import healthRouter from './modules/health/health.route.js';
import teamsRouter from './modules/teams/teams.route.js';
import usersRouter from './modules/users/users.route.js';
import { openApiDocument } from './docs/openapi.js';

const app: Express = express();

app.use(cors());
app.use(cookieParser());
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

app.use('/auth', authRouter);
app.use('/issues', commentsRouter);
app.use('/', errorsRouter);
app.use('/', healthRouter);
app.use('/', teamsRouter);
app.use('/', usersRouter);

app.use(errorHandler);

export default app;
