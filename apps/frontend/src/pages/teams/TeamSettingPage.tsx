import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, FilePlus2, MessageCircle, Reply } from 'lucide-react';

import Toggle from '@/components/ui/Toogle';
import {
  getGetSlackNotificationSettingsQueryKey,
  getGetTeamsTeamIdSettingsQueryKey,
  useGetSlackNotificationSettings,
  useGetTeamsTeamIdSettings,
  usePatchTeamsTeamId,
  useSendSlackTestMessage,
  useUpdateSlackNotificationSettings,
} from '@/api/generated';

const SLACK_NOTIFICATION_EVENTS = [
  {
    id: 'issueCreated',
    label: '새 이슈 등록됨',
    description: '팀에 새 이슈가 등록되면 알려드려요.',
    icon: FilePlus2,
  },
  {
    id: 'commentOnMyIssue',
    label: '내 이슈에 해결제안이 달림',
    description: '내가 작성한 이슈에 새 제안이 달리면 알려드려요.',
    icon: MessageCircle,
  },
  {
    id: 'replyOnMyComment',
    label: '내 제안에 답글이 달림',
    description: '내 제안에 답글이 달리면 알려드려요.',
    icon: Reply,
  },
  {
    id: 'commentAdopted',
    label: '내 제안이 채택됨',
    description: '내 해결 제안이 채택되면 알려드려요.',
    icon: BadgeCheck,
  },
] as const;

type SlackNotificationEventId =
  (typeof SLACK_NOTIFICATION_EVENTS)[number]['id'];

type SlackTestMessageStatus = 'idle' | 'success' | 'error';

const DEFAULT_SLACK_NOTIFICATION_EVENTS: Record<
  SlackNotificationEventId,
  boolean
> = {
  issueCreated: true,
  commentOnMyIssue: true,
  replyOnMyComment: true,
  commentAdopted: true,
};

