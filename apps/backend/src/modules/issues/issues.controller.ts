import { NextFunction, Request, Response } from 'express';

import {
  SearchIssuesQuerySchema,
  getPublicIssuesQuerySchema,
} from './issues.dto.js';
import { AppError } from '../../common/errors/AppError.js';
import {
  searchIssues,
  getPublicIssues as getPublicIssuesService,
} from './issues.service.js';

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

export async function getPublicIssues(req: Request, res: Response) {
  const queryResult = getPublicIssuesQuerySchema.safeParse(req.query);

  if (!queryResult.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: '잘못된 쿼리 파라미터입니다.',
      },
    });
  }

  const result = await getPublicIssuesService(queryResult.data);

  return res.status(200).json(result);
}
