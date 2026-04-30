import { NextFunction, Request, Response } from 'express';

import {
  SearchTeamsCommentsParamsSchema,
  SearchTeamsCommentsQuerySchema,
} from './teams.dto.js';
import { AppError } from '../../common/errors/AppError.js';
import { searchTeamsComments } from './teams.service.js';

export async function getTeamsComments(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsedParams = SearchTeamsCommentsParamsSchema.safeParse(req.params);

  if (!parsedParams.success) {
    return next(
      new AppError('VALIDATION_ERROR', JSON.stringify(parsedParams.error), 400),
    );
  }

  const parsedQuery = SearchTeamsCommentsQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    return next(
      new AppError('VALIDATION_ERROR', JSON.stringify(parsedQuery.error), 400),
    );
  }

  try {
    const response = await searchTeamsComments(
      parsedParams.data.id,
      parsedQuery.data.search ?? '',
    );

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
}
