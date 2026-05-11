import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import Toggle from '@/components/ui/Toogle';
import {
  getGetTeamsTeamIdSettingsQueryKey,
  useGetTeamsTeamIdSettings,
  usePatchTeamsTeamId,
} from '@/api/generated';

export default function TeamSettingPage() {
  const { teamId } = useParams<{ teamId: string }>();

  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');

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
