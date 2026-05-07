import { NextFunction, Request, Response } from 'express';

import { CreateTeamBodySchema } from './teams.dto.js';
import { Errors } from '../../common/errors/AppError.js';
import {
  createTeam,
  getMyTeams as getMyTeamsService,
  getTeamMembers as getTeamMembersService,
  getTeamDetail as getTeamDetailService,
} from './teams.service.js';
import { AuthRequest } from '../../common/middlewares/authenticate.js';

// 팀 생성
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

// 내가 속한 팀 조회
export async function getMyTeams(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as AuthRequest).userId;
    const response = await getMyTeamsService(userId);

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
}

// 팀 상세 조회
export async function getTeamDetail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as AuthRequest).userId;
    const teamId = String(req.params.teamId);

    const response = await getTeamDetailService(userId, teamId);

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
}

// 팀원 목록 조회
export async function getTeamMembers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as AuthRequest).userId;
    const teamId = String(req.params.teamId);

    const response = await getTeamMembersService(userId, teamId);

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
}
