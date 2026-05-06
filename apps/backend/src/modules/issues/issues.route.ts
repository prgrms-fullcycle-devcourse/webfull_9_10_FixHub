import { Router } from 'express';

import {
  getIssues,
  getPublicIssues,
  getIssueDetail,
  postIssue,
  patchIssue,
  removeIssue,
} from './issues.controller.js';
import { authenticate } from '../../common/middlewares/authenticate.js';

const router = Router();

router.get('/search', getIssues);
router.get('/public', getPublicIssues);

/* 이슈 상세 조회 */
router.get('/teams/:teamId/issues/:issueId', getIssueDetail);

/* 이슈 등록 */
router.post('/teams/:teamId/issues', authenticate, postIssue);

/* 이슈 수정 */
router.patch('/teams/:teamId/issues/:issueId', authenticate, patchIssue);

/* 이슈 삭제 */
router.delete('/teams/:teamId/issues/:issueId', authenticate, removeIssue);

export default router;
