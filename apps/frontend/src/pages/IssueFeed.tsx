import { useState } from 'react';

import IssueFeedFilterBar from '@/components/issues/IssueFeedFilterBar';
import LanguageSelectModal from '@/components/issues/LanguageSelectModal';
import type { IssueSort, IssueStatusFilter } from '@/types/issue';
import IssueList from '@/components/issues/IssueList';

function IssueFeed() {
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

  return (
    <>
      <section className="w-full flex-1 px-15 pt-15 pb-15 text-(--text-primary)">
        <div className="flex flex-col gap-15">
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

          <IssueList />
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
