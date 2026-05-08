import { Router } from 'express';

import { authenticate } from '../../common/middlewares/authenticate.js';
import { getNotifications } from './notifications.controller.js';

const router = Router();

router.get('/', authenticate, getNotifications);

export default router;
