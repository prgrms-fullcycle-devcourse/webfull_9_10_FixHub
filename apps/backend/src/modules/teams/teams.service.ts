import axios from 'axios';
import jwt from 'jsonwebtoken';

import type {
  CreateTeamBodyDto,
  SlackNotificationSettingsDto,
  SlackTestMessageBodyDto,
  SlackTestMessageResponseDto,
  UpdateSlackNotificationSettingsBodyDto,
  UpdateTeamBodyDto,
  InviteTeamMembersBodyDto,
} from './teams.dto.js';
import prisma from '../../common/config/prisma.js';
import { AppError, Errors } from '../../common/errors/AppError.js';

const SLACK_AUTHORIZE_URL = 'https://slack.com/oauth/v2/authorize';
const SLACK_OAUTH_ACCESS_URL = 'https://slack.com/api/oauth.v2.access';
const SLACK_SCOPE = 'incoming-webhook';

type SlackOAuthState = {
  teamId: string;
  userId: string;
};

type SlackOAuthAccessResponse = {
  ok: boolean;
  error?: string;
  incoming_webhook?: {
    channel?: string;
    channel_id?: string;
    configuration_url?: string;
    url?: string;
  };
};

type SlackNotificationSettingsSource = {
  slackNotifyIssueCreated: boolean;
  slackNotifyCommentOnMyIssue: boolean;
  slackNotifyReplyOnMyComment: boolean;
  slackNotifyCommentAdopted: boolean;
};

function mapSlackNotificationSettings(
  source: SlackNotificationSettingsSource,
): SlackNotificationSettingsDto {
  return {
    issueCreated: source.slackNotifyIssueCreated,
    commentOnMyIssue: source.slackNotifyCommentOnMyIssue,
    replyOnMyComment: source.slackNotifyReplyOnMyComment,
    commentAdopted: source.slackNotifyCommentAdopted,
  };
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new AppError(
      'CONFIGURATION_ERROR',
      `${name} 환경변수가 설정되어 있지 않습니다.`,
      500,
    );
  }

  return value;
}

function getSlackRedirectUri() {
  return (
    process.env.SLACK_REDIRECT_URI ??
    `${process.env.OPENAPI_URL ?? 'http://localhost:3000'}/teams/slack/oauth/callback`
  );
}

export function getSlackClientRedirectUrl(teamId: string | null) {
  const pathname = teamId ? `/teams/${teamId}/settings` : '/';

  return new URL(
    pathname,
    process.env.CLIENT_URL ?? 'http://localhost:5173',
  ).toString();
}

async function ensureActiveTeamMember(userId: string, teamId: string) {
  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });

  if (!membership) {
    const teamExists = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      select: {
        id: true,
      },
    });

    if (!teamExists) {
      throw Errors.TEAM_NOT_FOUND;
    }

    throw Errors.FORBIDDEN;
  }

  if (membership.status !== 'ACTIVE') {
    throw Errors.FORBIDDEN;
  }

  return membership;
}

// 팀 생성
export async function createTeam(userId: string, body: CreateTeamBodyDto) {
  const team = await prisma.team.create({
    data: {
      name: body.name,
      description: body.description,
      teamMembers: {
        create: {
          userId,
          role: 'LEADER',
          status: 'ACTIVE',
          joinedAt: new Date(),
        },
      },
    },
  });

  return {
    teamId: team.id,
    name: team.name,
    description: team.description,
    inviteCode: team.id,
  };
}

// 내가 속한 팀 조회
export async function getMyTeams(userId: string) {
  const teamMembers = await prisma.teamMember.findMany({
    where: {
      userId,
      status: 'ACTIVE',
    },
    include: {
      team: {
        include: {
          teamMembers: true,
        },
      },
    },
    orderBy: {
      joinedAt: 'desc',
    },
  });

  const data = teamMembers.map(({ team }) => {
    const owner = team.teamMembers.find((member) => member.role === 'LEADER');

    return {
      teamId: team.id,
      name: team.name,
      memberCount: team.teamMembers.length,
      ownerId: owner?.userId ?? null,
    };
  });

  return { data };
}

