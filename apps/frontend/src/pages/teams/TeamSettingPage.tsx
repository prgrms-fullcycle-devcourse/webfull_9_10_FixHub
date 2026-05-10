import { useState } from 'react';

import Toggle from '@/components/ui/Toogle';

export default function TeamSettingPage() {
  // TODO: 초기값은 기존 정보로
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');

  const rankingMembers = [
    {
      userId: 'aaaa-bbbb',
      name: '김지민',
      role: 'LEADER',
      score: 5421,
      joinedAt: '2025-05-12',
    },
    {
      userId: 'cccc-dddd',
      name: '한서영',
      role: 'Member',
      score: 21,
      joinedAt: '2025-07-11',
    },
    {
      userId: 'eeee-ffff',
      name: '고현우',
      role: 'Member',
      score: 92,
      joinedAt: '2025-07-21',
    },
    {
      userId: 'gggg-hhhh',
      name: '정하영',
      role: 'Member',
      score: 0,
      joinedAt: '2026-07-21',
    },
  ];

  return (
    <main className="p-[60px]">
      <div className="flex flex-col gap-[82px]">
        <div className="flex flex-col gap-[48px]">
          {/* 팀 정보 수정 */}
          <section className="bg-card rounded-lg p-10 flex flex-col gap-9">
            <div className="flex justify-between">
              <h1 className="typo-medium-40">팀 정보 수정</h1>
            </div>
            <div className="flex flex-col gap-8">
              {/* 팀 이름 */}
              <div className="flex flex-col gap-4">
                <label className="typo-regular-20">팀 이름</label>
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
              </div>
              {/* 팀 설명 */}
              <div className="flex flex-col gap-4">
                <label className="typo-regular-20">
                  팀 설명{' '}
                  <span className="text-[var(--text-muted)]">(선택)</span>
                </label>
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
              </div>
            </div>
          </section>

          {/* 팀원 목록 */}
          <section className="bg-card rounded-lg p-10">
            <div className="space-y-[39px]">
              <div className="flex justify-between items-center">
                <h2 className="typo-medium-40">멤버</h2>
              </div>

              <div className="space-y-[8px]">
                {rankingMembers.map((member) => (
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
