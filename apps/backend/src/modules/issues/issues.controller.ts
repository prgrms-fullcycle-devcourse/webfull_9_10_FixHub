import { NextFunction, Request, Response } from 'express';

import { SearchIssuesQuerySchema } from './issues.dto.js';
import { AppError } from '../../common/errors/AppError.js';
import { searchIssues } from './issues.service.js';

export async function getIssues(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsedQuery = SearchIssuesQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    return next(
      new AppError('VALIDATION_ERROR', JSON.stringify(parsedQuery.error), 400),
    );
  }

  try {
    const response = await searchIssues(parsedQuery.data.search ?? '');

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
}
