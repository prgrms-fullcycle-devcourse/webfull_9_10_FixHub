import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import SettingIcon from '@/assets/icons/setting.svg';
import LetterIcon from '@/assets/icons/letter.svg';
import ArrowIcon from '@/assets/icons/arrow.svg';
import { useGetTeamsTeamId, useGetTeamsTeamIdMembers } from '@/api/generated';

const mockIssues = Array.from({ length: 6 });

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [showAllMembers, setShowAllMembers] = useState(false);

  const {
    data: teamDetail,
    isLoading: isTeamDetailLoading,
    error: teamDetailError,
  } = useGetTeamsTeamId(teamId ?? '', {
    query: {
      enabled: Boolean(teamId),
    },
    request: {
      withCredentials: true,
    },
  });

  const {
    data: teamMembersResponse,
    isFetching: isTeamMembersFetching,
    refetch: refetchTeamMembers,
  } = useGetTeamsTeamIdMembers(teamId ?? '', {
    query: {
      enabled: false,
    },
    request: {
      withCredentials: true,
    },
  });

  const topMembers = teamDetail?.members ?? [];
  const fullMembers = teamMembersResponse?.data ?? [];

  const rankingMembers = showAllMembers ? fullMembers : topMembers;

  const handleClickShowAllMembers = async () => {
    if (!teamId) return;

    if (!showAllMembers && fullMembers.length === 0) {
      await refetchTeamMembers();
    }

    setShowAllMembers((prev) => !prev);
  };

  if (isTeamDetailLoading) {
    return (
      <main className="p-[60px]">
        <div className="flex flex-col gap-[82px]">
          <div className="flex flex-col gap-[48px] typo-medium-40">
            로딩 중...
          </div>
        </div>
      </main>
    );
  }

  if (teamDetailError) {
    console.error(teamDetailError);

    return (
      <main className="p-[60px]">
        <div className="flex flex-col gap-[82px]">
          <div className="flex flex-col gap-[48px] typo-medium-40">
            팀 정보를 불러오지 못했습니다.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-[60px]">
      <div className="flex flex-col gap-[82px]">
        <div className="flex flex-col gap-[48px]">
          {/* 팀 정보 */}
          <section className="bg-card rounded-lg p-10 flex flex-col gap-9">
            <div className="flex justify-between">
              <h1 className="typo-medium-40">{teamDetail?.name}</h1>
              <button className="flex gap-[10px] border border-white p-5 rounded-sm hover:bg-surface-selected transition">
                <SettingIcon className="w-6 h-6" />
                <span className="typo-bold-20 ">팀 설정</span>
              </button>
            </div>
            <p className="typo-regular-20">{teamDetail?.description}</p>
          </section>

          {/* 팀 랭킹 */}
          <motion.section
            layout
            transition={{
              layout: {
                duration: 0.35,
                ease: 'easeInOut',
              },
            }}
            className="bg-card rounded-lg p-10"
          >
            <div className="space-y-[39px]">
              <motion.div
                layout="position"
                className="flex justify-between items-center"
              >
                <h2 className="typo-medium-40">팀 랭킹</h2>

                <button
                  className="flex items-center gap-[10px] px-[32px] py-[18px] rounded-sm bg-primary 
                            cursor-pointer
                            hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  <LetterIcon className="w-8 h-8" />
                  <span className="text-primary-foreground typo-bold-20">
                    멤버 초대
                  </span>
                </button>
              </motion.div>

              <motion.div
                layout
                transition={{
                  layout: {
                    duration: 0.35,
                    ease: 'easeInOut',
                  },
                }}
                className="space-y-[8px]"
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {rankingMembers.map((member, idx) => (
                    <motion.div
                      key={member.userId}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      <RankingItem rank={idx + 1} {...member} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {topMembers.length >= 3 && (
                <motion.button
                  layout="position"
                  onClick={handleClickShowAllMembers}
                  disabled={isTeamMembersFetching}
                  className="flex items-center gap-4 cursor-pointer mx-auto w-fit"
                >
                  <span className="typo-regular-16">
                    {showAllMembers ? '팀원 간단 보기' : '팀원 전체 보기'}
                  </span>
                  <ArrowIcon
                    className={[
                      'w-[12px] h-[12px] transition-transform duration-300 ease-in-out',
                      showAllMembers ? 'rotate-0' : 'rotate-180',
                    ].join(' ')}
                  />
                </motion.button>
              )}
            </div>
          </motion.section>
        </div>
        <div>
          {/* 안내 문구 */}
          <p className="typo-regular-16 text-text-secondary">
            우리팀의 이슈를 확인하고, 함께 해결해보세요.
          </p>

          {/* 필터 바 */}
          <section className="flex justify-between items-center">
            <div className="flex gap-[12px] flex-wrap">
              <FilterButton label="상태" />
              <FilterButton label="상태" />
              <FilterButton label="언어 선택" />

              <Tag label="JavaScript" />
              <Tag label="Axios" />
              <Tag label="초기화" />
            </div>

            <FilterButton label="정렬" />
          </section>

          {/* 이슈 리스트 */}
          <section className="space-y-[16px]">
            {mockIssues.map((_, idx) => (
              <IssueCard key={idx} solved={idx !== 0} />
            ))}
          </section>

          {/* 페이지네이션 */}
          <section className="flex justify-center gap-[8px] pt-[16px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                className={`w-[32px] h-[32px] rounded-sm ${
                  n === 1 ? 'bg-primary text-black' : 'border border-border'
                }`}
              >
                {n}
              </button>
            ))}

            <button className="w-[32px] h-[32px] bg-primary text-black rounded-sm">
              {'>'}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

type RankingItemProps = {
  rank: number;
  name: string;
  role: string;
  score: number;
  isMe?: boolean;
};

function RankingItem({ rank, name, role, score, isMe }: RankingItemProps) {
  return (
    <div
      className={`flex items-center justify-between px-10 py-5 rounded-lg 
        ${rank === 1 ? 'border border-primary' : 'bg-surface-panel'}
      `}
    >
      <div className="flex items-center gap-[16px]">
        <span className="typo-medium-40 px-[20px] py-[10px]">{rank}</span>

        <div className="flex gap-10 items-center">
          <div className="flex gap-5 items-center">
            <div className="w-16 h-16 bg-gray-400 rounded-full" />
            <span className="typo-bold-20">
              {name}
              {isMe && ' (나)'}
            </span>
          </div>
          {role == 'LEADER' && (
            <span className="typo-regular-20 bg-[#544777] p-[10px] rounded-sm">
              팀장
            </span>
          )}
        </div>
      </div>

      <span className="typo-bold-20">{score.toLocaleString()}점</span>
    </div>
  );
}

function FilterButton({ label }: { label: string }) {
  return (
    <button className="border border-border px-[14px] py-[8px] rounded-sm typo-regular-14 flex items-center gap-[6px]">
      {label} <span>⌄</span>
    </button>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="bg-surface-tag px-[10px] py-[6px] rounded-sm text-sm">
      {label} ✕
    </span>
  );
}

function IssueCard({ solved }: { solved: boolean }) {
  return (
    <div className="bg-card p-[20px] rounded-md space-y-[10px]">
      {/* 상단 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-[8px]">
          <span
            className={`px-[8px] py-[4px] rounded-sm text-xs ${
              solved ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {solved ? '해결' : '미해결'}
          </span>

          <span className="typo-medium-16">
            로그인 시 간헐적으로 500에러 발생합니다 ㅠㅠ
          </span>
        </div>

        <span className="text-text-muted text-sm">답변 5 · 채택 1</span>
      </div>

      {/* 내용 */}
      <p className="text-text-muted text-sm">
        왜이러는지 모르겠는데 아니 이게 왜이래요 이유를 알려주세요 제발
        설명입니다 설명이에요 이거 이 글 설명입니다....
      </p>

      {/* 태그 */}
      <div className="flex gap-[8px]">
        <Tag label="HTML" />
        <Tag label="CSS" />
        <Tag label="Javascript" />
      </div>

      {/* 시간 */}
      <div className="text-right text-text-muted text-xs">이틀 전</div>
    </div>
  );
}
