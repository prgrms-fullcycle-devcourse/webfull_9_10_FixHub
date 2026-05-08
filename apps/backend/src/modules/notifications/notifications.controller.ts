import type { NextFunction, Request, Response } from 'express';

import type { AuthRequest } from '../../common/middlewares/authenticate.js';
import type { ReadNotificationParamsDto } from './notifications.dto.js';
import {
  getNotifications as getNotificationsService,
  readNotification as readNotificationService,
} from './notifications.service.js';

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

export async function patchReadNotification(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const notification = await readNotificationService(
      req.params as ReadNotificationParamsDto,
      (req as AuthRequest).userId,
    );

    return res.status(200).json(notification);
  } catch (error) {
    return next(error);
  }
}
