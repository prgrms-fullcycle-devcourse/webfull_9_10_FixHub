import type { Request, Response } from 'express';

import {
  CreateCommentBodySchema,
  CreateCommentParamsSchema,
} from './comments.dto.js';
import { CommentServiceError, createComment } from './comments.service.js';

function postComment(req: Request, res: Response) {
  const parsedParams = CreateCommentParamsSchema.safeParse(req.params);

  if (!parsedParams.success) {
    return res.status(400).json({
      message: '유효한 issue id가 필요합니다.',
    });
  }

  const parsedBody = CreateCommentBodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      message: '요청 본문이 올바르지 않습니다.',
    });
  }

  try {
    const comment = createComment(parsedParams.data, parsedBody.data);

    return res.status(201).json(comment);
  } catch (error) {
    if (error instanceof CommentServiceError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: '댓글 생성 중 오류가 발생했습니다.',
    });
  }
}

export { postComment };
