import { Router } from 'express';

import { authenticate } from '../../common/middlewares/authenticate.js';
import {
  validate,
  validateParams,
  validateQuery,
} from '../../common/middlewares/validator.js';
import {
  GetUserProfileParamsSchema,
  UpdateMyProfileBodySchema,
  GetMyIssuesQuerySchema,
  GetMySolvedQuerySchema,
  GetMyScoreQuerySchema,
  GetMyScoreLogsQuerySchema,
} from './users.dto.js';
import {
  getMyProfileHandler,
  updateMyProfileHandler,
  getUserProfileHandler,
  getMyIssuesHandler,
  getMySolvedHandler,
  getMyScoreHandler,
  getMyScoreLogsHandler,
} from './users.controller.js';

const router = Router();

// 내 프로필 조회
router.get('/users/me', authenticate, getMyProfileHandler);

// 내 프로필 수정
router.patch(
  '/users/me',
  authenticate,
  validate(UpdateMyProfileBodySchema),
  updateMyProfileHandler,
);

// 내가 작성한 이슈 목록
router.get(
  '/users/me/issues',
  authenticate,
  validateQuery(GetMyIssuesQuerySchema),
  getMyIssuesHandler,
);

// 내가 해결한(댓글 채택당한) 이슈 목록
router.get(
  '/users/me/solved',
  authenticate,
  validateQuery(GetMySolvedQuerySchema),
  getMySolvedHandler,
);

// 점수 히스토리 (잔디 그래프용)
router.get(
  '/users/me/score',
  authenticate,
  validateQuery(GetMyScoreQuerySchema),
  getMyScoreHandler,
);

// 점수 획득 목록 (페이지네이션)
router.get(
  '/users/me/score/logs',
  authenticate,
  validateQuery(GetMyScoreLogsQuerySchema),
  getMyScoreLogsHandler,
);

// 다른 유저 프로필 조회
router.get(
  '/users/:userId',
  validateParams(GetUserProfileParamsSchema),
  getUserProfileHandler,
);

export default router;
