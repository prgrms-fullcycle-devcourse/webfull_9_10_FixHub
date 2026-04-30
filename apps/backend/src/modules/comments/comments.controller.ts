import type { NextFunction, Request, Response } from 'express';

import type { AuthRequest } from '../../common/middlewares/authenticate.js';

import type { CreateCommentBodyDto } from './comments.dto.js';
import { createComment } from './comments.service.js';

export async function postComment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const comment = await createComment(
      { id: req.params.id as string },
      req.body as CreateCommentBodyDto,
      (req as AuthRequest).userId,
    );

    return res.status(201).json(comment);
  } catch (error) {
    return next(error);
  }
}
