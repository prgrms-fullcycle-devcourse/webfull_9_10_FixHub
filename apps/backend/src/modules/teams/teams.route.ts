import { Router } from 'express';

import {
  postTeam,
  getMyTeams,
  getSlackConnect,
  getSlackOAuthCallback,
  getTeamDetail,
  getTeamMembers,
  getTeamSettings,
  patchTeam,
  postSlackTestMessage,
} from './teams.controller.js';
import { SlackTestMessageParamsSchema } from './teams.dto.js';
import { authenticate } from '../../common/middlewares/authenticate.js';
import { validateParams } from '../../common/middlewares/validator.js';

const router = Router();

router.post('/', authenticate, postTeam); // 팀 생성
router.get('/', authenticate, getMyTeams); // 내가 속한 팀 조회
router.get('/slack/oauth/callback', authenticate, getSlackOAuthCallback); // 슬랙 OAuth 콜백
router.get('/:teamId/slack/connect', authenticate, getSlackConnect); // 슬랙 연동 시작
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

export default router;
