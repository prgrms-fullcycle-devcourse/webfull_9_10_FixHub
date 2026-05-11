import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import {
  CreateTeamBodySchema,
  CreateTeamResponseSchema,
  GetMyTeamsResponseSchema,
  GetTeamDetailResponseSchema,
  GetTeamMembersResponseSchema,
  GetTeamSettingsResponseSchema,
  SlackConnectParamsSchema,
  SlackNotificationSettingsParamsSchema,
  SlackNotificationSettingsResponseSchema,
  SlackOAuthCallbackQuerySchema,
  SlackTestMessageBodySchema,
  SlackTestMessageParamsSchema,
  SlackTestMessageResponseSchema,
  UpdateSlackNotificationSettingsBodySchema,
  UpdateTeamBodySchema,
  UpdateTeamResponseSchema,
} from './teams.dto.js';

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export function registerTeamsSwagger(registry: OpenAPIRegistry) {
  // 팀 생성
  registry.registerPath({
    method: 'post',
    path: '/teams',
    tags: ['Teams'],

    summary: '팀 생성',
    description: '새로운 팀을 생성합니다.',

    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateTeamBodySchema,
          },
        },
      },
    },

    responses: {
      201: {
        description: '팀 생성 성공',
        content: {
          'application/json': {
            schema: CreateTeamResponseSchema,
          },
        },
      },

      400: {
        description: '입력 값 오류',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },

      401: {
        description: '인증 필요',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  // 내가 속한 팀 조회
  registry.registerPath({
    method: 'get',
    path: '/teams',
    tags: ['Teams'],
    summary: '내가 속한 팀 조회',
    description: '현재 로그인한 사용자가 속한 팀 목록을 조회합니다.',
    responses: {
      200: {
        description: '내가 속한 팀 목록 조회 성공',
        content: {
          'application/json': {
            schema: GetMyTeamsResponseSchema,
          },
        },
      },
      401: {
        description: '인증 필요',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  // 팀 상세 조회
  registry.registerPath({
    method: 'get',
    path: '/teams/{teamId}',
    tags: ['Teams'],
    summary: '팀 상세 조회',
    description: '특정 팀의 상세 정보와 점수 상위 3명의 팀원을 조회합니다.',
    request: {
      params: z.object({
        teamId: z.uuidv7(),
      }),
    },
    responses: {
      200: {
        description: '팀 상세 조회 성공',
        content: {
          'application/json': {
            schema: GetTeamDetailResponseSchema,
          },
        },
      },
      401: {
        description: '인증 필요',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      403: {
        description: '권한 없음',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      404: {
        description: '리소스 없음',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  // 슬랙 연동 시작
  registry.registerPath({
    method: 'get',
    path: '/teams/{teamId}/slack/connect',
    tags: ['Teams'],
    summary: 'Slack 연동 시작',
    description:
      '로그인한 사용자를 Slack OAuth 승인 화면으로 이동시켜 Incoming Webhook 연동을 시작합니다.',
    request: {
      params: SlackConnectParamsSchema,
    },
    responses: {
      302: {
        description: 'Slack OAuth 승인 화면으로 리다이렉트',
      },
      401: {
        description: '인증 필요',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      403: {
        description: '권한 없음',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      404: {
        description: '팀을 찾을 수 없음',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  // 슬랙 OAuth 콜백
  registry.registerPath({
    method: 'get',
    path: '/teams/slack/oauth/callback',
    tags: ['Teams'],
    summary: 'Slack OAuth callback',
    description:
      'Slack OAuth code를 Incoming Webhook URL로 교환하고 현재 사용자의 팀 멤버 설정에 저장합니다.',
    request: {
      query: SlackOAuthCallbackQuerySchema,
    },
    responses: {
      302: {
        description: '팀 설정 페이지로 리다이렉트',
      },
      401: {
        description: '인증 필요',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      403: {
        description: '권한 없음',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      502: {
        description: 'Slack OAuth 연동 실패',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  // 슬랙 알림 설정 조회
  registry.registerPath({
    method: 'get',
    path: '/teams/{teamId}/slack/notification-settings',
    operationId: 'getSlackNotificationSettings',
    tags: ['Teams'],
    summary: 'Slack 알림 설정 조회',
    description:
      '현재 로그인한 사용자의 특정 팀 Slack 알림 이벤트 수신 설정을 조회합니다.',
    request: {
      params: SlackNotificationSettingsParamsSchema,
    },
    responses: {
      200: {
        description: 'Slack 알림 설정 조회 성공',
        content: {
          'application/json': {
            schema: SlackNotificationSettingsResponseSchema,
          },
        },
      },
      401: {
        description: '인증 필요',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      403: {
        description: '권한 없음',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      404: {
        description: '팀을 찾을 수 없음',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  // 슬랙 알림 설정 저장
  registry.registerPath({
    method: 'patch',
    path: '/teams/{teamId}/slack/notification-settings',
    operationId: 'updateSlackNotificationSettings',
    tags: ['Teams'],
    summary: 'Slack 알림 설정 저장',
    description:
      '현재 로그인한 사용자의 특정 팀 Slack 알림 이벤트 수신 설정을 저장합니다.',
    request: {
      params: SlackNotificationSettingsParamsSchema,
      body: {
        content: {
          'application/json': {
            schema: UpdateSlackNotificationSettingsBodySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Slack 알림 설정 저장 성공',
        content: {
          'application/json': {
            schema: SlackNotificationSettingsResponseSchema,
          },
        },
      },
      400: {
        description: '입력 값 오류',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      401: {
        description: '인증 필요',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      403: {
        description: '권한 없음',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      404: {
        description: '팀을 찾을 수 없음',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  // 슬랙 테스트 메시지 전송
  registry.registerPath({
    method: 'post',
    path: '/teams/{teamId}/slack/test-message',
    operationId: 'sendSlackTestMessage',
    tags: ['Teams'],
    summary: 'Slack 테스트 메시지 전송',
    description:
      '현재 로그인한 사용자의 팀 멤버 설정에 저장된 Slack Incoming Webhook으로 테스트 메시지를 전송합니다.',
    request: {
      params: SlackTestMessageParamsSchema,
      body: {
        content: {
          'application/json': {
            schema: SlackTestMessageBodySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Slack 테스트 메시지 전송 성공',
        content: {
          'application/json': {
            schema: SlackTestMessageResponseSchema,
          },
        },
      },
      400: {
        description: '입력 값 오류 또는 Slack 미연동',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      401: {
        description: '인증 필요',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      403: {
        description: '권한 없음',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      404: {
        description: '팀을 찾을 수 없음',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      502: {
        description: 'Slack 메시지 전송 실패',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  // 팀 수정
  registry.registerPath({
    method: 'patch',
    path: '/teams/{teamId}',
    tags: ['Teams'],
    summary: '팀 수정',
    description:
      '팀 이름, 설명, 팀장을 수정합니다. 팀장 권한을 가진 사용자만 수정할 수 있습니다.',
    request: {
      params: z.object({
        teamId: z.uuidv7(),
      }),
      body: {
        content: {
          'application/json': {
            schema: UpdateTeamBodySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: '팀 수정 성공',
        content: {
          'application/json': {
            schema: UpdateTeamResponseSchema,
          },
        },
      },
      400: {
        description: '입력 값 오류',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      401: {
        description: '인증 필요',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      403: {
        description: '권한 없음',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      404: {
        description: '리소스 없음',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  // 팀 설정 조회
  registry.registerPath({
    method: 'get',
    path: '/teams/{teamId}/settings',
    tags: ['Teams'],
    summary: '팀 설정 조회',
    description:
      '팀 설정 페이지에서 사용하는 팀 정보와 팀원 목록을 조회합니다. 팀원 목록은 이름순, 가입일순으로 정렬되며 리더가 항상 맨 위에 표시됩니다.',
    request: {
      params: z.object({
        teamId: z.uuidv7(),
      }),
    },
    responses: {
      200: {
        description: '팀 설정 조회 성공',
        content: {
          'application/json': {
            schema: GetTeamSettingsResponseSchema,
          },
        },
      },
      401: {
        description: '인증 필요',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      403: {
        description: '권한 없음',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      404: {
        description: '리소스 없음',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  // 팀원 목록 조회
  registry.registerPath({
    method: 'get',
    path: '/teams/{teamId}/members',
    tags: ['Teams'],
    summary: '팀원 목록 조회',
    description: '특정 팀에 속한 팀원 목록을 조회합니다.',
    request: {
      params: z.object({
        teamId: z.uuidv7(),
      }),
    },
    responses: {
      200: {
        description: '팀원 목록 조회 성공',
        content: {
          'application/json': {
            schema: GetTeamMembersResponseSchema,
          },
        },
      },
      401: {
        description: '인증 필요',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      403: {
        description: '권한 없음',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
      404: {
        description: '리소스 없음',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });
}
