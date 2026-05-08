import { Router } from 'express';

import { postTeam, getMyTeams, getTeamDetail } from './teams.controller.js';
import { authenticate } from '../../common/middlewares/authenticate.js';
import { getTeamMembers } from './teams.controller.js';

const router = Router();

router.post('/', authenticate, postTeam); // 팀 생성
router.get('/', authenticate, getMyTeams); // 내가 속한 팀 조회
router.get('/:teamId', authenticate, getTeamDetail); // 팀 상세 조회
router.get('/:teamId/members', authenticate, getTeamMembers); // 팀원 목록 조회

export default router;
