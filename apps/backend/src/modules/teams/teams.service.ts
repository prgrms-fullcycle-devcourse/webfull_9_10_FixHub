import { CreateTeamBodyDto } from './teams.dto.js';
import prisma from '../../common/config/prisma.js';
import { Errors } from '../../common/errors/AppError.js';

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

// 팀원 목록 조회
export async function getTeamMembers(userId: string, teamId: string) {
  // 사용자가 요청한 팀에 속해있는지 확인
  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });

  if (!membership || membership.status !== 'ACTIVE') {
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });

    // 팀 자체가 존재하지 않음
    if (!team) {
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
    orderBy: {
      score: 'desc',
    },
  });

  const data = members.map((member) => ({
    userId: member.userId,
    name: member.user.name,
    role: member.role === 'LEADER' ? 'OWNER' : 'MEMBER',
    joinedAt: member.joinedAt?.toISOString() ?? null,
    score: member.score,
  }));

  return { data };
}
