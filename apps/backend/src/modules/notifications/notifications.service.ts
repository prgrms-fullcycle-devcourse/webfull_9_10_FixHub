import { Errors } from '../../common/errors/AppError.js';
import prisma from '../../common/config/prisma.js';

import type {
  GetNotificationsResponseDto,
  ReadNotificationParamsDto,
  ReadNotificationResponseDto,
} from './notifications.dto.js';

export async function getNotifications(
  userId: string,
): Promise<GetNotificationsResponseDto> {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      type: true,
      content: true,
      isRead: true,
      resourceId: true,
      createdAt: true,
    },
  });

  const issueIds = notifications
    .map((notification) => notification.resourceId)
    .filter((resourceId): resourceId is string => Boolean(resourceId));

  const issues =
    issueIds.length > 0
      ? await prisma.errorIssue.findMany({
          where: {
            id: {
              in: issueIds,
            },
          },
          select: {
            id: true,
            teamId: true,
          },
        })
      : [];

  const issueMap = new Map(issues.map((issue) => [issue.id, issue]));

  return {
    data: notifications.map((notification) => {
      const issue = notification.resourceId
        ? issueMap.get(notification.resourceId)
        : null;

      return {
        id: notification.id,
        type: notification.type,
        content: notification.content ?? '',
        isRead: notification.isRead,
        link: issue ? `/teams/${issue.teamId}/issues/${issue.id}` : '',
        createdAt: notification.createdAt.toISOString(),
      };
    }),
  };
}

export async function readNotification(
  params: ReadNotificationParamsDto,
  userId: string,
): Promise<ReadNotificationResponseDto> {
  const notification = await prisma.notification.findUnique({
    where: {
      id: params.id,
    },
    select: {
      id: true,
      userId: true,
      isRead: true,
    },
  });

  if (!notification) {
    throw Errors.NOT_FOUND;
  }

  if (notification.userId !== userId) {
    throw Errors.FORBIDDEN;
  }

  if (notification.isRead) {
    return {
      id: notification.id,
      isRead: notification.isRead,
    };
  }

  return prisma.notification.update({
    where: {
      id: notification.id,
    },
    data: {
      isRead: true,
    },
    select: {
      id: true,
      isRead: true,
    },
  });
}
