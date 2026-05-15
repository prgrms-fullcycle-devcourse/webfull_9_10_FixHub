import { Router } from 'express';

import {
  postTeam,
  getMyTeams,
  getSlackConnect,
  getSlackNotificationSettings,
  getSlackOAuthCallback,
  getTeamDetail,
  getTeamMembers,
  getTeamSettings,
  patchSlackNotificationSettings,
  patchTeam,
  postSlackTestMessage,
  inviteTeamMembers,
  deleteTeamMember,
  leaveTeam,
  deleteTeam,
} from './teams.controller.js';
import {
  SlackNotificationSettingsParamsSchema,
  SlackTestMessageParamsSchema,
} from './teams.dto.js';
import { authenticate } from '../../common/middlewares/authenticate.js';
import { validateParams } from '../../common/middlewares/validator.js';

const router = Router();

router.post('/', authenticate, postTeam); // 팀 생성
router.get('/', authenticate, getMyTeams); // 내가 속한 팀 조회
router.get('/slack/oauth/callback', authenticate, getSlackOAuthCallback); // 슬랙 OAuth 콜백
router.get('/:teamId/slack/connect', authenticate, getSlackConnect); // 슬랙 연동 시작
router.get(
  '/:teamId/slack/notification-settings',
  authenticate,
  validateParams(SlackNotificationSettingsParamsSchema),
  getSlackNotificationSettings,
); // 슬랙 알림 설정 조회
router.patch(
  '/:teamId/slack/notification-settings',
  authenticate,
  validateParams(SlackNotificationSettingsParamsSchema),
  patchSlackNotificationSettings,
); // 슬랙 알림 설정 저장
router.post(
  '/:teamId/slack/test-message',
  authenticate,
  validateParams(SlackTestMessageParamsSchema),
  postSlackTestMessage,
); // 슬랙 테스트 메시지 전송
router.get('/:teamId', authenticate, getTeamDetail); // 팀 상세 조회
router.patch('/:teamId', authenticate, patchTeam); // 팀 수정
router.get('/:teamId/settings', authenticate, getTeamSettings); // 팀 설정 조회
router.get('/:teamId/members', authenticate, getTeamMembers); // 팀원 목록 조회
router.post('/:teamId/members', authenticate, inviteTeamMembers); // 팀원 초대
router.delete('/:teamId/members/:userId', authenticate, deleteTeamMember); // 팀원 내보내기
router.delete('/:teamId/leave', authenticate, leaveTeam); // 팀 탈퇴
router.delete('/:teamId', authenticate, deleteTeam); // 팀 삭제
export default router;
