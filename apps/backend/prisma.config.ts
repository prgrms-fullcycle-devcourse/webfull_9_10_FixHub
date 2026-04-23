import { defineConfig } from 'prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL, //DB 연결 전
  },
});