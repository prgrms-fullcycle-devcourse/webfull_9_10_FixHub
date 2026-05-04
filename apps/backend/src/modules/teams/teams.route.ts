import { Router } from 'express';

import { postTeam, getMyTeams } from './teams.controller.js';
import { authenticate } from '../../common/middlewares/authenticate.js';

const router = Router();

router.post('/', authenticate, postTeam); // 팀 생성
router.get('/', authenticate, getMyTeams); // 내가 속한 팀 조회

export default router;
