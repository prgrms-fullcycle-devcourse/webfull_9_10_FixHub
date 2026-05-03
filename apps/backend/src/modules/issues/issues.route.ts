import { Router } from 'express';

import { getIssues } from './issues.controller.js';

const router = Router();

router.get('/search', getIssues);

export default router;
