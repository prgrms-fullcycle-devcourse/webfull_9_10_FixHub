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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function addIdIfMissing(data: Record<string, unknown>) {
  if (!('id' in data)) {
    data.id = uuidv7();
  }
}

function injectNestedIds(value: unknown, parentKey?: string) {
  if (Array.isArray(value)) {
    value.forEach((item) => injectNestedIds(item, parentKey));
    return;
  }

  if (!isRecord(value)) return;

  if (parentKey === 'create') {
    addIdIfMissing(value);
  }

  if (parentKey === 'createMany') {
    const data = value.data;

    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (isRecord(item)) addIdIfMissing(item);
      });
    } else if (isRecord(data)) {
      addIdIfMissing(data);
    }
  }

  Object.entries(value).forEach(([key, childValue]) => {
    injectNestedIds(childValue, key);
  });
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

        injectNestedIds(data);

        return query(args);
      },

      async createMany({ args, query }) {
        const records = Array.isArray(args.data) ? args.data : [args.data];
        records.forEach((record) => {
          if (!('id' in record))
            (record as Record<string, unknown>).id = uuidv7();

          injectNestedIds(record);
        });
        return query(args);
      },

      async upsert({ args, query }) {
        const createData = args.create as Record<string, unknown>;

        if (!('id' in createData)) {
          createData.id = uuidv7();
        }

        injectNestedIds(createData);

        return query(args);
      },

      async update({ args, query }) {
        const data = args.data as Record<string, unknown>;
        injectNestedIds(data);
        return query(args);
      },
    },
  },
});

export default prisma;
