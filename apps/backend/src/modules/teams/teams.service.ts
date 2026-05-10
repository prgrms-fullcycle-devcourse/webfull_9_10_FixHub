import { CreateTeamBodyDto, UpdateTeamBodyDto } from './teams.dto.js';
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
