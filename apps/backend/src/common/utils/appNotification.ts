import prisma from '../config/prisma.js';

export const APP_NOTIFICATION_TYPE = {
  ISSUE_CREATED: 'ISSUE_CREATED',
  COMMENT: 'COMMENT',
  REPLY: 'REPLY',
  ADOPTED: 'ADOPTED',
} as const;

type AppNotificationType =
  (typeof APP_NOTIFICATION_TYPE)[keyof typeof APP_NOTIFICATION_TYPE];

type CreateAppNotificationParams = {
  userId: string;
  actorUserId: string;
  resourceId: string;
  type: AppNotificationType;
  content: string;
};

type CreateTeamAppNotificationsParams = {
  teamId: string;
  actorUserId: string;
  resourceId: string;
  type: AppNotificationType;
  content: string;
};

export async function createAppNotification({
  userId,
  actorUserId,
  resourceId,
  type,
  content,
}: CreateAppNotificationParams) {
  if (userId === actorUserId) {
    return;
  }

  await prisma.notification.create({
    data: {
      userId,
      resourceId,
      type,
      content,
    },
  });
}

export async function createTeamAppNotifications({
  teamId,
  actorUserId,
  resourceId,
  type,
  content,
}: CreateTeamAppNotificationsParams) {
  const teamMembers = await prisma.teamMember.findMany({
    where: {
      teamId,
      status: 'ACTIVE',
      userId: {
        not: actorUserId,
      },
    },
    select: {
      userId: true,
    },
  });

  if (teamMembers.length === 0) {
    return;
  }

  await prisma.notification.createMany({
    data: teamMembers.map((teamMember) => ({
      userId: teamMember.userId,
      resourceId,
      type,
      content,
    })),
  });
}
