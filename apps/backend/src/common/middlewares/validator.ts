import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

import { AppError } from '../errors/AppError.js';

const getZodErrorMessage = (error: ZodError) => {
  return error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join(', ');
};

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 런타임 검증 실행
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // 상세 에러 메시지 생성
        const errorMessage = getZodErrorMessage(error);

        return next(new AppError('BAD_REQUEST', errorMessage, 400));
      }
      next(error);
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = (await schema.parseAsync(req.params)) as typeof req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = getZodErrorMessage(error);

        return next(new AppError('BAD_REQUEST', errorMessage, 400));
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req.query);
      Object.assign(req.query, parsed);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = getZodErrorMessage(error);
        return next(new AppError('BAD_REQUEST', errorMessage, 400));
      }
      next(error);
    }
  };
};
