import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getPublicIssues, type PublicIssueItem } from '@/api/issues';
import IssueFeedFilterBar from '@/components/issues/IssueFeedFilterBar';
import LanguageSelectModal from '@/components/issues/LanguageSelectModal';
import type { IssueSort, IssueStatusFilter } from '@/types/issue';

function IssueFeed() {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] =
    useState<IssueStatusFilter>('ALL');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [sort, setSort] = useState<IssueSort>('latest');
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const { data, isPending, isError } = useQuery({
    queryKey: ['publicIssues', currentPage],
    queryFn: () => getPublicIssues(currentPage, 10),
  });

  const totalPages = data?.meta.totalPages ?? 1;
  const issues = data?.data ?? [];

  const filteredIssues = useMemo(() => {
    let nextIssues = [...issues];

    if (selectedStatus !== 'ALL') {
      nextIssues = nextIssues.filter(
        (issue) => (issue.status ?? 'UNSOLVED') === selectedStatus,
      );
    }

    if (selectedLanguages.length > 0) {
      nextIssues = nextIssues.filter((issue) =>
        selectedLanguages.some((language) =>
          issue.tags.map((tag) => tag.toLowerCase()).includes(language),
        ),
      );
    }

    nextIssues.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();

      return sort === 'latest' ? bTime - aTime : aTime - bTime;
    });

    return nextIssues;
  }, [issues, selectedStatus, selectedLanguages, sort]);

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

  return (
    <>
      <section className="w-full flex-1 px-[60px] pt-[60px] pb-[60px] text-(--text-primary)">
        <div className="flex flex-col gap-[60px]">
          <div>
            <h1 className="typo-medium-40">최신 이슈 피드</h1>

            <p className="mt-3 typo-regular-14 text-(--text-secondary)">
              모든 팀에 공개된 이슈를 확인하고, 함께 해결해보세요.
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

          {isPending && (
            <div className="py-10 text-center typo-regular-14 text-(--text-secondary)">
              불러오는 중...
            </div>
          )}

          {isError && (
            <div className="py-10 text-center typo-regular-14 text-red-500">
              최신 이슈 피드를 불러오지 못했습니다.
            </div>
          )}

          {!isPending && !isError && (
            <div className="space-y-6">
              {filteredIssues.map((issue: PublicIssueItem) => (
                <article
                  key={issue.id}
                  className="cursor-pointer rounded-lg bg-(--surface-panel) px-8 py-6 transition hover:bg-(--surface-selected)"
                  onClick={() => navigate(`/issues/${issue.id}`)}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0 flex-1">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="rounded-full bg-(--status-unsaved) px-3 py-1 text-xs font-bold text-(--text-primary)">
                          {(issue.status ?? 'UNSOLVED') === 'SOLVED'
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

          {!isPending && !isError && totalPages > 0 && (
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

      <LanguageSelectModal
        isOpen={isLanguageModalOpen}
        selectedLanguages={selectedLanguages}
        onClose={() => setIsLanguageModalOpen(false)}
        onToggleLanguage={handleToggleLanguage}
      />
    </>
  );
}

export default IssueFeed;
