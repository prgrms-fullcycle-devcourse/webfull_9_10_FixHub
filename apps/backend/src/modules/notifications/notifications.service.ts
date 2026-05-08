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

  return {
    data: notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      content: notification.content ?? '',
      isRead: notification.isRead,
      link: notification.resourceId ? `/issues/${notification.resourceId}` : '',
      createdAt: notification.createdAt.toISOString(),
    })),
  };
}
