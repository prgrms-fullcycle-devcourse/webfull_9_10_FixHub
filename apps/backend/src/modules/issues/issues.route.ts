import { Router } from 'express';

import issuesController from './issues.controller.js';

const issuesRouter = Router();

issuesRouter.get('/issues/public', issuesController.getPublicIssues);

export default issuesRouter;
