import type { NextFunction, Request, Response } from 'express';

import { authService } from './auth.service.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
};

export const authController = {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken } = await authService.signup(req.body);

      res.cookie('token', accessToken, COOKIE_OPTIONS);
      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken } = await authService.login(req.body);

      res.cookie('token', accessToken, COOKIE_OPTIONS);
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('token');
      res.status(200).json({ message: '로그아웃 성공' });
    } catch (err) {
      next(err);
    }
  },
};