// 팀 상세 조회
export async function getTeamDetail(userId: string, teamId: string) {
  // 인가 및 팀 존재 여부 확인
  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });

  if (!membership) {
    const teamExists = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      select: {
        id: true,
      },
    });

    if (!teamExists) {
      throw Errors.TEAM_NOT_FOUND;
    }

    throw Errors.FORBIDDEN;
  }

  if (membership.status !== 'ACTIVE') {
    throw Errors.FORBIDDEN;
  }

  // 팀 내 (점수, 이름, 가입일) 상위 3명 조회
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
    include: {
      teamMembers: {
        where: {
          status: 'ACTIVE',
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [
          { score: 'desc' as const },
          {
            user: {
              name: 'asc' as const,
            },
          },
          { joinedAt: 'asc' as const },
        ],
        take: 3,
      },
    },
  });

  if (!team) {
    throw Errors.TEAM_NOT_FOUND;
  }

  // 리더 조회
  const owner = await prisma.teamMember.findFirst({
    where: {
      teamId,
      role: 'LEADER',
      status: 'ACTIVE',
    },
    select: {
      userId: true,
    },
  });

  return {
    userId,
    teamId: team.id,
    name: team.name,
    description: team.description,
    ownerId: owner?.userId ?? '',
    createdAt: team.createdAt.toISOString(),
    members: team.teamMembers.map((member) => ({
      userId: member.userId,
      name: member.user.name,
      role: member.role,
      joinedAt: member.joinedAt?.toISOString() ?? null,
      score: member.score ?? 0,
    })),
  };
}

// 팀 설정 조회
// TODO: 알림 설정 추가
export async function getTeamSettings(userId: string, teamId: string) {
  // 인가 및 팀 존재 여부 확인
  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });

  if (!membership) {
    const teamExists = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      select: {
        id: true,
      },
    });

    if (!teamExists) {
      throw Errors.TEAM_NOT_FOUND;
    }

    throw Errors.FORBIDDEN;
  }

  if (membership.status !== 'ACTIVE') {
    throw Errors.FORBIDDEN;
  }

  // 팀원 목록 조회 (정렬 순서: 이름, 가입일)
  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
    include: {
      teamMembers: {
        where: {
          status: 'ACTIVE',
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [
          {
            user: {
              name: 'asc' as const,
            },
          },
          { joinedAt: 'asc' as const },
        ],
      },
    },
  });

  if (!team) {
    throw Errors.TEAM_NOT_FOUND;
  }

  // 리더 조회
  const owner = await prisma.teamMember.findFirst({
    where: {
      teamId,
      role: 'LEADER',
      status: 'ACTIVE',
    },
    select: {
      userId: true,
    },
  });

  // 리더를 팀원 목록의 맨 위로 정렬
  const leader = team.teamMembers.find(
    (member) => member.userId === owner?.userId,
  );

  const membersExceptLeader = team.teamMembers.filter(
    (member) => member.userId !== owner?.userId,
  );

  team.teamMembers = leader
    ? [leader, ...membersExceptLeader]
    : membersExceptLeader;

  return {
    userId,
    teamId: team.id,
    name: team.name,
    description: team.description,
    ownerId: owner?.userId ?? '',
    isSlackConnected: Boolean(membership.slackWebhookUrl),
    createdAt: team.createdAt.toISOString(),
    members: team.teamMembers.map((member) => ({
      userId: member.userId,
      name: member.user.name,
      role: member.role,
      joinedAt: member.joinedAt?.toISOString() ?? null,
      score: member.score ?? 0,
    })),
  };
}

// 팀원 목록 조회 (정렬 순서: 점수, 이름, 가입일)
export async function getTeamMembers(userId: string, teamId: string) {
  // 인가 및 팀 존재 여부 확인
  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });

  if (!membership || membership.status !== 'ACTIVE') {
    const teamExists = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });

    // 팀 자체가 존재하지 않음
    if (!teamExists) {
      throw Errors.TEAM_NOT_FOUND;
    }

    // 사용자가 요청한 팀에 속해있지 않음
    throw Errors.FORBIDDEN;
  }

  const members = await prisma.teamMember.findMany({
    where: {
      teamId,
      status: 'ACTIVE',
    },
    include: {
      user: true,
    },
    orderBy: [
      { score: 'desc' as const },
      {
        user: {
          name: 'asc' as const,
        },
      },
      { joinedAt: 'asc' as const },
    ],
  });

  const data = members.map((member) => ({
    userId: member.userId,
    name: member.user.name,
    role: member.role,
    joinedAt: member.joinedAt?.toISOString() ?? null,
    score: member.score,
  }));

  return { data };
}

