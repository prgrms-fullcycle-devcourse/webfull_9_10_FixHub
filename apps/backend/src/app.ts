import express, { type Express } from 'express';
import cors from 'cors';

import { swaggerUiServe, swaggerUiSetup } from './docs/swagger.js';
import authRouter from './modules/auth/auth.route.js';
import commentsRouter from './modules/comments/comments.route.js';
import errorsRouter from './modules/errors/errors.route.js';
import healthRouter from './modules/health/health.route.js';
import teamsRouter from './modules/teams/teams.route.js';
import usersRouter from './modules/users/users.route.js';

const app: Express = express();

app.use(cors());
app.use(express.json());

// swagger 문서 경로
app.use('/api-docs', swaggerUiServe, swaggerUiSetup);

app.use('/', authRouter);
app.use('/', commentsRouter);
app.use('/', errorsRouter);
app.use('/', healthRouter);
app.use('/', teamsRouter);
app.use('/', usersRouter);

export default app;
