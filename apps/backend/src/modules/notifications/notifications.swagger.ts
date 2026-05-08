import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import {
  GetNotificationsResponseSchema,
  NotificationErrorResponseSchema,
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
}
