import { useEffect, useRef, useState } from 'react';

import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  href?: string;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: '새 댓글이 등록되었어요',
    message: '로그인 시 500 에러 발생 이슈에 새로운 댓글이 달렸습니다.',
    createdAt: '방금 전',
    isRead: false,
    href: '/issues/1',
  },
  {
    id: 2,
    title: '답변이 채택되었어요',
    message: '작성한 해결 제안이 채택되어 점수를 획득했습니다.',
    createdAt: '10분 전',
    isRead: false,
    href: '/issues/1',
  },
  {
    id: 3,
    title: '팀 초대가 도착했어요',
    message: 'FixHub 팀에서 새로운 초대를 보냈습니다.',
    createdAt: '어제',
    isRead: true,
    href: '/teams/new',
  },
];

function NotificationPopover() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const markAllNotificationsAsRead = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    );
  };

  const readNotification = (selectedNotification: NotificationItem) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === selectedNotification.id
          ? {
              ...notification,
              isRead: true,
            }
          : notification,
      ),
    );

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
              disabled={unreadCount === 0}
              className="cursor-pointer rounded-sm px-3 py-1 typo-regular-14 text-(--primary) transition hover:bg-(--surface-selected) disabled:cursor-not-allowed disabled:text-(--text-muted)"
            >
              모두 읽음
            </button>
          </div>

          <div className="space-y-3">
            {notifications.length > 0 ? (
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
