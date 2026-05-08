import { useEffect, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  getGetNotificationsQueryKey,
  useGetNotifications,
  useReadNotification,
} from '@/api/generated';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  href: string;
};

const NOTIFICATION_TITLES: Record<string, string> = {
  ISSUE_COMMENT: '내 이슈에 제안이 등록되었어요',
  NEW_REPLY: '내 제안에 답글이 달렸어요',
  COMMENT_ADOPTED: '내 제안이 채택되었어요',
  NEW_ISSUE: '내 팀의 새 이슈가 등록되었어요',
  DEFAULT: '새 알림이 도착했어요',
};

const getNotificationTitle = (type: string) => {
  return NOTIFICATION_TITLES[type] ?? NOTIFICATION_TITLES.DEFAULT;
};

const formatNotificationDate = (createdAt: string) => {
  const parsedDate = new Date(createdAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return createdAt;
  }

  return parsedDate.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function NotificationPopover() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);
  const {
    data: notificationsResponse,
    isError,
    isLoading,
  } = useGetNotifications();

  const notifications: NotificationItem[] =
    notificationsResponse?.data.map((notification) => ({
      id: notification.id,
      title: getNotificationTitle(notification.type),
      message: notification.content,
      createdAt: formatNotificationDate(notification.createdAt),
      isRead:
        notification.isRead || readNotificationIds.includes(notification.id),
      href: notification.link,
    })) ?? [];

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const addReadNotificationId = (notificationId: string) => {
    setReadNotificationIds((prevReadNotificationIds) => {
      if (prevReadNotificationIds.includes(notificationId)) {
        return prevReadNotificationIds;
      }

      return [...prevReadNotificationIds, notificationId];
    });
  };

  const { mutate: readNotificationById, isPending: isReadingNotification } =
    useReadNotification({
      mutation: {
        onSuccess: (readNotification) => {
          addReadNotificationId(readNotification.id);
        },
        onError: (_, variables) => {
          setReadNotificationIds((prevReadNotificationIds) =>
            prevReadNotificationIds.filter(
              (notificationId) => notificationId !== variables.id,
            ),
          );
        },
        onSettled: () => {
          queryClient.invalidateQueries({
            queryKey: getGetNotificationsQueryKey(),
          });
        },
      },
    });

  const markAllNotificationsAsRead = () => {
    const unreadNotifications = notifications.filter(
      (notification) => !notification.isRead,
    );

    if (unreadNotifications.length === 0) {
      return;
    }

    setReadNotificationIds((prevReadNotificationIds) =>
      Array.from(
        new Set([
          ...prevReadNotificationIds,
          ...unreadNotifications.map((notification) => notification.id),
        ]),
      ),
    );

    unreadNotifications.forEach((notification) => {
      readNotificationById({ id: notification.id });
    });
  };

  const readNotification = (selectedNotification: NotificationItem) => {
    if (!selectedNotification.isRead) {
      addReadNotificationId(selectedNotification.id);
      readNotificationById({ id: selectedNotification.id });
    }

    if (selectedNotification.href) {
      navigate(selectedNotification.href);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={popoverRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prevIsOpen) => !prevIsOpen)}
        className="relative flex cursor-pointer items-center justify-center text-secondary-foreground"
        aria-label="알림 목록 열기"
        aria-expanded={isOpen}
      >
        {unreadCount > 0 && (
          <span className="absolute -right-0.75 -top-1.25 inline-flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-destructive px-1 text-xs text-secondary-foreground">
            {unreadCount}
          </span>
        )}

        <Bell className="h-8 w-8" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-60 w-86 rounded-md border border-border bg-(--background) p-4 text-(--text-primary) shadow-(--shadow)">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="typo-semibold-18">알림</h2>
              <span className="mt-1 block typo-regular-14 text-(--text-secondary)">
                안 읽은 알림 {unreadCount}
              </span>
            </div>

            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              disabled={unreadCount === 0 || isLoading || isReadingNotification}
              className="cursor-pointer rounded-sm px-3 py-1 typo-regular-14 text-(--primary) transition hover:bg-(--surface-selected) disabled:cursor-not-allowed disabled:text-(--text-muted)"
            >
              모두 읽음
            </button>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="rounded-sm bg-(--surface-comment) px-4 py-8 text-center typo-regular-14 text-(--text-secondary)">
                알림을 불러오는 중입니다.
              </div>
            ) : isError ? (
              <div className="rounded-sm bg-(--surface-comment) px-4 py-8 text-center typo-regular-14 text-(--status-error)">
                알림을 불러오지 못했습니다.
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => readNotification(notification)}
                  className={`w-full cursor-pointer rounded-sm border p-4 text-left transition hover:bg-(--surface-selected) ${
                    notification.isRead
                      ? 'border-transparent bg-(--surface-panel) opacity-75'
                      : 'bg-(--surface-comment)'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p
                      className={`typo-medium-16 ${
                        notification.isRead
                          ? 'text-(--text-secondary)'
                          : 'text-(--text-primary)'
                      }`}
                    >
                      {notification.title}
                    </p>

                    {!notification.isRead && (
                      <span className="rounded-full bg-(--surface-tag) px-2 text-xs text-(--primary)">
                        New
                      </span>
                    )}
                  </div>

                  <p className="typo-regular-14 leading-5 text-(--text-secondary)">
                    {notification.message}
                  </p>

                  <span className="mt-3 block text-xs text-(--text-muted)">
                    {notification.createdAt}
                  </span>
                </button>
              ))
            ) : (
              <div className="rounded-sm bg-(--surface-comment) px-4 py-8 text-center typo-regular-14 text-(--text-secondary)">
                아직 도착한 알림이 없습니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationPopover;
