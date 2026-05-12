import { NextFunction, Request, Response } from 'express';

import {
  SearchIssuesQuerySchema,
  getPublicIssuesQuerySchema,
  GetIssueFeedsParamsSchema,
  GetIssueDetailParamsSchema,
  CreateIssueParamsSchema,
  CreateIssueBodySchema,
  UpdateIssueParamsSchema,
  UpdateIssueBodySchema,
  DeleteIssueParamsSchema,
  SuggestIssueBodySchema,
} from './issues.dto.js';
import { Errors } from '../../common/errors/AppError.js';
import { AuthRequest } from '../../common/middlewares/authenticate.js';
import {
  searchIssues,
  getPublicIssues as getPublicIssuesService,
  getIssueFeeds as getIssueFeedsService,
  getTeamIssueFeeds as getTeamIssueFeedsService,
  getIssueDetail as getIssueDetailService,
  createIssue as createIssueService,
  updateIssue as updateIssueService,
  deleteIssue as deleteIssueService,
  generateIssue,
  uploadIssueImage as uploadIssueImageService,
} from './issues.service.js';

export async function getIssues(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsedQuery = SearchIssuesQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    console.error(parsedQuery.error);
    return next(Errors.VALIDATION_ERROR);
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

export async function getIssueFeeds(req: Request, res: Response) {
  const queryResult = getPublicIssuesQuerySchema.safeParse(req.query);

  if (!queryResult.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: '요청 값이 올바르지 않습니다.',
      },
    });
  }

  const result = await getIssueFeedsService(queryResult.data);

  return res.status(200).json(result);
}

export async function getTeamIssueFeeds(req: Request, res: Response) {
  const parsedParams = GetIssueFeedsParamsSchema.safeParse(req.params);
  const parsedQuery = getPublicIssuesQuerySchema.safeParse(req.query);

  if (!parsedParams.success || !parsedQuery.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: '요청 값이 올바르지 않습니다.',
      },
    });
  }

  const result = await getTeamIssueFeedsService(
    parsedParams.data,
    parsedQuery.data,
  );

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
    const userId = (req as AuthRequest).userId;
    const response = await getIssueDetailService(userId, parsedParams.data);

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

/* 이슈 수정 */
export async function patchIssue(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsedParams = UpdateIssueParamsSchema.safeParse(req.params);
  const parsedBody = UpdateIssueBodySchema.safeParse(req.body);

  if (!parsedParams.success || !parsedBody.success) {
    return next(Errors.VALIDATION_ERROR);
  }

  try {
    const userId = (req as AuthRequest).userId;
    const response = await updateIssueService(
      userId,
      parsedParams.data,
      parsedBody.data,
    );

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
}

/* 이슈 삭제 */
export async function removeIssue(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsedParams = DeleteIssueParamsSchema.safeParse(req.params);

  if (!parsedParams.success) {
    return next(Errors.VALIDATION_ERROR);
  }

  try {
    const userId = (req as AuthRequest).userId;
    const response = await deleteIssueService(userId, parsedParams.data);

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
}

export async function suggestIssue(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsed = SuggestIssueBodySchema.safeParse(req.body);

  if (!parsed.success) {
    console.error(parsed.error);
    return next(Errors.VALIDATION_ERROR);
  }

  try {
    const response = await generateIssue(parsed.data.errorLog);

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
}

export async function uploadIssueImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const response = await uploadIssueImageService(req.file);

    return res.status(201).json(response);
  } catch (error) {
    return next(error);
  }
}
