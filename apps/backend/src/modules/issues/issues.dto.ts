import { IssueStatus } from '@prisma/client';

import { zod as z } from '../../common/lib/zod.js';

export const SearchIssuesQuerySchema = z.object({
  search: z.string().min(1).optional(),
});

export const SearchIssuesResponseSchema = z.object({
  meta: z.object({
    totalItemCount: z.number(),
    currentItemCount: z.number(),
    itemsPerPage: z.number(),
    currentPage: z.number(),
    totalPages: z.number(),
  }),
  data: z.array(
    z.object({
      id: z.uuidv7(),
      title: z.string(),
      teamName: z.string(),
      author: z.string(),
      tag: z.array(z.string()),
      status: z.enum(['UNSOLVED', 'SOLVED']),
      commentCount: z.number(),
      createdAt: z.string(),
    }),
  ),
});

export type SearchIssuesQueryDto = z.infer<typeof SearchIssuesQuerySchema>;
export type SearchIssuesResponseDto = z.infer<
  typeof SearchIssuesResponseSchema
>;

export type SearchIssuesQueryObjectDto = {
  teamId?: string;
  title: string[];
  author?: string;
  tag: string[];
  status?: IssueStatus;
  content: string[];
  page?: number;
};

export const issueStatusSchema = z.enum(['UNSOLVED', 'SOLVED']);

export const getPublicIssuesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
  search: z.string().trim().optional(),
  tag: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      return Array.isArray(value) ? value : [value];
    }),
  status: issueStatusSchema.optional(),
});

export type GetPublicIssuesQuery = z.infer<typeof getPublicIssuesQuerySchema>;

/* 이슈 상세 조회 */
export const GetIssueDetailParamsSchema = z.object({
  teamId: z.uuidv7(),
  issueId: z.uuidv7(),
});

export const GetIssueDetailResponseSchema = z.object({
  id: z.string().openapi({ example: 'issue-uuid-010' }),
  title: z.string().openapi({ example: 'Redis 연결 타임아웃 오류' }),
  content: z.string().openapi({
    example:
      '## 문제\nRedis 연결 시 타임아웃이 발생합니다.\n\n## 시도한 것\n...',
  }),
  tag: z.array(z.string()).openapi({ example: ['BACKEND', 'INFRA'] }),
  author: z.string().openapi({ example: '홍길동' }),
  errorLog: z.string().openapi({
    example:
      'Error: connect ETIMEDOUT 127.0.0.1:6379\n    at TCPConnectWrap...',
  }),
  isPublic: z.boolean().openapi({ example: true }),
  status: z.enum(['UNSOLVED', 'SOLVED']).openapi({ example: 'UNSOLVED' }),
  logs: z.array(
    z.object({
      logId: z.string().openapi({ example: 'log-uuid-001' }),
      logType: z.enum(['ERROR', 'WARN']).openapi({ example: 'ERROR' }),
      source: z.string().nullable().openapi({ example: 'RedisClient' }),
      message: z
        .string()
        .openapi({ example: 'connect ETIMEDOUT 127.0.0.1:6379' }),
    }),
  ),
});

export type GetIssueDetailParamsDto = z.infer<
  typeof GetIssueDetailParamsSchema
>;
export type GetIssueDetailResponseDto = z.infer<
  typeof GetIssueDetailResponseSchema
>;

/* 이슈 등록 */
export const CreateIssueParamsSchema = z.object({
  teamId: z.uuidv7(),
});

export const CreateIssueBodySchema = z.object({
  title: z.string().min(1).openapi({ example: 'Redis 연결 타임아웃 오류' }),
  content: z.string().min(1).openapi({
    example:
      '## 문제\nRedis 연결 시 타임아웃이 발생합니다.\n\n## 시도한 것\n...',
  }),
  tag: z.array(z.string().min(1)).openapi({ example: ['BACKEND', 'INFRA'] }),
  isPublic: z.boolean().openapi({ example: true }),
  logs: z.array(
    z.object({
      logType: z.enum(['ERROR', 'WARN']).openapi({ example: 'ERROR' }),
      source: z.string().min(1).openapi({ example: 'RedisClient' }),
      message: z
        .string()
        .min(1)
        .openapi({ example: 'connect ETIMEDOUT 127.0.0.1:6379' }),
    }),
  ),
});

export const CreateIssueResponseSchema = z.object({
  id: z.string().openapi({ example: 'issue-uuid-010' }),
  createdAt: z.string().openapi({ example: '2025-04-22T10:00:00Z' }),
});

export type CreateIssueParamsDto = z.infer<typeof CreateIssueParamsSchema>;
export type CreateIssueBodyDto = z.infer<typeof CreateIssueBodySchema>;
export type CreateIssueResponseDto = z.infer<typeof CreateIssueResponseSchema>;
