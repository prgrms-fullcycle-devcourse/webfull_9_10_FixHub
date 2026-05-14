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

// 팀 상세 조회
export const GetTeamDetailResponseSchema = z.object({
  userId: z.uuidv7(),
  teamId: z.uuidv7(),
  name: z.string(),
  description: z.string(),
  ownerId: z.uuidv7(),
  createdAt: z.iso.datetime(),
  members: z.array(
    z.object({
      userId: z.uuidv7(),
      name: z.string(),
      role: z.enum(['LEADER', 'MEMBER']),
      joinedAt: z.iso.datetime(),
      score: z.number(),
    }),
  ),
});

export type GetTeamDetailResponseDto = z.infer<
  typeof GetTeamDetailResponseSchema
>;

// 팀원 목록 조회
export const GetTeamMembersResponseSchema = z.object({
  data: z.array(
    z.object({
      userId: z.uuidv7(),
      name: z.string(),
      role: z.enum(['LEADER', 'MEMBER']),
      joinedAt: z.iso.datetime().nullable(),
      score: z.number(),
    }),
  ),
});

export type GetTeamMembersResponseDto = z.infer<
  typeof GetTeamMembersResponseSchema
>;

// 팀 설정 조회
export const GetTeamSettingsResponseSchema = z.object({
  userId: z.uuidv7(),
  teamId: z.uuidv7(),
  name: z.string(),
  description: z.string(),
  ownerId: z.uuidv7(),
  isSlackConnected: z.boolean(),
  createdAt: z.iso.datetime(),
  members: z.array(
    z.object({
      userId: z.uuidv7(),
      name: z.string(),
      role: z.enum(['LEADER', 'MEMBER']),
      joinedAt: z.iso.datetime(),
      score: z.number(),
    }),
  ),
  // TODO: 향후 알림 설정 추가
});

export type GetTeamSettingsResponseDto = z.infer<
  typeof GetTeamSettingsResponseSchema
>;

export const SlackConnectParamsSchema = z.object({
  teamId: z.uuidv7(),
});

export const SlackOAuthCallbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
});

export const SlackTestMessageParamsSchema = z.object({
  teamId: z.uuidv7(),
});

export const SlackTestMessageBodySchema = z.object({
  message: z.string().trim().min(1).max(1000),
});

export const SlackTestMessageResponseSchema = z.object({
  success: z.boolean(),
});

export const SlackNotificationSettingsParamsSchema = z.object({
  teamId: z.uuidv7(),
});

export const SlackNotificationSettingsSchema = z.object({
  issueCreated: z.boolean(),
  commentOnMyIssue: z.boolean(),
  replyOnMyComment: z.boolean(),
  commentAdopted: z.boolean(),
});

export const UpdateSlackNotificationSettingsBodySchema =
  SlackNotificationSettingsSchema;

export const SlackNotificationSettingsResponseSchema =
  SlackNotificationSettingsSchema;

export type SlackTestMessageBodyDto = z.infer<
  typeof SlackTestMessageBodySchema
>;

export type SlackTestMessageResponseDto = z.infer<
  typeof SlackTestMessageResponseSchema
>;

export type SlackNotificationSettingsDto = z.infer<
  typeof SlackNotificationSettingsSchema
>;

export type UpdateSlackNotificationSettingsBodyDto = z.infer<
  typeof UpdateSlackNotificationSettingsBodySchema
>;

// 팀 수정
export const UpdateTeamBodySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(500).optional(),
  ownerId: z.uuidv7().optional(),
});

export const UpdateTeamResponseSchema = z.object({
  teamId: z.uuidv7(),
  name: z.string(),
  description: z.string().nullable(),
});

export type UpdateTeamBodyDto = z.infer<typeof UpdateTeamBodySchema>;

export type UpdateTeamResponseDto = z.infer<typeof UpdateTeamResponseSchema>;

// 팀원 초대
export const InviteTeamMembersBodySchema = z.object({
  emails: z.array(z.email()).min(1),
});

export const InviteTeamMembersResponseSchema = z.object({
  userIds: z.array(z.uuidv7()),
});

export type InviteTeamMembersBodyDto = z.infer<
  typeof InviteTeamMembersBodySchema
>;

// 팀원 내보내기
export const DeleteTeamMemberParamsSchema = z.object({
  teamId: z.uuidv7(),
  userId: z.uuidv7(),
});

export const DeleteTeamMemberResponseSchema = z.object({
  deletedMemberId: z.uuidv7(),
});

// 팀 탈퇴
export const LeaveTeamParamsSchema = z.object({
  teamId: z.uuidv7(),
});

export const LeaveTeamResponseSchema = z.object({
  deletedMemberId: z.uuidv7(),
});

// 팀 삭제
export const DeleteTeamParamsSchema = z.object({
  teamId: z.uuidv7(),
});

export const DeleteTeamResponseSchema = z.object({
  deletedTeamId: z.uuidv7(),
});
