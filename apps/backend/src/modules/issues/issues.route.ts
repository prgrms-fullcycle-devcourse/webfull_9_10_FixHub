import { Router } from 'express';

import { getIssues, getPublicIssues } from './issues.controller.js';

const router = Router();

router.get('/search', getIssues);
router.get('/public', getPublicIssues);

export default router;
