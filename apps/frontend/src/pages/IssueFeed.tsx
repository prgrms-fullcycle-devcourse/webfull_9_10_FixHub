import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PublicIssueItem {
  id: string;
  title: string;
  teamName: string;
  author: string;
  tags: string[];
  summary: string;
  commentCount: number;
  createdAt: string;
}

interface GetPublicIssuesResponse {
  meta: {
    totalItemCount: number;
    currentItemCount: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
  data: PublicIssueItem[];
}

function IssueFeed() {
  const navigate = useNavigate();

  const [issues, setIssues] = useState<PublicIssueItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const baseUrl = import.meta.env.VITE_API_BASE_URL;

        if (!baseUrl) {
          throw new Error('VITE_API_BASE_URL 값이 없습니다.');
        }

        const response = await fetch(
          `${baseUrl}/issues/public?page=${currentPage}&limit=10`,
          {
            credentials: 'include',
          },
        );

        if (!response.ok) {
          throw new Error(`최신 이슈 피드 조회 실패: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');

        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('JSON이 아닌 응답:', text);
          throw new Error('백엔드에서 JSON이 아닌 응답을 반환했습니다.');
        }

        const result: GetPublicIssuesResponse = await response.json();

        setIssues(result.data);
        setTotalPages(result.meta.totalPages);
      } catch (error) {
        console.error(error);
        setErrorMessage('최신 이슈 피드를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [currentPage]);

  return (
    <section className="w-full flex-1 px-[60px] pt-[60px] pb-[60px] text-(--text-primary)">
      <div className="flex flex-col gap-[60px]">
        <div>
          <h1 className="typo-medium-40">최신 이슈 피드</h1>

          <p className="mt-3 typo-regular-14 text-(--text-secondary)">
            모든 팀에 공개된 이슈를 확인하고, 함께 해결해보세요.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="cursor-pointer rounded-sm border border-border px-5 py-2 typo-regular-14 text-(--text-primary) hover:bg-(--surface-selected)"
              >
                상태⌃
              </button>

              <button
                type="button"
                className="cursor-pointer rounded-sm border border-border px-5 py-2 typo-regular-14 text-(--text-primary) hover:bg-(--surface-selected)"
              >
                상태⌃
              </button>

              <button
                type="button"
                className="cursor-pointer rounded-sm border border-border px-5 py-2 typo-regular-14 text-(--text-primary) hover:bg-(--surface-selected)"
              >
                언어 선택
              </button>
            </div>

            <button
              type="button"
              className="cursor-pointer rounded-sm border border-border px-5 py-2 typo-regular-14 text-(--text-primary) hover:bg-(--surface-selected)"
            >
              정렬⌃
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-sm bg-(--surface-tag) px-3 py-1.5 text-xs text-(--text-primary)">
              JavaScript ×
            </span>

            <span className="rounded-sm bg-(--surface-tag) px-3 py-1.5 text-xs text-(--text-primary)">
              Axios ×
            </span>

            <button
              type="button"
              className="cursor-pointer text-xs text-(--text-secondary) hover:text-(--text-primary)"
            >
              ↻ 초기화
            </button>
          </div>
        </div>

        {loading && (
          <div className="py-10 text-center typo-regular-14 text-(--text-secondary)">
            불러오는 중...
          </div>
        )}

        {errorMessage && (
          <div className="py-10 text-center typo-regular-14 text-red-500">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && (
          <div className="space-y-6">
            {issues.map((issue) => (
              <article
                key={issue.id}
                className="cursor-pointer rounded-lg bg-(--surface-panel) px-8 py-6 transition hover:bg-(--surface-selected)"
                onClick={() => {
                  navigate(`/issues/${issue.id}`);
                }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0 flex-1">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="rounded-full bg-(--status-unsaved) px-3 py-1 text-xs font-bold text-(--text-primary)">
                        미해결
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
                          className="rounded-sm bg-(--surface-tag) px-3 py-1.5 text-xs text-(--text-primary)"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex w-28 shrink-0 flex-col items-end gap-9 text-xs text-(--text-secondary)">
                    <div>답변 {issue.commentCount}</div>
                    <div>
                      {new Date(issue.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !errorMessage && totalPages > 0 && (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
              className="cursor-pointer rounded-sm border border-border px-3 py-2 text-sm text-(--text-secondary) hover:bg-(--surface-selected) disabled:cursor-not-allowed disabled:opacity-50"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 cursor-pointer rounded-sm border text-sm ${
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
              className="cursor-pointer rounded-sm bg-primary px-3 py-2 text-sm text-(--text-inverse) hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default IssueFeed;
