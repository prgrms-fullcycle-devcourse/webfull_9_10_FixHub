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

/** 로그인 여부와 무관하게 통과시키되, 토큰이 있으면 userId를 세팅한다. */
export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const token = req.cookies.token;

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    (req as AuthRequest).userId = payload.userId;
  } catch {
    // 유효하지 않은 토큰은 무시하고 비로그인으로 처리
  }

  next();
}
