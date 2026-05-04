import { Router } from 'express';

import { getTeamsComments } from './teams.controller.js';

const router = Router();

router.get('/:id/comments', getTeamsComments);

export default router;
