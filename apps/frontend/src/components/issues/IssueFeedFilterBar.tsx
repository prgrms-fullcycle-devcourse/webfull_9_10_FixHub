import { ChevronDown } from 'lucide-react';

import type { IssueSort, IssueStatusFilter } from '@/types/issue';

interface IssueFeedFilterBarProps {
  selectedStatus: IssueStatusFilter;
  selectedLanguages: string[];
  sort: IssueSort;
  onOpenLanguageModal: () => void;
  onChangeStatus: (status: IssueStatusFilter) => void;
  onChangeSort: (sort: IssueSort) => void;
  onRemoveLanguage: (language: string) => void;
  onReset: () => void;
}

function IssueFeedFilterBar({
  selectedStatus,
  selectedLanguages,
  sort,
  onOpenLanguageModal,
  onChangeStatus,
  onChangeSort,
  onRemoveLanguage,
  onReset,
}: IssueFeedFilterBarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) =>
                onChangeStatus(e.target.value as IssueStatusFilter)
              }
              className="h-12 min-w-[104px] cursor-pointer appearance-none rounded-sm border border-border bg-(--surface-panel) pl-5 pr-10 typo-regular-14 text-white outline-none"
            >
              <option value="ALL" hidden>
                상태
              </option>
              <option value="UNSOLVED" className="bg-white text-black">
                미해결
              </option>
              <option value="SOLVED" className="bg-white text-black">
                해결
              </option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-white"
            />
          </div>

          <button
            type="button"
            onClick={onOpenLanguageModal}
            className="h-12 cursor-pointer rounded-sm border border-border px-5 typo-regular-14 text-(--text-primary) hover:bg-(--surface-selected)"
          >
            언어 선택
          </button>
        </div>

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => onChangeSort(e.target.value as IssueSort)}
            className="h-12 min-w-[112px] cursor-pointer appearance-none rounded-sm border border-border bg-(--surface-panel) pl-5 pr-10 typo-regular-14 text-white outline-none"
          >
            <option value="latest" className="bg-white text-black">
              최신순
            </option>
            <option value="oldest" className="bg-white text-black">
              오래된순
            </option>
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-white"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {selectedLanguages.map((language) => (
          <button
            key={language}
            type="button"
            onClick={() => onRemoveLanguage(language)}
            className="rounded-sm bg-(--surface-tag) px-3 py-1.5 text-xs text-(--text-primary)"
          >
            {language} ×
          </button>
        ))}

        {(selectedStatus !== 'ALL' ||
          selectedLanguages.length > 0 ||
          sort !== 'latest') && (
          <button
            type="button"
            onClick={onReset}
            className="cursor-pointer text-xs text-(--text-secondary) hover:text-(--text-primary)"
          >
            ↻ 초기화
          </button>
        )}
      </div>
    </div>
  );
}

export default IssueFeedFilterBar;
