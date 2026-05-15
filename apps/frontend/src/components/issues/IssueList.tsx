import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useGetIssuesSearch } from '@/api/generated';
import type { IssueSort, IssueStatus } from '@/types/issue';

type IssueListProps = {
  type?: 'public' | 'mine' | 'solved';
  status?: IssueStatus;
  tags?: string[];
  sort?: IssueSort;
  team?: string;
  authorId?: string;
};

export default function IssueList({
  type = 'public',
  status,
  tags = [],
  sort,
  team,
  authorId,
}: IssueListProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [prevSearchString, setPrevSearchString] = useState('');

  const searchString = useMemo(() => {
    const tokens: string[] = [];
    if (type === 'public') {
      searchParams.forEach((value, key) => {
        if (key === 'title') {
          tokens.push(value);
        } else {
          tokens.push(`${key}:${value}`);
        }
      });
    }
    if (status) tokens.push(`status:${status}`);
    tokens.push(...tags.map((tag) => `tag:${tag}`));
    if (sort) tokens.push(`sort:${sort}`);
    if (team) tokens.push(`teamId:${team}`);

    if (authorId) {
      if (type === 'solved') {
        tokens.push(`solvedBy:${authorId}`);
      } else {
        tokens.push(`authorId:${authorId}`);
      }
    }

    return tokens.join(' ');
  }, [searchParams, status, tags, sort, team, authorId, type]);

  if (prevSearchString !== searchString) {
    setPrevSearchString(searchString);
    setCurrentPage(1);
  }

  const querySearchString = `${searchString} page:${currentPage}`;

  const isQueryEnabled = type === 'public' || !!authorId;

  const { data, isPending, isError } = useGetIssuesSearch(
    { search: querySearchString },
    { query: { enabled: isQueryEnabled } },
  );

  if (isPending) {
    return (
      <div className="py-10 text-center typo-regular-14 text-(--text-secondary)">
        불러오는 중...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="py-10 text-center typo-regular-14 text-(--status-error)">
        이슈 목록을 불러오지 못했습니다.
      </div>
    );
  }

  const issues = data.data;
  const totalPages = data.meta.totalPages;

  if (issues.length === 0) {
    return (
      <div className="py-10 text-center typo-regular-14 text-(--text-secondary)">
        조회된 이슈가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-15">
        <div className="space-y-4">
          {issues.map((issue) => (
            <article
              key={issue.id}
              className="cursor-pointer rounded-lg bg-(--surface-panel) px-8 py-6 transition hover:bg-(--surface-selected)"
              onClick={() =>
                navigate(`/teams/${issue.teamId}/issues/${issue.id}`)
              }
            >
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <div className="mb-4 flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 typo-regular-14 font-bold text-white ${
                        issue.status === 'SOLVED'
                          ? 'bg-[var(--palette-solved-status)]'
                          : 'bg-[var(--palette-unsaved-status)]'
                      }`}
                    >
                      {issue.status === 'SOLVED' ? '해결' : '미해결'}
                    </span>
                    <h2 className="truncate typo-semibold-18 text-(--text-primary)">
                      {issue.title}
                    </h2>
                  </div>

                  {issue.summary.trim() && (
                    <p className="mb-4 truncate typo-regular-14 text-(--text-secondary)">
                      {issue.summary}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {issue.tag.map((tag) => (
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
                  <div>답변 {issue.commentCount}</div>
                  <div>
                    {new Date(issue.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 cursor-pointer rounded-sm border border-border typo-regular-14 text-(--text-secondary) hover:bg-(--surface-selected) disabled:cursor-not-allowed disabled:opacity-50"
          >
            ‹
          </button>

          {(() => {
            const WINDOW = 10;
            const half = Math.floor(WINDOW / 2);
            let start = Math.max(1, currentPage - half);
            let end = start + WINDOW - 1;
            if (end > totalPages) {
              end = totalPages;
              start = Math.max(1, end - WINDOW + 1);
            }
            const pages = [];
            if (start > 1) {
              pages.push(
                <button
                  key={1}
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  className="h-8 w-8 cursor-pointer rounded-sm border border-border typo-regular-14 text-(--text-primary) hover:bg-(--surface-selected)"
                >
                  1
                </button>,
              );
              if (start > 2)
                pages.push(
                  <span
                    key="start-ellipsis"
                    className="px-1 typo-regular-14 text-(--text-secondary)"
                  >
                    …
                  </span>,
                );
            }
            for (let p = start; p <= end; p++) {
              pages.push(
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`h-8 w-8 cursor-pointer rounded-sm border typo-regular-14 ${
                    currentPage === p
                      ? 'border-primary bg-primary text-(--text-inverse)'
                      : 'border-border text-(--text-primary) hover:bg-(--surface-selected)'
                  }`}
                >
                  {p}
                </button>,
              );
            }
            if (end < totalPages) {
              if (end < totalPages - 1)
                pages.push(
                  <span
                    key="end-ellipsis"
                    className="px-1 typo-regular-14 text-(--text-secondary)"
                  >
                    …
                  </span>,
                );
              pages.push(
                <button
                  key={totalPages}
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  className="h-8 w-8 cursor-pointer rounded-sm border border-border typo-regular-14 text-(--text-primary) hover:bg-(--surface-selected)"
                >
                  {totalPages}
                </button>,
              );
            }
            return pages;
          })()}

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
    </div>
  );
}
