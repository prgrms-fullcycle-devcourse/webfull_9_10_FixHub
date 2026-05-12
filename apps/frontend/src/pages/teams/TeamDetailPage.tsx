import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import SettingIcon from '@/assets/icons/setting.svg';
import LetterIcon from '@/assets/icons/letter.svg';
import ArrowIcon from '@/assets/icons/arrow.svg';
import { useGetTeamsTeamId, useGetTeamsTeamIdMembers } from '@/api/generated';
import IssueList from '@/components/issues/IssueList';
import LanguageSelectModal from '@/components/issues/LanguageSelectModal';
import IssueFeedFilterBar from '@/components/issues/IssueFeedFilterBar';
import type { IssueSort, IssueStatusFilter } from '@/types/issue';

export default function TeamDetailPage() {
  const navigate = useNavigate();

  const { teamId } = useParams<{ teamId: string }>();
  const [showAllMembers, setShowAllMembers] = useState(false);

  const [selectedStatus, setSelectedStatus] =
    useState<IssueStatusFilter>('ALL');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [sort, setSort] = useState<IssueSort>('latest');
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const handleToggleLanguage = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((item) => item !== language)
        : [...prev, language],
    );
  };

  const handleReset = () => {
    setSelectedStatus('ALL');
    setSelectedLanguages([]);
    setSort('latest');
  };

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
              <button
                onClick={() => navigate(`/teams/${teamId}/settings`)}
                className="
                  flex gap-[10px] border border-white p-5 rounded-sm 
                  cursor-pointer
                  hover:bg-(--surface-selected)"
              >
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
        <>
          <section className="w-full flex-1 px-15 pt-15 pb-15 text-(--text-primary)">
            <div className="flex flex-col gap-15">
              <div>
                <p className="mt-3 typo-regular-20">
                  우리 팀의 이슈를 확인하고, 함께 해결해보세요.
                </p>
              </div>

              <IssueFeedFilterBar
                selectedStatus={selectedStatus}
                selectedLanguages={selectedLanguages}
                sort={sort}
                onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
                onChangeStatus={setSelectedStatus}
                onChangeSort={setSort}
                onRemoveLanguage={handleToggleLanguage}
                onReset={handleReset}
              />

              <IssueList
                status={selectedStatus === 'ALL' ? undefined : selectedStatus}
                tags={selectedLanguages}
                sort={sort}
                team={teamId}
              />
            </div>
          </section>

          <LanguageSelectModal
            isOpen={isLanguageModalOpen}
            selectedLanguages={selectedLanguages}
            onClose={() => setIsLanguageModalOpen(false)}
            onToggleLanguage={handleToggleLanguage}
          />
        </>
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
            <span className="typo-regular-20 bg-[var(--color-gray-600)] p-[10px] rounded-sm">
              팀장
            </span>
          )}
        </div>
      </div>

      <span className="typo-bold-20">{score.toLocaleString()}점</span>
    </div>
  );
}
