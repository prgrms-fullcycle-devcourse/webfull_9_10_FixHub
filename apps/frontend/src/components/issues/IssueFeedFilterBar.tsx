import { useState } from 'react';
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
  const [isStatusFocused, setIsStatusFocused] = useState(false);
  const [isSortFocused, setIsSortFocused] = useState(false);
  const [isSortTouched, setIsSortTouched] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={selectedStatus}
              onFocus={() => setIsStatusFocused(true)}
              onBlur={() => setIsStatusFocused(false)}
              onChange={(e) =>
                onChangeStatus(e.target.value as IssueStatusFilter)
              }
              className={[
                'h-12 min-w-[104px] cursor-pointer appearance-none rounded-sm pl-5 pr-10 typo-regular-14 outline-none transition-all duration-300',
                isStatusFocused
                  ? 'shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                  : '',
              ].join(' ')}
              style={{
                background: 'var(--surface-panel)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="ALL" hidden>
                상태
              </option>
              <option
                value="UNSOLVED"
                className="bg-(--surface-panel) text-(--text-primary)"
              >
                미해결
              </option>
              <option
                value="SOLVED"
                className="bg-(--surface-panel) text-(--text-primary)"
              >
                해결
              </option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-(--text-primary)"
            />
          </div>

          <button
            type="button"
            onClick={onOpenLanguageModal}
            className="h-12 cursor-pointer rounded-sm border border-border bg-(--surface-panel) px-5 typo-regular-14 text-(--text-primary) hover:bg-(--surface-selected)"
          >
            언어 선택
          </button>
        </div>

        <div className="relative">
          <select
            value={sort}
            onFocus={() => setIsSortFocused(true)}
            onBlur={() => setIsSortFocused(false)}
            onChange={(e) => {
              setIsSortTouched(true);
              onChangeSort(e.target.value as IssueSort);
            }}
            className={[
              'h-12 min-w-[112px] cursor-pointer appearance-none rounded-sm pl-5 pr-10 typo-regular-14 outline-none transition-all duration-300',
              isSortFocused || isSortTouched
                ? 'shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                : '',
            ].join(' ')}
            style={{
              background: 'var(--surface-panel)',
              color: 'var(--text-primary)',
            }}
          >
            <option
              value="latest"
              className="bg-(--surface-panel) text-(--text-primary)"
            >
              최신순
            </option>
            <option
              value="oldest"
              className="bg-(--surface-panel) text-(--text-primary)"
            >
              오래된순
            </option>
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-(--text-primary)"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {selectedLanguages.map((language) => (
          <button
            key={language}
            type="button"
            onClick={() => onRemoveLanguage(language)}
            className="rounded-sm bg-(--surface-tag) px-3 py-1.5 typo-regular-14 text-(--text-primary)"
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
            className="cursor-pointer typo-regular-14 text-(--text-secondary) hover:text-(--text-primary)"
          >
            ↻ 초기화
          </button>
        )}
      </div>
    </div>
  );
}

export default IssueFeedFilterBar;
