import { useMemo, useState } from 'react';

interface LanguageSelectModalProps {
  isOpen: boolean;
  selectedLanguages: string[];
  onClose: () => void;
  onToggleLanguage: (language: string) => void;
}

const languageOptions = [
  'python',
  'javascript',
  'c#',
  'reactjs',
  'java',
  'android',
  'html',
  'flutter',
  'c++',
  'node.js',
  'typescript',
  'css',
  'r',
  'php',
  'angular',
  'next.js',
  'spring-boot',
  'machine-learning',
  'sql',
  'excel',
  'ios',
  'azure',
  'docker',
];

function LanguageSelectModal({
  isOpen,
  selectedLanguages,
  onClose,
  onToggleLanguage,
}: LanguageSelectModalProps) {
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredLanguages = useMemo(() => {
    if (!searchKeyword.trim()) {
      return languageOptions;
    }

    return languageOptions.filter((language) =>
      language.toLowerCase().includes(searchKeyword.toLowerCase()),
    );
  }, [searchKeyword]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--surface-overlay) px-4">
      <div className="w-full max-w-105 rounded-[16px] border border-border bg-(--surface-panel) p-6 text-(--text-primary) shadow-(--shadow)">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="typo-medium-40 text-(--text-primary)">언어 선택</h2>
            <p className="mt-3 typo-regular-14 text-(--text-secondary)">
              관심 있는 언어/기술 태그를 선택하세요.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-sm typo-medium-16 text-(--text-secondary) hover:bg-(--surface-selected) hover:text-(--text-primary)"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <p className="mb-3 typo-medium-16 text-(--text-primary)">검색</p>

          <input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="검색"
            className="h-12 w-full rounded-sm border border-border bg-(--surface-input) px-4 typo-regular-14 text-(--text-primary) outline-none placeholder:text-(--text-muted)"
          />
        </div>

        <div className="mb-6 flex max-h-[240px] flex-wrap gap-2 overflow-y-auto">
          {filteredLanguages.map((language) => {
            const isSelected = selectedLanguages.includes(language);

            return (
              <button
                key={language}
                type="button"
                onClick={() => onToggleLanguage(language)}
                className={`cursor-pointer rounded-sm px-3 py-2 typo-regular-14 transition ${
                  isSelected
                    ? 'bg-primary text-(--text-inverse)'
                    : 'bg-(--surface-tag) text-(--text-primary) hover:bg-(--surface-selected)'
                }`}
              >
                {language}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="h-12 w-full cursor-pointer rounded-sm bg-primary typo-medium-16 text-(--text-inverse) hover:opacity-90"
        >
          완료
        </button>
      </div>
    </div>
  );
}

export default LanguageSelectModal;
