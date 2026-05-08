import type { NextFunction, Request, Response } from 'express';

import type { AuthRequest } from '../../common/middlewares/authenticate.js';
import { getNotifications as getNotificationsService } from './notifications.service.js';

export async function getNotifications(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const notifications = await getNotificationsService(
      (req as AuthRequest).userId,
    );

    return res.status(200).json(notifications);
  } catch (error) {
    return next(error);
  }
}
