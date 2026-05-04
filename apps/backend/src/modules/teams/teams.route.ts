import { Router } from 'express';

import { postTeam } from './teams.controller.js';
import { authenticate } from '../../common/middlewares/authenticate.js';

const router = Router();

router.post('/', authenticate, postTeam);

export default router;
