import express, { type Express } from 'express';
import cors from 'cors';
import { swaggerUiServe, swaggerUiSetup } from './docs/swagger.js';

const app: Express = express();

app.use(cors());
app.use(express.json());

// swagger 문서 경로
app.use('/api-docs', swaggerUiServe, swaggerUiSetup);

// 서버 상태 확인용 라우트
app.get('/health', (req, res) => {
  res.json({ message: 'ok' });
});

export default app;