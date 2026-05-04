import { NextFunction, Request, Response } from 'express';

import { CreateTeamBodySchema } from './teams.dto.js';
import { Errors } from '../../common/errors/AppError.js';
import { createTeam } from './teams.service.js';
import { AuthRequest } from '../../common/middlewares/authenticate.js';

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
