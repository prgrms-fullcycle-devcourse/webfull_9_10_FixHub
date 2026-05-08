import type { Request, Response, NextFunction } from 'express';

import type { AuthRequest } from '../../common/middlewares/authenticate.js';
import type {
  UpdateMyProfileBodyDto,
  GetMyIssuesQueryDto,
  GetMySolvedQueryDto,
  GetMyScoreQueryDto,
  GetMyScoreLogsQueryDto,
} from './users.dto.js';
import {
  getMyProfile,
  updateMyProfile,
  getUserProfile,
  getMyIssues,
  getMySolved,
  getMyScore,
  getMyScoreLogs,
} from './users.service.js';

// GET /users/me
export async function getMyProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as AuthRequest).userId;
    const result = await getMyProfile(userId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

// PATCH /users/me
export async function updateMyProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as AuthRequest).userId;
    const result = await updateMyProfile(
      userId,
      req.body as UpdateMyProfileBodyDto,
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

// GET /users/:userId
export async function getUserProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getUserProfile(req.params.userId as string);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

// GET /users/me/issues
export async function getMyIssuesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as AuthRequest).userId;
    const result = await getMyIssues(
      userId,
      req.query as unknown as GetMyIssuesQueryDto,
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

// GET /users/me/solved
export async function getMySolvedHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as AuthRequest).userId;
    const result = await getMySolved(
      userId,
      req.query as unknown as GetMySolvedQueryDto,
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

// GET /users/me/score
export async function getMyScoreHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as AuthRequest).userId;
    const result = await getMyScore(
      userId,
      req.query as unknown as GetMyScoreQueryDto,
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

// GET /users/me/score/logs
export async function getMyScoreLogsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as AuthRequest).userId;
    const result = await getMyScoreLogs(
      userId,
      req.query as unknown as GetMyScoreLogsQueryDto,
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}
