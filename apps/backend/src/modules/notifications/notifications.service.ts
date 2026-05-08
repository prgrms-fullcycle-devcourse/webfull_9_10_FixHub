import prisma from '../../common/config/prisma.js';

import type { GetNotificationsResponseDto } from './notifications.dto.js';

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
