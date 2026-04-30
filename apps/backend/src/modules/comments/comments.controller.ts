import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../../common/errors/AppError.js';
import type { AuthRequest } from '../../common/middlewares/authenticate.js';

import {
  CreateCommentBodySchema,
  CreateCommentParamsSchema,
} from './comments.dto.js';
import { createComment } from './comments.service.js';

export async function postComment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsedParams = CreateCommentParamsSchema.safeParse(req.params);

  if (!parsedParams.success) {
    return next(
      new AppError('VALIDATION_ERROR', '유효한 issue id가 필요합니다.', 400),
    );
  }

  const parsedBody = CreateCommentBodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    return next(
      new AppError('VALIDATION_ERROR', '요청 본문이 올바르지 않습니다.', 400),
    );
  }

  try {
    const comment = await createComment(
      parsedParams.data,
      parsedBody.data,
      (req as AuthRequest).userId,
    );

    return res.status(201).json(comment);
  } catch (error) {
    return next(error);
  }
}
