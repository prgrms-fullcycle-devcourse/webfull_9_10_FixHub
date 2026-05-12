import { zod as z } from '../../common/lib/zod.js';

// 공통 페이지네이션
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const PaginationMetaSchema = z.object({
  totalItemCount: z.number(),
  currentItemCount: z.number(),
  itemsPerPage: z.number(),
  currentPage: z.number(),
  totalPages: z.number(),
});

// 공통 에러
export const UserErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().openapi({ example: 'NOT_FOUND' }),
    message: z.string().openapi({ example: '유저를 찾을 수 없습니다.' }),
  }),
});

// GET /users/me (내 프로필 조회)
export const GetMyProfileResponseSchema = z.object({
  id: z.uuidv7().openapi({ example: '00000000-0000-0000-0000-000000000001' }),
  name: z.string().openapi({ example: '김이름' }),
  email: z.string().email().openapi({ example: 'testemail@email.com' }),
  profileImg: z
    .string()
    .url()
    .nullable()
    .openapi({ example: 'https://example.com/profile.png' }),
  createdAt: z.string().openapi({ example: '2026.05.06' }),
  totalScore: z.number().openapi({ example: 1240 }),
  issueCount: z.number().openapi({ example: 17 }),
  solvedCount: z.number().openapi({ example: 42 }),
});

export type GetMyProfileResponseDto = z.infer<
  typeof GetMyProfileResponseSchema
>;

// PATCH /users/me (내 프로필 수정)
export const UpdateMyProfileBodySchema = z.object({
  name: z.string().min(1).max(50).optional().openapi({ example: '새이름' }),
  email: z
    .string()
    .email()
    .optional()
    .openapi({ example: 'newemail@email.com' }),
  profileImg: z
    .string()
    .url()
    .nullable()
    .optional()
    .openapi({ example: 'https://example.com/new.png' }),
  password: z
    .object({
      current: z.string().min(8).openapi({ example: 'currentPassword1!' }),
      next: z.string().min(8).openapi({ example: 'newPassword1!' }),
    })
    .optional(),
});

export const UpdateMyProfileResponseSchema = z.object({
  id: z.uuidv7().openapi({ example: '00000000-0000-0000-0000-000000000001' }),
  name: z.string().openapi({ example: '새이름' }),
  profileImg: z
    .string()
    .url()
    .nullable()
    .openapi({ example: 'https://example.com/new.png' }),
  updatedAt: z.string().openapi({ example: '2026-05-08T10:00:00.000Z' }),
});

export type UpdateMyProfileBodyDto = z.infer<typeof UpdateMyProfileBodySchema>;
export type UpdateMyProfileResponseDto = z.infer<
  typeof UpdateMyProfileResponseSchema
>;

// GET /users/:userId (다른 유저 프로필 조회)
export const GetUserProfileParamsSchema = z.object({
  userId: z.uuidv7(),
});

export const GetUserProfileResponseSchema = z.object({
  id: z.uuidv7().openapi({ example: '00000000-0000-0000-0000-000000000002' }),
  name: z.string().openapi({ example: '홍길동' }),
  profileImg: z.string().url().nullable().openapi({ example: null }),
  createdAt: z.string().openapi({ example: '2026.01.01' }),
  totalScore: z.number().openapi({ example: 800 }),
  issueCount: z.number().openapi({ example: 10 }),
  solvedCount: z.number().openapi({ example: 25 }),
});

export type GetUserProfileParamsDto = z.infer<
  typeof GetUserProfileParamsSchema
>;
export type GetUserProfileResponseDto = z.infer<
  typeof GetUserProfileResponseSchema
>;

// GET /users/me/issues (내가 작성한 이슈 목록)
export const GetMyIssuesQuerySchema = PaginationQuerySchema;

const IssueItemSchema = z.object({
  id: z.uuidv7().openapi({ example: 'issue-uuid-001' }),
  title: z
    .string()
    .openapi({ example: '로그인 시 간헐적으로 500에러가 발생합니다 ㅠㅠ' }),
  status: z.enum(['UNSOLVED', 'SOLVED']).openapi({ example: 'UNSOLVED' }),
  tags: z
    .array(z.string())
    .openapi({ example: ['Javascript', 'React', 'Axios'] }),
  summary: z.string().openapi({
    example: '왜이러는지 모르겠는데 아니 이게 왜이래요 이유를 말해주세요...',
  }),
  commentCount: z.number().openapi({ example: 5 }),
  adoptedCount: z.number().openapi({ example: 1 }),
  createdAt: z.string().openapi({ example: '2026-05-06T10:00:00.000Z' }),
  teamId: z.uuidv7().openapi({ example: 'team-uuid-001' }),
  teamName: z.string().openapi({ example: '팀 A' }),
});

