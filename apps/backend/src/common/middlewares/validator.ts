import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

import { AppError } from '../errors/AppError.js';

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 런타임 검증 실행
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // 상세 에러 메시지 생성
        const errorMessage = error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ');

        return next(new AppError('BAD_REQUEST', errorMessage, 400));
      }
      next(error);
    }
  };
};
