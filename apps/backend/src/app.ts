import express, { type Express } from 'express';
import cors from 'cors';

const app: Express = express();

app.use(cors());
app.use(express.json());

// 서버 상태 확인용 라우트
app.get('/health', (req, res) => {
  res.json({ message: 'ok' });
});

export default app;