import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useGetIssuesPublic,
  useGetMyIssues,
  useGetMySolved,
} from '@/api/generated';
import type { IssueSort, IssueStatus } from '@/types/issue';

type IssueListProps = {
  type?: 'public' | 'mine' | 'solved';
  status?: IssueStatus;
  tags?: string[];
  sort?: IssueSort;
  team?: string;
};

export default function IssueList({
  type = 'public',
  status: _status,
  tags = [],
  sort,
  team: _team,
}: IssueListProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  // 1. 공용 피드 (팀 페이지 등)
  const publicRes = useGetIssuesPublic(
    { page: currentPage, limit: 20 },
    { query: { enabled: type === 'public' } },
  );

  // 2. 마이페이지 - 내가 작성한 이슈
  const mineRes = useGetMyIssues(
    { page: currentPage, limit: 10 },
    { query: { enabled: type === 'mine' } },
  );

  // 3. 마이페이지 - 내가 해결한 이슈
  const solvedRes = useGetMySolved(
    { page: currentPage, limit: 10 },
    { query: { enabled: type === 'solved' } },
  );

  const currentQuery =
    type === 'public' ? publicRes : type === 'mine' ? mineRes : solvedRes;
  const { data, isPending, isError } = currentQuery;

  const issues = useMemo(() => {
    if (!data) return [];

    let visibleIssues = [...data.data];

    if (tags.length > 0) {
      visibleIssues = visibleIssues.filter((issue) =>
        tags.every((tag) => issue.tags.includes(tag)),
      );
    }

    if (sort === 'oldest') {
      visibleIssues.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    } else if (sort === 'latest') {
      visibleIssues.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return visibleIssues;
  }, [data, tags, sort]);

  if (isPending || !data) {
    return (
      <div className="py-10 text-center typo-regular-14 text-(--text-secondary)">
        불러오는 중...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-10 text-center typo-regular-14 text-(--status-error)">
        이슈 목록을 불러오지 못했습니다.
      </div>
    );
  }

  const totalPages = data.meta.totalPages;

  if (issues.length === 0) {
    return (
      <div className="py-10 text-center typo-regular-14 text-(--text-secondary)">
        공개된 이슈가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {issues.map((issue) => (
          <article
            key={issue.id}
            className="cursor-pointer rounded-[20px] bg-(--surface-panel) px-7 py-7 transition hover:bg-(--surface-selected)"
            onClick={() =>
              navigate(`/teams/${issue.teamId}/issues/${issue.id}`)
            }
          >
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0 flex-1">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 typo-regular-14 ${
                      'status' in issue && issue.status === 'SOLVED'
                        ? 'bg-[var(--palette-solved-status)] text-white'
                        : 'bg-[var(--palette-unsaved-status)] text-white'
                    }`}
                  >
                    {'status' in issue && issue.status === 'SOLVED'
                      ? '해결'
                      : '미해결'}
                  </span>
                  <h2 className="truncate typo-semibold-18 text-(--text-primary)">
                    {issue.title}
                  </h2>
                </div>

                <p className="mb-4 truncate typo-regular-14 text-(--text-secondary)">
                  {issue.summary}
                </p>

                <div className="flex flex-wrap gap-2">
                  {issue.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-sm bg-(--surface-tag) px-3 py-1.5 typo-regular-14 text-(--text-primary)"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-6 typo-regular-14 text-(--text-secondary)">
                <div className="flex items-center gap-4">
                  <span>답변 {issue.commentCount}</span>
                </div>
                <div>
                  {new Date(issue.createdAt).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 pt-6">
        <button
          type="button"
          onClick={() => setCurrentPage((prev) => prev - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 cursor-pointer rounded-sm border border-border typo-regular-14 text-(--text-secondary) hover:bg-(--surface-selected) disabled:cursor-not-allowed disabled:opacity-50"
        >
          ‹
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`h-8 w-8 cursor-pointer rounded-sm border typo-regular-14 ${
                currentPage === page
                  ? 'border-primary bg-primary text-(--text-inverse)'
                  : 'border-border text-(--text-primary) hover:bg-(--surface-selected)'
              }`}
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 cursor-pointer rounded-sm bg-primary typo-regular-14 text-(--text-inverse) hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ›
        </button>
      </div>
    </div>
  );
}
