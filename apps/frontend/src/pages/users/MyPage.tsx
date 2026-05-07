import { useState, type ReactNode } from 'react';

import ActivityHeatmap from '../../components/users/ActivityHeatmap';

import ScoreIcon from '@/assets/icons/score.svg';
import WriteIcon from '@/assets/icons/write.svg';
import SolvedIcon from '@/assets/icons/solve.svg';
import Setting from '@/assets/icons/setting.svg';

// 임시 mock 데이터 (API 연결 시 교체)
const MOCK_USER = {
  name: '김이름',
  email: 'testemail@email.com',
  profileImg: '',
  joinedAt: '2026.05.06',
  totalScore: 1240,
  issueCount: 17,
  solvedCount: 42,
};

// 히트맵용: 최근 1년 날짜별 활동 횟수
const MOCK_HEATMAP = Array.from({ length: 80 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - i * 4);
  return {
    date: d.toISOString().split('T')[0],
    count: Math.floor(Math.random() * 8),
  };
});

// 점수 획득 목록 (누적점수 탭)
const MOCK_SCORE_LOGS = Array.from({ length: 9 }, (_, i) => ({
  id: String(i),
  reason: '댓글 채택',
  title: '로그인 시 간헐적으로 500에러가 발생합니다 ㅜㅜ',
  score: 5,
  date: '2026-05-01(금)',
}));

type Tab = 'score' | 'myIssues' | 'solvedIssues';

const tabs: { key: Tab; label: string; count: number; icon: ReactNode }[] = [
  {
    key: 'score',
    label: '누적 점수',
    count: MOCK_USER.totalScore,
    icon: <ScoreIcon />,
  },
  {
    key: 'myIssues',
    label: '내가 작성한 이슈',
    count: MOCK_USER.issueCount,
    icon: <WriteIcon />,
  },
  {
    key: 'solvedIssues',
    label: '내가 해결한 이슈',
    count: MOCK_USER.solvedCount,
    icon: <SolvedIcon />,
  },
];

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<Tab>('score');

  return (
    <section className="w-full px-[60px] pt-[60px] flex flex-col gap-8 text-foreground">
      <h1 className="typo-medium-40">마이페이지</h1>

      {/* ── 프로필 카드 ── */}
      <div className="bg-block-color rounded-lg p-[40px] flex items-center gap-6">
        <div className="w-[120px] h-[120px] rounded-full bg-input-background overflow-hidden shrink-0">
          {MOCK_USER.profileImg && (
            <img
              src={MOCK_USER.profileImg}
              alt="프로필"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* 이름 + (이메일 / 가입일) */}
        <div className="flex-1 flex flex-col gap-[36px]">
          <div className="flex items-center justify-between">
            <h2 className="typo-medium-40 text-foreground">{MOCK_USER.name}</h2>
            <button
              className="flex items-center gap-[16px] px-[20px] py-[20px] rounded-[8px]
                border border-white 
                typo-regular-20 cursor-pointer"
            >
              <Setting className="w-[24px] h-[24px]" />
              프로필 수정
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="typo-regular-20 text-secondary-foreground">
              {MOCK_USER.email}
            </p>
            <p className="typo-regular-20 text-muted-foreground">
              {MOCK_USER.joinedAt} 가입
            </p>
          </div>
        </div>
      </div>

      {/* ── 활동 기록 (히트맵) ── */}
      <div className="bg-block-color rounded-lg p-[40px] flex flex-col gap-[36px]">
        <h3 className="typo-bold-20">활동 기록</h3>
        <ActivityHeatmap values={MOCK_HEATMAP} />
      </div>

      {/* ── 통계 탭 ── */}
      <div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-md p-[40px] text-center cursor-pointer
                ${
                  activeTab === tab.key
                    ? 'bg-block-color border border-border shadow-[var(--shadow)]'
                    : 'bg-block-color'
                }`}
            >
              <span className="flex size-[42px] items-center justify-center mx-auto mb-[16px] [&_svg]:size-[42px] [&_svg]:fill-current">
                {tab.icon}
              </span>
              <p className="typo-bold-20 mb-[16px]">{tab.label}</p>
              <p className="typo-medium-40 text-foreground mt-1">
                {tab.count.toLocaleString()}
                <span className="typo-regular-20 ml-1 ">
                  {tab.key === 'score' ? '점' : '건'}
                </span>
              </p>
            </button>
          ))}
        </div>

        <div className="bg-block-color/50 rounded-lg p-[40px] shadow-[var(--shadow)]">
          {activeTab === 'score' && (
            <>
              <h3 className="typo-bold-20 mb-[36px]">점수 획득 목록</h3>
              <div className="flex flex-col gap-[24px]">
                {MOCK_SCORE_LOGS.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between
                      bg-block-color rounded-lg p-[40px]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="typo-bold-20">{log.reason}</span>
                      <span className="typo-regular-20 text-foreground truncate">
                        {log.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 ml-4">
                      <span className="typo-regular-20 text-muted-foreground whitespace-nowrap">
                        {log.date}
                      </span>
                      <span className="bg-success typo-medium-40 px-[8px] py-[6px] rounded-[12px]">
                        + {log.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'myIssues' && (
            <h3 className="typo-bold-20 text-foreground">
              내가 작성한 이슈 목록
            </h3>
          )}

          {activeTab === 'solvedIssues' && (
            <h3 className="typo-bold-20 text-foreground">
              내가 해결한 이슈 목록
            </h3>
          )}
        </div>
      </div>
    </section>
  );
}