// 팀 수정
export async function updateTeam(
  userId: string,
  teamId: string,
  body: UpdateTeamBodyDto,
) {
  // 인가 확인
  const requesterMembership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });

  if (!requesterMembership) {
    // 팀 존재 여부 확인
    const teamExists = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      select: {
        id: true,
      },
    });

    if (!teamExists) {
      throw Errors.TEAM_NOT_FOUND;
    }

    throw Errors.FORBIDDEN;
  }

  // 리더 여부 확인
  if (
    requesterMembership.status !== 'ACTIVE' ||
    requesterMembership.role !== 'LEADER'
  ) {
    throw Errors.FORBIDDEN;
  }

  // 새 리더의 ownerId가 팀 내에 있는지 확인
  if (body.ownerId) {
    const nextOwnerMembership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: body.ownerId,
        },
      },
    });

    if (!nextOwnerMembership || nextOwnerMembership.status !== 'ACTIVE') {
      throw Errors.FORBIDDEN;
    }
  }

  const updatedTeam = await prisma.$transaction(async (tx) => {
    // 리더 업데이트
    if (body.ownerId && body.ownerId !== userId) {
      // 기존의 LEADER를 MEMBER로
      await tx.teamMember.updateMany({
        where: {
          teamId,
          role: 'LEADER',
          status: 'ACTIVE',
        },
        data: {
          role: 'MEMBER',
        },
      });

      // 요청받은 ownerId의 사용자를 LEADER로
      await tx.teamMember.update({
        where: {
          teamId_userId: {
            teamId,
            userId: body.ownerId,
          },
        },
        data: {
          role: 'LEADER',
        },
      });
    }

    // 팀 설정 변경
    return tx.team.update({
      where: {
        id: teamId,
      },
      data: {
        ...(body.name !== undefined && {
          name: body.name,
        }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
      },
    });
  });

  return {
    teamId: updatedTeam.id,
    name: updatedTeam.name,
    description: updatedTeam.description,
  };
}

export async function createSlackConnectUrl(userId: string, teamId: string) {
  await ensureActiveTeamMember(userId, teamId);

  const clientId = getRequiredEnv('SLACK_CLIENT_ID');
  const jwtSecret = getRequiredEnv('JWT_SECRET');
  const state = jwt.sign({ teamId, userId }, jwtSecret, {
    expiresIn: '10m',
  });
  const slackAuthorizeUrl = new URL(SLACK_AUTHORIZE_URL);

  slackAuthorizeUrl.searchParams.set('client_id', clientId);
  slackAuthorizeUrl.searchParams.set('scope', SLACK_SCOPE);
  slackAuthorizeUrl.searchParams.set('redirect_uri', getSlackRedirectUri());
  slackAuthorizeUrl.searchParams.set('state', state);

  return slackAuthorizeUrl.toString();
}