export const GetMyIssuesResponseSchema = z.object({
  meta: PaginationMetaSchema,
  data: z.array(IssueItemSchema),
});

export type GetMyIssuesQueryDto = z.infer<typeof GetMyIssuesQuerySchema>;
export type GetMyIssuesResponseDto = z.infer<typeof GetMyIssuesResponseSchema>;

// GET /users/me/solved (내가 해결한 이슈 목록)
export const GetMySolvedQuerySchema = PaginationQuerySchema;

const SolvedIssueItemSchema = z.object({
  id: z.uuidv7().openapi({ example: 'issue-uuid-002' }),
  title: z
    .string()
    .openapi({ example: '로그인 시 간헐적으로 500에러가 발생합니다 ㅠㅠ' }),
  status: z.enum(['UNSOLVED', 'SOLVED']).openapi({ example: 'SOLVED' }),
  tags: z.array(z.string()).openapi({ example: ['HTML', 'CSS', 'Javascript'] }),
  summary: z.string().openapi({ example: '왜이러는지 모르겠는데...' }),
  commentCount: z.number().openapi({ example: 5 }),
  adoptedCount: z.number().openapi({ example: 1 }),
  createdAt: z.string().openapi({ example: '2026-05-04T10:00:00.000Z' }),
  teamId: z.uuidv7().openapi({ example: 'team-uuid-001' }),
  teamName: z.string().openapi({ example: '팀 A' }),
  myAdoptedCommentId: z.uuidv7().openapi({ example: 'comment-uuid-001' }),
});

export const GetMySolvedResponseSchema = z.object({
  meta: PaginationMetaSchema,
  data: z.array(SolvedIssueItemSchema),
});

export type GetMySolvedQueryDto = z.infer<typeof GetMySolvedQuerySchema>;
export type GetMySolvedResponseDto = z.infer<typeof GetMySolvedResponseSchema>;

// GET /users/me/score (점수 히스토리 - 잔디 그래프용)
export const GetMyScoreQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).optional().openapi({ example: 2026 }),
});

const ScoreLogItemSchema = z.object({
  id: z.uuidv7().openapi({ example: 'score-log-uuid-001' }),
  amount: z.number().openapi({ example: 5 }),
  reason: z.string().openapi({ example: '댓글 채택' }),
  issueId: z.uuidv7().nullable().openapi({ example: 'issue-uuid-001' }),
  issueTitle: z
    .string()
    .nullable()
    .openapi({ example: '로그인 시 간헐적으로 500에러가 발생합니다 ㅠㅠ' }),
  createdAt: z.string().openapi({ example: '2026-05-01T10:00:00.000Z' }),
});

const DailyScoreSchema = z.object({
  date: z.string().openapi({ example: '2026-05-01' }),
  totalAmount: z.number().openapi({ example: 15 }),
  logs: z.array(ScoreLogItemSchema),
});

export const GetMyScoreResponseSchema = z.object({
  year: z.number().openapi({ example: 2026 }),
  totalScore: z.number().openapi({ example: 1240 }),
  daily: z.array(DailyScoreSchema),
});

export type GetMyScoreQueryDto = z.infer<typeof GetMyScoreQuerySchema>;
export type GetMyScoreResponseDto = z.infer<typeof GetMyScoreResponseSchema>;

// GET /users/me/score/logs (점수 획득 목록 - 페이지네이션)
export const GetMyScoreLogsQuerySchema = PaginationQuerySchema;

export const GetMyScoreLogsResponseSchema = z.object({
  meta: PaginationMetaSchema,
  data: z.array(ScoreLogItemSchema),
});

export type GetMyScoreLogsQueryDto = z.infer<typeof GetMyScoreLogsQuerySchema>;
export type GetMyScoreLogsResponseDto = z.infer<
  typeof GetMyScoreLogsResponseSchema
>;
