import { PrismaClient } from '@prisma/client';
import { uuidv7 } from 'uuidv7';

// 클라이언트 생성
// dev 환경에서 Hot Reload 시 PrismaClient 중복 생성 방지
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};

const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = basePrisma;
}

// 익스텐션(미들웨어) 정의
const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async create({ args, query }) {
        // id 없을 경우 uuid v7 삽입
        const data = args.data as Record<string, unknown>;
        if (!('id' in data)) {
          (data as Record<string, unknown>).id = uuidv7();
        }
        return query(args);
      },

      async createMany({ args, query }) {
        const records = Array.isArray(args.data) ? args.data : [args.data];
        records.forEach((record) => {
          if (!('id' in record))
            (record as Record<string, unknown>).id = uuidv7();
        });
        return query(args);
      },
    },
  },
});

export default prisma;
