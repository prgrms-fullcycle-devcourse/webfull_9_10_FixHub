import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useGetIssuesSearch } from '@/api/generated';
import type { IssueSort, IssueStatus } from '@/types/issue';

type IssueListProps = {
  status?: IssueStatus;
  tags?: string[];
  sort?: IssueSort;
  team?: string;
};

export default function IssueList({
  status,
  tags = [],
  sort,
  team,
}: IssueListProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [prevSearchString, setPrevSearchString] = useState('');

  const searchString = useMemo(() => {
    const tokens: string[] = [];
    searchParams.forEach((value, key) => {
      if (key === 'title') {
        tokens.push(value);
      } else {
        tokens.push(`${key}:${value}`);
      }
    });
    if (status) tokens.push(`status:${status}`);
    tokens.push(...tags.map((tag) => `tag:${tag}`));
    if (sort) tokens.push(`sort:${sort}`);
    if (team) tokens.push(`teamId:${team}`);
    return tokens.join(' ');
  }, [searchParams, status, tags, sort, team]);

  if (prevSearchString !== searchString) {
    setPrevSearchString(searchString);
    setCurrentPage(1);
  }

  const querySearchString = `${searchString} page:${currentPage}`;

  const { data, isPending, isError } = useGetIssuesSearch({
    search: querySearchString,
  });

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
        검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-15">
        {
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
                      <span className="rounded-full bg-(--status-unsaved) px-3 py-1 typo-regular-14 font-bold text-(--text-primary)">
                        {issue.status === 'SOLVED' ? '해결' : '미해결'}
                      </span>

                      <h2 className="truncate typo-semibold-18 text-(--text-primary)">
                        {issue.title}
                      </h2>
                    </div>

                    <div className="mb-4 truncate typo-regular-14 text-(--text-secondary)">
                      {issue.summary ? issue.summary : '요약 정보가 없습니다.'}
                    </div>

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
        }

        {
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
              className="cursor-pointer rounded-sm border border-border typo-regular-14 text-(--text-secondary) hover:bg-(--surface-selected) disabled:cursor-not-allowed disabled:opacity-50"
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
        }
      </div>
    </div>
  );
}
