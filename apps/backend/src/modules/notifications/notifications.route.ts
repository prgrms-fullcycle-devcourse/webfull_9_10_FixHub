import { Router } from 'express';

import { authenticate } from '../../common/middlewares/authenticate.js';
import { validateParams } from '../../common/middlewares/validator.js';
import {
  getNotifications,
  patchReadNotification,
} from './notifications.controller.js';
import { ReadNotificationParamsSchema } from './notifications.dto.js';

const router = Router();

router.get('/', authenticate, getNotifications);

router.patch(
  '/:id/read',
  authenticate,
  validateParams(ReadNotificationParamsSchema),
  patchReadNotification,
);

export default router;
