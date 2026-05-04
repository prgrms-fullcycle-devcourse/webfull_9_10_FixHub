import { NextFunction, Request, Response } from 'express';

import {
  SearchIssuesQuerySchema,
  getPublicIssuesQuerySchema,
  GetIssueDetailParamsSchema,
  CreateIssueParamsSchema,
  CreateIssueBodySchema,
} from './issues.dto.js';
import { AppError, Errors } from '../../common/errors/AppError.js';
import { AuthRequest } from '../../common/middlewares/authenticate.js';
import {
  searchIssues,
  getPublicIssues as getPublicIssuesService,
  getIssueDetail as getIssueDetailService,
  createIssue as createIssueService,
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
        message: '요청 값이 올바르지 않습니다.',
      },
    });
  }

  const result = await getPublicIssuesService(queryResult.data);

  return res.status(200).json(result);
}

/* 이슈 상세 조회 */
export async function getIssueDetail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsedParams = GetIssueDetailParamsSchema.safeParse(req.params);

  if (!parsedParams.success) {
    return next(Errors.VALIDATION_ERROR);
  }

  try {
    const response = await getIssueDetailService(parsedParams.data);

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
}

/* 이슈 등록 */
export async function postIssue(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsedParams = CreateIssueParamsSchema.safeParse(req.params);
  const parsedBody = CreateIssueBodySchema.safeParse(req.body);

  if (!parsedParams.success || !parsedBody.success) {
    return next(Errors.VALIDATION_ERROR);
  }

  try {
    const userId = (req as AuthRequest).userId;
    const response = await createIssueService(
      userId,
      parsedParams.data,
      parsedBody.data,
    );

    return res.status(201).json(response);
  } catch (error) {
    return next(error);
  }
}
