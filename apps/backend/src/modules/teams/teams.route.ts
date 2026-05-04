import { Router } from 'express';

import { getTeamsComments, postTeam } from './teams.controller.js';
import { authenticate } from '../../common/middlewares/authenticate.js';

const router = Router();

router.post('/', authenticate, postTeam);
router.get('/:id/comments', getTeamsComments);

export default router;