export default function TeamSettingPage() {
  const { teamId } = useParams<{ teamId: string }>();

  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [slackTestMessage, setSlackTestMessage] = useState('');
  const [slackTestMessageStatus, setSlackTestMessageStatus] =
    useState<SlackTestMessageStatus>('idle');
  const [isSlackEventSaved, setIsSlackEventSaved] = useState(false);
  const [slackNotificationEvents, setSlackNotificationEvents] = useState<Record<
    SlackNotificationEventId,
    boolean
  > | null>(null);

  const initializedRef = useRef(false); // 초기화 여부 기억
  const queryClient = useQueryClient();

  const {
    data: teamSettings,
    isLoading: isTeamSettingsLoading,
    error: teamSettingsError,
  } = useGetTeamsTeamIdSettings(teamId ?? '', {
    query: {
      enabled: Boolean(teamId),
    },
    request: {
      withCredentials: true,
    },
  });

  const {
    data: slackNotificationSettings,
    isLoading: isSlackNotificationSettingsLoading,
    error: slackNotificationSettingsError,
  } = useGetSlackNotificationSettings(teamId ?? '', {
    query: {
      enabled: Boolean(teamId),
    },
    request: {
      withCredentials: true,
    },
  });

  // 첫 렌더링 시에만 초기화
  useEffect(() => {
    if (!teamSettings || initializedRef.current) {
      return;
    }

    setTeamName(teamSettings.name);
    setTeamDescription(teamSettings.description ?? '');

    initializedRef.current = true;
  }, [teamSettings]);

  // 팀 정보 수정
  const {
    mutate: updateTeam,
    isSuccess: isUpdateTeamSuccess,
    isPending: isUpdateTeamPending,
    error: updateTeamError,
  } = usePatchTeamsTeamId({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetTeamsTeamIdSettingsQueryKey(teamId ?? ''),
        });
      },
    },
  });

  const isLeader = teamSettings?.userId === teamSettings?.ownerId;
  const isSlackConnected = Boolean(teamSettings?.isSlackConnected);
  const currentSlackNotificationEvents =
    slackNotificationEvents ??
    slackNotificationSettings ??
    DEFAULT_SLACK_NOTIFICATION_EVENTS;

  const { mutate: sendSlackTestMessage, isPending: isSendingSlackTestMessage } =
    useSendSlackTestMessage({
      mutation: {
        onSuccess: () => {
          setSlackTestMessage('');
          setSlackTestMessageStatus('success');
        },
        onError: () => {
          setSlackTestMessageStatus('error');
        },
      },
    });

  const {
    mutate: updateSlackNotificationSettings,
    isPending: isUpdatingSlackNotificationSettings,
    error: updateSlackNotificationSettingsError,
  } = useUpdateSlackNotificationSettings({
    mutation: {
      onSuccess: (updatedSettings) => {
        setSlackNotificationEvents({
          issueCreated: updatedSettings.issueCreated,
          commentOnMyIssue: updatedSettings.commentOnMyIssue,
          replyOnMyComment: updatedSettings.replyOnMyComment,
          commentAdopted: updatedSettings.commentAdopted,
        });
        setIsSlackEventSaved(true);
        queryClient.invalidateQueries({
          queryKey: getGetSlackNotificationSettingsQueryKey(teamId ?? ''),
        });
      },
      onError: () => {
        setIsSlackEventSaved(false);
      },
    },
  });

  const handleSubmitUpdateTeam = () => {
    if (!isLeader) return alert('수정 권한이 없습니다.');
    if (!teamId) return console.error('teamId를 가져올 수 없습니다.');

    // 변경된 값만 payload에 포함
    const payload: {
      name?: string;
      description?: string;
    } = {};

    if (teamName !== teamSettings?.name) {
      payload.name = teamName;
    }

    if (teamDescription !== teamSettings?.description) {
      payload.description = teamDescription;
    }

    updateTeam({
      teamId: teamId,
      data: payload,
    });
  };

  const handleToggleSlackEvent = (eventId: SlackNotificationEventId) => {
    setIsSlackEventSaved(false);
    setSlackNotificationEvents((prevEvents) => {
      const nextEvents =
        prevEvents ??
        slackNotificationSettings ??
        DEFAULT_SLACK_NOTIFICATION_EVENTS;

      return {
        ...nextEvents,
        [eventId]: !nextEvents[eventId],
      };
    });
  };

  const handleConnectSlack = () => {
    if (!teamId) return console.error('teamId를 가져올 수 없습니다.');

    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    window.location.href = `${apiBaseUrl}/teams/${teamId}/slack/connect`;
  };

  const handleSaveSlackNotificationEvents = () => {
    if (!teamId) {
      return console.error('teamId를 가져올 수 없습니다.');
    }

    setIsSlackEventSaved(false);
    updateSlackNotificationSettings({
      teamId,
      data: currentSlackNotificationEvents,
    });
  };

  const handleSubmitSlackTestMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextMessage = slackTestMessage.trim();

    if (!nextMessage) {
      return;
    }

    if (!teamId) {
      return console.error('teamId를 가져올 수 없습니다.');
    }

    if (!isSlackConnected) {
      setSlackTestMessageStatus('error');
      return;
    }

    setSlackTestMessageStatus('idle');
    sendSlackTestMessage({
      teamId,
      data: {
        message: nextMessage,
      },
    });
  };

  const teamNameElement = isLeader ? (
    <input
      value={teamName}
      onChange={(e) => setTeamName(e.target.value)}
      placeholder="팀 이름을 입력하세요."
      className="w-full px-4 py-3 rounded-sm outline-none typo-regular-16
        transition-all duration-300
        focus:border-white
        focus:shadow-[0_0_12px_rgba(255,255,255,0.4)]"
      style={{
        background: 'var(--surface-input)',
        color: 'var(--text-primary)',
      }}
    />
  ) : (
    <div>{teamSettings?.name}</div>
  );

  const teamDescriptionElement = isLeader ? (
    <textarea
      value={teamDescription}
      onChange={(e) => setTeamDescription(e.target.value)}
      placeholder="팀에 대한 설명을 입력하세요."
      className="w-full h-38 p-5 rounded-sm resize-none outline-none typo-regular-16
        transition-all duration-300
        focus:border-white
        focus:shadow-[0_0_12px_rgba(255,255,255,0.4)]"
      style={{
        background: 'var(--surface-input)',
        color: 'var(--text-primary)',
      }}
    />
  ) : (
    <div>{teamSettings?.description}</div>
  );

  const updateTeamElement = (
    <div className="pt-6 flex flex-col items-end gap-4 border-t border-white/50">
      {updateTeamError && (
        <p className="text-[var(--status-error)] text-sm typo-regular-14">
          팀 수정에 실패했습니다. 다시 시도해주세요.
        </p>
      )}
      {isUpdateTeamSuccess && (
        <p className="text-[var(--primary)] text-sm typo-regular-14">
          팀 수정이 완료되었습니다.
        </p>
      )}
      <button
        onClick={handleSubmitUpdateTeam}
        disabled={isUpdateTeamPending}
        className="py-[18px] px-[32px] h-15 rounded-sm typo-regular-20
          cursor-pointer
          transition-all duration-200 ease-out
          hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        style={{
          background: 'var(--primary)',
          color: 'var(--text-inverse)',
        }}
      >
        {isUpdateTeamPending ? '수정 중...' : '수정하기'}
      </button>
    </div>
  );

  if (isTeamSettingsLoading) {
    return (
      <section className="w-full flex-1 px-[60px] pt-[60px] pb-[60px] text-(--text-primary)">
        <div className="py-10 text-center typo-regular-14 text-(--text-secondary)">
          불러오는 중...
        </div>
      </section>
    );
  }

  if (teamSettingsError) {
    console.error(teamSettingsError);

    return (
      <section className="w-full flex-1 px-[60px] pt-[60px] pb-[60px] text-(--text-primary)">
        <div className="py-10 text-center typo-regular-14 text-(--text-secondary)">
          팀 정보 가져오기에 실패했습니다.
        </div>
      </section>
    );
  }

  return (
    <main className="p-[60px]">
      <div className="flex flex-col gap-[82px]">
        <div className="flex flex-col gap-[48px]">
          {/* 팀 정보 수정 */}
          <section className="bg-card rounded-lg p-10 flex flex-col gap-9">
            <div className="flex justify-between">
              <h1 className="typo-medium-40">팀 정보</h1>
            </div>
            <div className="flex flex-col gap-8">
              {/* 팀 이름 */}
              <div className="flex flex-col gap-4">
                <label className="typo-regular-20">팀 이름</label>
                {teamNameElement}
              </div>
              {/* 팀 설명 */}
              <div className="flex flex-col gap-4">
                <label className="typo-regular-20">팀 설명</label>
                {teamDescriptionElement}
              </div>
              {isLeader && updateTeamElement}
            </div>
          </section>

          {/* 팀원 목록 */}
          <section className="bg-card rounded-lg p-10">
            <div className="space-y-[39px]">
              <div className="flex justify-between items-center">
                <h2 className="typo-medium-40">멤버</h2>
              </div>

              <div className="space-y-[8px]">
                {teamSettings?.members.map((member) => (
                  <MemberListItem {...member} />
                ))}
              </div>
            </div>
          </section>

          {/* 알림 설정 */}
          <section className="bg-card rounded-lg p-10 flex flex-col gap-9">
            <div className="space-y-[39px]">
              <div className="flex justify-between items-center">
                <h2 className="typo-medium-40">알림 설정</h2>
              </div>

              <div className="space-y-[8px]">
                <div className="typo-bold-20 pb-2">웹 알림</div>
                <div>
                  <NotificationSettingItem
                    title="새 게시글"
                    onToggle={() => {}}
                  />
                  <NotificationSettingItem
                    title="댓글 언급"
                    onToggle={() => {}}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 슬랙 연동 */}
          <section className="bg-card rounded-lg p-10 flex flex-col gap-9">
            <div className="space-y-[39px]">
              <div className="flex justify-between items-center">
                <h2 className="typo-medium-40">슬랙 알림 설정</h2>
              </div>

              <div className="space-y-10">
                <div className="flex flex-col gap-4">
                  <div className="typo-bold-20">연결상태</div>
                  <div className="flex items-center justify-between gap-4 px-10 py-5 rounded-lg bg-[var(--surface-input)]">
                    {isSlackConnected ? (
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full bg-[var(--status-solved)]" />
                        <span className="typo-semibold-20 text-[var(--status-solved)]">
                          연결됨
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="typo-regular-16 text-[var(--text-secondary)]">
                          아직 연결된 슬랙 채널이 없습니다.
                        </span>
                        <button
                          type="button"
                          onClick={handleConnectSlack}
                          className="shrink-0 px-8 py-3 rounded-sm typo-regular-20
                            cursor-pointer transition-all duration-200 ease-out
                            hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                          style={{
                            background: 'var(--primary)',
                            color: 'var(--text-inverse)',
                          }}
                        >
                          연결하기
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="typo-bold-20">알림을 받을 이벤트 선택</div>
                    <div className="flex items-center gap-4">
                      {isSlackEventSaved && (
                        <span className="typo-regular-14 text-[var(--status-solved)]">
                          저장되었습니다.
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleSaveSlackNotificationEvents}
                        disabled={
                          isSlackNotificationSettingsLoading ||
                          isUpdatingSlackNotificationSettings
                        }
                        className="px-6 py-3 rounded-sm typo-regular-16
                          cursor-pointer transition-all duration-200 ease-out
                          hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]
                          disabled:cursor-not-allowed disabled:opacity-50"
                        style={{
                          background: 'var(--primary)',
                          color: 'var(--text-inverse)',
                        }}
                      >
                        {isUpdatingSlackNotificationSettings
                          ? '저장 중...'
                          : '저장하기'}
                      </button>
                    </div>
                  </div>
                  {(slackNotificationSettingsError ||
                    updateSlackNotificationSettingsError) && (
                    <p className="typo-regular-14 text-[var(--status-unsaved)]">
                      Slack 알림 설정을 저장하지 못했습니다. 다시 시도해주세요.
                    </p>
                  )}
                  <div className="grid grid-cols-1 gap-3 min-[1334px]:grid-cols-4">
                    {SLACK_NOTIFICATION_EVENTS.map((slackEvent) => {
                      const EventIcon = slackEvent.icon;
                      const isChecked =
                        currentSlackNotificationEvents[slackEvent.id];

                      return (
                        <label
                          key={slackEvent.id}
                          className={`flex min-h-40 cursor-pointer flex-col justify-between gap-5 rounded-lg border px-5 py-5 transition-all duration-200 ${
                            isChecked
                              ? 'border-white/30 bg-[var(--surface-input)]'
                              : 'border-transparent bg-[var(--surface-input)] opacity-80 hover:border-white/30 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <span
                              className={`flex h-12 w-12 items-center justify-center rounded-sm ${
                                isChecked
                                  ? 'bg-[var(--surface-selected)] text-[var(--text-primary)]'
                                  : 'bg-[var(--surface-selected)] text-[var(--text-secondary)]'
                              }`}
                            >
                              <EventIcon className="h-6 w-6" />
                            </span>

                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                handleToggleSlackEvent(slackEvent.id)
                              }
                              className="mt-1 h-5 w-5 accent-[var(--primary)]"
                            />
                          </div>

                          <div className="space-y-2">
                            <span className="block typo-semibold-20">
                              {slackEvent.label}
                            </span>
                            <p className="typo-regular-14 leading-5 text-[var(--text-secondary)]">
                              {slackEvent.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <form
                  onSubmit={handleSubmitSlackTestMessage}
                  className="flex flex-col gap-4"
                >
                  <div className="typo-bold-20">테스트 메세지 보내기</div>
                  <div className="flex gap-4">
                    <input
                      value={slackTestMessage}
                      onChange={(event) =>
                        setSlackTestMessage(event.target.value)
                      }
                      disabled={!isSlackConnected || isSendingSlackTestMessage}
                      placeholder={
                        isSlackConnected
                          ? '연결된 채널로 보낼 테스트 메세지를 입력하세요.'
                          : 'Slack 연결 후 테스트 메세지를 보낼 수 있습니다.'
                      }
                      className="w-full px-4 py-3 rounded-sm outline-none typo-regular-16
                        transition-all duration-300
                        focus:border-white
                        focus:shadow-[0_0_12px_rgba(255,255,255,0.4)]
                        disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        background: 'var(--surface-input)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={
                        !slackTestMessage.trim() ||
                        !isSlackConnected ||
                        isSendingSlackTestMessage
                      }
                      className="shrink-0 px-8 rounded-sm typo-regular-20
                        cursor-pointer transition-all duration-200 ease-out
                        hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]
                        disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        background: 'var(--primary)',
                        color: 'var(--text-inverse)',
                      }}
                    >
                      {isSendingSlackTestMessage ? '전송 중...' : '보내기'}
                    </button>
                  </div>
                  {slackTestMessageStatus === 'success' && (
                    <p className="typo-regular-14 text-[var(--status-solved)]">
                      테스트 메시지를 전송했습니다.
                    </p>
                  )}
                  {slackTestMessageStatus === 'error' && (
                    <p className="typo-regular-14 text-[var(--status-unsaved)]">
                      테스트 메시지 전송에 실패했습니다. Slack 연결 상태를
                      확인해주세요.
                    </p>
                  )}
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

type MemberListItemProps = {
  name: string;
  role: string;
  score: number;
  joinedAt: string;
};

function MemberListItem({ name, role, score, joinedAt }: MemberListItemProps) {
  return (
    <div className="flex items-center justify-between px-10 py-5 rounded-lg">
      <div className="flex items-center gap-[16px]">
        <div className="flex gap-10 items-center">
          <div className="flex gap-5 items-center">
            <div className="w-16 h-16 bg-gray-400 rounded-full" />
            <div className="space-y-1">
              <div className="space-x-3">
                <span className="typo-bold-20">{name}</span>
                <span className="typo-bold-20">{score.toLocaleString()}점</span>
              </div>
              <div>
                <span className="typo-regular-16 text-[var(--text-muted)]">
                  {joinedAt} 가입
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-x-4">
        {role == 'LEADER' ? (
          <span className="typo-regular-16 bg-[#544777] px-2 py-1 rounded-sm">
            팀장
          </span>
        ) : (
          <span className="typo-regular-16 bg-[var(--status-unsaved)] px-2 py-1 rounded-sm">
            내보내기
          </span>
        )}
      </div>
    </div>
  );
}

type NotificationSettingItemProps = {
  title: string;
  onToggle: () => void;
};

function NotificationSettingItem({
  title,
  onToggle,
}: NotificationSettingItemProps) {
  const [ischecked, SetIsChecked] = useState(false);

  return (
    <div className="flex items-center justify-between px-10 py-2 rounded-lg">
      <div className="flex gap-5 items-center">
        <span className="typo-semibold-20">{title}</span>
      </div>
      <Toggle
        checked={ischecked}
        onChange={() => {
          onToggle();
          SetIsChecked((prev) => !prev);
        }}
      />
    </div>
  );
}
