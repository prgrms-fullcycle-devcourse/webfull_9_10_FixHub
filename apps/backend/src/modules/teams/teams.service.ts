import { CreateTeamBodyDto } from './teams.dto.js';
import prisma from '../../common/config/prisma.js';

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
