import { NextFunction, Request, Response } from 'express';

import {
  CreateTeamBodySchema,
  SlackTestMessageBodySchema,
  UpdateSlackNotificationSettingsBodySchema,
  UpdateTeamBodySchema,
  InviteTeamMembersBodySchema,
} from './teams.dto.js';
import { Errors } from '../../common/errors/AppError.js';
import {
  createSlackConnectUrl,
  completeSlackOAuthConnection,
  getSlackClientRedirectUrl,
  createTeam,
  getSlackNotificationSettings as getSlackNotificationSettingsService,
  getMyTeams as getMyTeamsService,
  getTeamMembers as getTeamMembersService,
  getTeamDetail as getTeamDetailService,
  getTeamSettings as getTeamSettingsService,
  sendSlackTestMessage as sendSlackTestMessageService,
  updateSlackNotificationSettings as updateSlackNotificationSettingsService,
  updateTeam as updateTeamService,
  inviteTeamMembers as inviteTeamMembersService,
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

// 팀 설정 조회
export async function getTeamSettings(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as AuthRequest).userId;
    const teamId = String(req.params.teamId);

    const response = await getTeamSettingsService(userId, teamId);

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

// 팀 수정
export async function patchTeam(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsedBody = UpdateTeamBodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    return next(Errors.VALIDATION_ERROR);
  }

  try {
    const userId = (req as AuthRequest).userId;
    const teamId = String(req.params.teamId);

    const response = await updateTeamService(userId, teamId, parsedBody.data);

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
}

export async function getSlackConnect(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as AuthRequest).userId;
    const teamId = String(req.params.teamId);
    const slackAuthorizeUrl = await createSlackConnectUrl(userId, teamId);

    return res.redirect(slackAuthorizeUrl);
  } catch (error) {
    return next(error);
  }
}

export async function getSlackOAuthCallback(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as AuthRequest).userId;
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(getSlackClientRedirectUrl(null));
    }

    if (typeof code !== 'string' || typeof state !== 'string') {
      return res.redirect(getSlackClientRedirectUrl(null));
    }

    const connectedSlack = await completeSlackOAuthConnection(
      userId,
      code,
      state,
    );

    return res.redirect(getSlackClientRedirectUrl(connectedSlack.teamId));
  } catch (error) {
    return next(error);
  }
}

export async function postSlackTestMessage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsedBody = SlackTestMessageBodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    return next(Errors.VALIDATION_ERROR);
  }

  try {
    const userId = (req as AuthRequest).userId;
    const teamId = String(req.params.teamId);

    const response = await sendSlackTestMessageService(
      userId,
      teamId,
      parsedBody.data,
    );

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
}

export async function getSlackNotificationSettings(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as AuthRequest).userId;
    const teamId = String(req.params.teamId);

    const response = await getSlackNotificationSettingsService(userId, teamId);

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
}

export async function patchSlackNotificationSettings(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsedBody = UpdateSlackNotificationSettingsBodySchema.safeParse(
    req.body,
  );

  if (!parsedBody.success) {
    return next(Errors.VALIDATION_ERROR);
  }

  try {
    const userId = (req as AuthRequest).userId;
    const teamId = String(req.params.teamId);

    const response = await updateSlackNotificationSettingsService(
      userId,
      teamId,
      parsedBody.data,
    );

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
}

// 팀원 초대
export async function inviteTeamMembers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsedBody = InviteTeamMembersBodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    return next(Errors.VALIDATION_ERROR);
  }

  try {
    const userId = (req as AuthRequest).userId;
    const teamId = String(req.params.teamId);

    const response = await inviteTeamMembersService(
      userId,
      teamId,
      parsedBody.data,
    );

    return res.status(201).json(response);
  } catch (error) {
    return next(error);
  }
}
