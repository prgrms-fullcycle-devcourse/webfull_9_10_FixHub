import { zod as z } from '../../common/lib/zod.js';

const NotificationResponseSchema = z.object({
  id: z.string().openapi({
    example: 'noti-uuid-001',
  }),
  type: z.string().openapi({
    example: 'COMMENT',
  }),
  content: z.string().openapi({
    example: '김철수님이 회원님의 이슈에 댓글을 달았습니다.',
  }),
  isRead: z.boolean().openapi({
    example: false,
  }),
  link: z.string().openapi({
    example: '/teams/team-uuid-010/issues/issue-uuid-010',
  }),
  createdAt: z.string().openapi({
    example: '2025-04-22T10:30:00.000Z',
  }),
});

export const GetNotificationsResponseSchema = z.object({
  data: z.array(NotificationResponseSchema),
});

export const ReadNotificationParamsSchema = z.object({
  id: z.uuid().openapi({
    example: '00000000-0000-0000-0000-000000000001',
  }),
});

export const ReadNotificationResponseSchema = z.object({
  id: z.string().openapi({
    example: 'noti-uuid-001',
  }),
  isRead: z.boolean().openapi({
    example: true,
  }),
});

export const NotificationErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().openapi({
      example: 'UNAUTHORIZED',
    }),
    message: z.string().openapi({
      example: '인증이 필요합니다.',
    }),
  }),
});

export type GetNotificationsResponseDto = z.infer<
  typeof GetNotificationsResponseSchema
>;
export type ReadNotificationParamsDto = z.infer<
  typeof ReadNotificationParamsSchema
>;
export type ReadNotificationResponseDto = z.infer<
  typeof ReadNotificationResponseSchema
>;
