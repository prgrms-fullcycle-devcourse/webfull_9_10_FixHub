import { CreateTeamBodyDto } from './teams.dto.js';
import prisma from '../../common/config/prisma.js';

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
