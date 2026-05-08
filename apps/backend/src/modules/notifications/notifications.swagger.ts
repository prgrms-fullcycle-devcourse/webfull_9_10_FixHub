import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import {
  GetNotificationsResponseSchema,
  NotificationErrorResponseSchema,
  ReadNotificationParamsSchema,
  ReadNotificationResponseSchema,
} from './notifications.dto.js';

export function registerNotificationsSwagger(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'get',
    path: '/notifications',
    operationId: 'getNotifications',
    tags: ['Notifications'],
    summary: '알림 목록 조회',
    description: '로그인한 사용자의 알림 목록을 조회합니다.',
    responses: {
      200: {
        description: '알림 목록 조회 성공',
        content: {
          'application/json': {
            schema: GetNotificationsResponseSchema,
          },
        },
      },
      401: {
        description: '인증 실패',
        content: {
          'application/json': {
            schema: NotificationErrorResponseSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/notifications/{id}/read',
    operationId: 'readNotification',
    tags: ['Notifications'],
    summary: '알림 읽음 처리',
    description: '로그인한 사용자의 특정 알림을 읽음 상태로 변경합니다.',
    request: {
      params: ReadNotificationParamsSchema,
    },
    responses: {
      200: {
        description: '알림 읽음 처리 성공',
        content: {
          'application/json': {
            schema: ReadNotificationResponseSchema,
          },
        },
      },
      400: {
        description: '요청 값 검증 실패',
        content: {
          'application/json': {
            schema: NotificationErrorResponseSchema,
          },
        },
      },
      401: {
        description: '인증 실패',
        content: {
          'application/json': {
            schema: NotificationErrorResponseSchema,
          },
        },
      },
      403: {
        description: '알림 접근 권한 없음',
        content: {
          'application/json': {
            schema: NotificationErrorResponseSchema,
          },
        },
      },
      404: {
        description: '알림을 찾을 수 없음',
        content: {
          'application/json': {
            schema: NotificationErrorResponseSchema,
          },
        },
      },
    },
  });
}