export async function completeSlackOAuthConnection(
  userId: string,
  code: string,
  state: string,
) {
  const jwtSecret = getRequiredEnv('JWT_SECRET');
  const decodedState = jwt.verify(state, jwtSecret);

  if (
    typeof decodedState === 'string' ||
    typeof decodedState.teamId !== 'string' ||
    typeof decodedState.userId !== 'string'
  ) {
    throw Errors.VALIDATION_ERROR;
  }

  const slackState = decodedState as SlackOAuthState;

  if (slackState.userId !== userId) {
    throw Errors.FORBIDDEN;
  }

  await ensureActiveTeamMember(userId, slackState.teamId);

  const tokenRequestBody = new URLSearchParams({
    client_id: getRequiredEnv('SLACK_CLIENT_ID'),
    client_secret: getRequiredEnv('SLACK_CLIENT_SECRET'),
    code,
    redirect_uri: getSlackRedirectUri(),
  });

  const tokenResponse = await axios.post<SlackOAuthAccessResponse>(
    SLACK_OAUTH_ACCESS_URL,
    tokenRequestBody,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  const webhookUrl = tokenResponse.data.incoming_webhook?.url;

  if (!tokenResponse.data.ok || !webhookUrl) {
    throw new AppError(
      'SLACK_OAUTH_FAILED',
      tokenResponse.data.error ?? 'Slack OAuth 연동에 실패했습니다.',
      502,
    );
  }

  await prisma.teamMember.update({
    where: {
      teamId_userId: {
        teamId: slackState.teamId,
        userId,
      },
    },
    data: {
      slackWebhookUrl: webhookUrl,
    },
  });

  return {
    teamId: slackState.teamId,
    channelName: tokenResponse.data.incoming_webhook?.channel ?? null,
  };
}

export async function sendSlackTestMessage(
  userId: string,
  teamId: string,
  body: SlackTestMessageBodyDto,
): Promise<SlackTestMessageResponseDto> {
  const requesterMembership = await ensureActiveTeamMember(userId, teamId);

  if (!requesterMembership.slackWebhookUrl) {
    throw new AppError('SLACK_NOT_CONNECTED', 'Slack 연동이 필요합니다.', 400);
  }

  try {
    await axios.post(
      requesterMembership.slackWebhookUrl,
      {
        text: body.message,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  } catch {
    throw new AppError(
      'SLACK_MESSAGE_FAILED',
      'Slack 테스트 메시지 전송에 실패했습니다.',
      502,
    );
  }

  return {
    success: true,
  };
}

export async function getSlackNotificationSettings(
  userId: string,
  teamId: string,
): Promise<SlackNotificationSettingsDto> {
  const requesterMembership = await ensureActiveTeamMember(userId, teamId);

  return mapSlackNotificationSettings(requesterMembership);
}

export async function updateSlackNotificationSettings(
  userId: string,
  teamId: string,
  body: UpdateSlackNotificationSettingsBodyDto,
): Promise<SlackNotificationSettingsDto> {
  await ensureActiveTeamMember(userId, teamId);

  const updatedMembership = await prisma.teamMember.update({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
    data: {
      slackNotifyIssueCreated: body.issueCreated,
      slackNotifyCommentOnMyIssue: body.commentOnMyIssue,
      slackNotifyReplyOnMyComment: body.replyOnMyComment,
      slackNotifyCommentAdopted: body.commentAdopted,
    },
  });

  return mapSlackNotificationSettings(updatedMembership);
}

// 팀원 초대
export async function inviteTeamMembers(
  userId: string,
  teamId: string,
  body: InviteTeamMembersBodyDto,
) {
  const requester = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });

  if (!requester || requester.status !== 'ACTIVE') {
    throw Errors.FORBIDDEN;
  }

  if (requester.role !== 'LEADER') {
    throw Errors.FORBIDDEN;
  }

  const users = await prisma.user.findMany({
    where: {
      email: {
        in: body.emails,
      },
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (users.length !== body.emails.length) {
    throw Errors.USER_NOT_FOUND;
  }

  const inviteUserIds = await prisma.$transaction(async (tx) => {
    const ids: string[] = [];

    for (const user of users) {
      const existingMember = await tx.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId: user.id,
          },
        },
      });

      // 이미 존재하는 멤버일 경우 업데이트 및 반환을 생략
      if (existingMember) {
        // ids.push(existingMember.id);
        continue;
      }

      const createdMember = await tx.teamMember.create({
        data: {
          teamId,
          userId: user.id,
          role: 'MEMBER',
          status: 'ACTIVE', // TODO: 향후 PENDING으로 변경 및 초대 수락/거절 API 추가
          joinedAt: null,
        },
      });

      ids.push(createdMember.userId);
    }

    return ids;
  });

  return {
    inviteUserIds,
  };
}

// 팀원 내보내기
export async function deleteTeamMember(
  requesterId: string,
  teamId: string,
  targetUserId: string,
) {
  const requester = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId: requesterId,
      },
    },
  });

  if (!requester || requester.status !== 'ACTIVE') {
    throw Errors.FORBIDDEN;
  }

  if (requester.role !== 'LEADER') {
    throw Errors.FORBIDDEN;
  }

  if (requesterId === targetUserId) {
    throw new AppError(
      'CANNOT_REMOVE_SELF',
      '자기 자신은 내보낼 수 없습니다.',
      400,
    );
  }

  const targetMember = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId: targetUserId,
      },
    },
  });

  if (!targetMember) {
    throw Errors.USER_NOT_FOUND;
  }

  if (targetMember.role === 'LEADER') {
    throw new AppError(
      'CANNOT_REMOVE_LEADER',
      '팀장은 내보낼 수 없습니다.',
      400,
    );
  }

  const deletedMember = await prisma.teamMember.delete({
    where: {
      teamId_userId: {
        teamId,
        userId: targetUserId,
      },
    },
  });

  return {
    deletedMemberId: deletedMember.userId,
  };
}

// 팀 탈퇴
export async function leaveTeam(userId: string, teamId: string) {
  const teamMember = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });

  if (!teamMember) {
    throw Errors.NOT_FOUND;
  }

  if (teamMember.status !== 'ACTIVE') {
    throw Errors.FORBIDDEN;
  }

  const deletedMember = await prisma.teamMember.delete({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });

  return {
    deletedMemberId: deletedMember.userId,
  };
}
