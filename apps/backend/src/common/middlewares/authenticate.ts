import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { Errors } from '../errors/AppError.js';

export interface AuthRequest extends Request {
  userId: string;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;

  if (!token) {
    return next(Errors.UNAUTHORIZED);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    (req as AuthRequest).userId = payload.userId;
    next();
  } catch {
    return next(Errors.UNAUTHORIZED);
  }
}
