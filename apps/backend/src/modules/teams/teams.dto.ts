import { zod as z } from '../../common/lib/zod.js';

// 팀 생성
export const CreateTeamBodySchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
});

export const CreateTeamResponseSchema = z.object({
  teamId: z.uuidv7(),
  name: z.string(),
  description: z.string().nullable(),
  inviteCode: z.string(),
});

export type CreateTeamBodyDto = z.infer<typeof CreateTeamBodySchema>;
export type CreateTeamResponseDto = z.infer<typeof CreateTeamResponseSchema>;

// 내가 속한 팀 조회
export const GetMyTeamsResponseSchema = z.object({
  data: z.array(
    z.object({
      teamId: z.uuidv7(),
      name: z.string(),
      memberCount: z.number(),
      ownerId: z.uuidv7().nullable(),
    }),
  ),
});

export type GetMyTeamsResponseDto = z.infer<typeof GetMyTeamsResponseSchema>;
