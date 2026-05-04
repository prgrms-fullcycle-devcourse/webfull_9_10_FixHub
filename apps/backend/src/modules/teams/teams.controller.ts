import { NextFunction, Request, Response } from 'express';

import {
  CreateTeamBodySchema,
  SearchTeamsCommentsParamsSchema,
  SearchTeamsCommentsQuerySchema,
} from './teams.dto.js';
import { AppError, Errors } from '../../common/errors/AppError.js';
import { createTeam, searchTeamsComments } from './teams.service.js';
import { AuthRequest } from '../../common/middlewares/authenticate.js';

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

export async function postTeam(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsedBody = CreateTeamBodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    return next(Errors.VALIDATION_ERROR);
  }

  try {
    const userId = (req as AuthRequest).userId;
    const response = await createTeam(userId, parsedBody.data);

    return res.status(201).json(response);
  } catch (error) {
    return next(error);
  }
}
