import type { NextFunction, Request, Response } from 'express';

import type { AuthRequest } from '../../common/middlewares/authenticate.js';

import type { CreateCommentBodyDto } from './comments.dto.js';
import {
  adoptComment,
  createComment,
  getComments as getCommentsService,
} from './comments.service.js';

export async function getComments(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const comments = await getCommentsService({
      id: req.params.id as string,
    });

    return res.status(200).json(comments);
  } catch (error) {
    return next(error);
  }
}

export async function postAdoptComment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const adoptedComment = await adoptComment(
      {
        id: req.params.id as string,
        commentId: req.params.commentId as string,
      },
      (req as AuthRequest).userId,
    );

    return res.status(200).json(adoptedComment);
  } catch (error) {
    return next(error);
  }
}

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
