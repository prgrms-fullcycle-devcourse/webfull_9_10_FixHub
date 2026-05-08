import { useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import ActivityHeatmap from '@/components/users/ActivityHeatmap';
import EditProfileModal from '@/components/users/EditProfileModal';
import IssueList from '@/components/issues/IssueList';

import {
  useGetMyProfile,
  useGetMyScore,
  useGetMyScoreLogs,
  getGetMyProfileQueryKey,
} from '@/api/generated';
import type { GetMyScoreLogs200DataItem } from '@/api/generated';

import ScoreIcon from '@/assets/icons/score.svg';
import WriteIcon from '@/assets/icons/write.svg';
import SolvedIcon from '@/assets/icons/solve.svg';
import Setting from '@/assets/icons/setting.svg';

// 점수 정책: reason 코드 → 한글 + 점수
const SCORE_POLICY: Record<string, { label: string; points: number }> = {
  COMMENT_ADOPTED: { label: '댓글 채택', points: 10 },
  ISSUE_CREATED: { label: '이슈글 작성', points: 3 },
  COMMENT_CREATED: { label: '댓글 작성', points: 1 },
};

type Tab = 'score' | 'myIssues' | 'solvedIssues';

function formatScoreDate(isoStr: string) {
  const d = new Date(isoStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}(${days[d.getDay()]})`;
}

function ScoreLogItem({ log }: { log: GetMyScoreLogs200DataItem }) {
  const policy = SCORE_POLICY[log.reason];
  return (
    <div className="flex items-center justify-between bg-block-color rounded-lg p-[40px]">
      <div className="flex items-center gap-3 min-w-0">
        <span className="typo-bold-20 shrink-0">
          {policy?.label ?? log.reason}
        </span>
        {log.issueTitle && (
          <span className="typo-regular-20 text-foreground truncate">
            {log.issueTitle}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4 shrink-0 ml-4">
        <span className="typo-regular-20 text-muted-foreground whitespace-nowrap">
          {formatScoreDate(log.createdAt)}
        </span>
        <span className="bg-success typo-medium-40 px-[8px] py-[6px] rounded-[12px]">
          + {log.amount}
        </span>
      </div>
    </div>
  );
}

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<Tab>('score');
  const [scorePage, setScorePage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: profile,
    isPending: profileLoading,
    isError: profileError,
  } = useGetMyProfile();

  const { data: scoreData } = useGetMyScore(undefined, {
    query: { enabled: activeTab === 'score' },
  });

  const { data: scoreLogs, isPending: scoreLogsLoading } = useGetMyScoreLogs(
    { page: scorePage, limit: 10 },
    { query: { enabled: activeTab === 'score' } },
  );

  const heatmapValues =
    scoreData?.daily.map((d) => ({ date: d.date, count: d.totalAmount })) ?? [];

  const tabs: { key: Tab; label: string; count: number; icon: ReactNode }[] = [
    {
      key: 'score',
      label: '누적 점수',
      count: profile?.totalScore ?? 0,
      icon: <ScoreIcon />,
    },
    {
      key: 'myIssues',
      label: '내가 작성한 이슈',
      count: profile?.issueCount ?? 0,
      icon: <WriteIcon />,
    },
    {
      key: 'solvedIssues',
      label: '내가 해결한 이슈',
      count: profile?.solvedCount ?? 0,
      icon: <SolvedIcon />,
    },
  ];

  if (profileLoading) {
    return (
      <section className="w-full px-[60px] pt-[60px] text-foreground">
        <h1 className="typo-medium-40">마이페이지</h1>
        <p className="mt-10 text-center typo-regular-20 text-white/50">
          불러오는 중...
        </p>
      </section>
    );
  }

  if (profileError || !profile) {
    return (
      <section className="w-full px-[60px] pt-[60px] text-foreground">
        <h1 className="typo-medium-40">마이페이지</h1>
        <p className="mt-10 text-center typo-regular-20 text-red-400">
          프로필을 불러오지 못했습니다.
        </p>
      </section>
    );
  }

  const totalScorePages = scoreLogs?.meta.totalPages ?? 1;

  return (
    <section className="w-full px-[60px] pt-[60px] flex flex-col gap-8 text-foreground">
      <h1 className="typo-medium-40">마이페이지</h1>

      {/* ── 프로필 카드 ── */}
      <div className="bg-block-color rounded-lg p-[40px] flex items-center gap-6">
        <div className="w-[120px] h-[120px] rounded-full bg-input-background overflow-hidden shrink-0">
          {profile.profileImg && (
            <img
              src={profile.profileImg}
              alt="프로필"
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex-1 flex flex-col gap-[36px]">
          <div className="flex items-center justify-between">
            <h2 className="typo-medium-40 text-foreground">{profile.name}</h2>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-[16px] px-[20px] py-[20px] rounded-[8px] border border-white typo-regular-20 cursor-pointer hover:bg-white/5 transition"
            >
              <Setting className="w-[24px] h-[24px]" />
              프로필 수정
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="typo-regular-20 text-secondary-foreground">
              {profile.email}
            </p>
            <p className="typo-regular-20 text-muted-foreground">
              {profile.createdAt} 가입
            </p>
          </div>
        </div>
      </div>

      {/* ── 활동 기록 (히트맵) ── */}
      <div className="bg-block-color rounded-lg p-[40px] flex flex-col gap-[36px]">
        <h3 className="typo-bold-20">활동 기록</h3>
        <ActivityHeatmap values={heatmapValues} />
      </div>

      {/* ── 통계 탭 ── */}
      <div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-md p-[40px] text-center cursor-pointer transition
                ${
                  activeTab === tab.key
                    ? 'bg-block-color border border-border shadow-[var(--shadow)]'
                    : 'bg-block-color hover:bg-white/5'
                }`}
            >
              <span className="flex size-[42px] items-center justify-center mx-auto mb-[16px] [&_svg]:size-[42px] [&_svg]:fill-current">
                {tab.icon}
              </span>
              <p className="typo-bold-20 mb-[16px]">{tab.label}</p>
              <p className="typo-medium-40 text-foreground mt-1">
                {tab.count.toLocaleString()}
                <span className="typo-regular-20 ml-1">
                  {tab.key === 'score' ? '점' : '건'}
                </span>
              </p>
            </button>
          ))}
        </div>

        <div className="bg-block-color/50 rounded-lg p-[40px] shadow-[var(--shadow)]">
          {/* ── 점수 획득 목록 ── */}
          {activeTab === 'score' && (
            <>
              <h3 className="typo-bold-20 mb-[24px]">점수 획득 목록</h3>

              {/* 점수 정책 안내 배지 */}
              <div className="flex gap-3 mb-[36px]">
                {Object.values(SCORE_POLICY).map(({ label, points }) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/20 px-4 py-1.5 typo-regular-14 text-white/60"
                  >
                    {label}{' '}
                    <span className="text-[#fff835] font-medium">
                      +{points}
                    </span>
                  </span>
                ))}
              </div>

              {scoreLogsLoading ? (
                <p className="py-10 text-center typo-regular-14 text-white/50">
                  불러오는 중...
                </p>
              ) : !scoreLogs?.data.length ? (
                <p className="py-10 text-center typo-regular-14 text-white/50">
                  점수 기록이 없습니다.
                </p>
              ) : (
                <>
                  <div className="flex flex-col gap-[24px]">
                    {scoreLogs.data.map((log) => (
                      <ScoreLogItem key={log.id} log={log} />
                    ))}
                  </div>

                  {totalScorePages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-6">
                      <button
                        type="button"
                        onClick={() => setScorePage((p) => p - 1)}
                        disabled={scorePage === 1}
                        className="h-8 w-8 cursor-pointer rounded-sm border border-border typo-regular-14 text-(--text-secondary) hover:bg-(--surface-selected) disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ‹
                      </button>
                      {Array.from(
                        { length: totalScorePages },
                        (_, i) => i + 1,
                      ).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setScorePage(p)}
                          className={`h-8 w-8 cursor-pointer rounded-sm border typo-regular-14 ${
                            scorePage === p
                              ? 'border-primary bg-primary text-(--text-inverse)'
                              : 'border-border text-(--text-primary) hover:bg-(--surface-selected)'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setScorePage((p) => p + 1)}
                        disabled={scorePage === totalScorePages}
                        className="h-8 w-8 cursor-pointer rounded-sm bg-primary typo-regular-14 text-(--text-inverse) hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {activeTab === 'myIssues' && <IssueList type="mine" />}

          {activeTab === 'solvedIssues' && <IssueList type="solved" />}
        </div>
      </div>

      {/* ── 프로필 수정 모달 ── */}
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          profile={profile}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={() => {
            queryClient.invalidateQueries({
              queryKey: getGetMyProfileQueryKey(),
            });
          }}
        />
      )}
    </section>
  );
}
