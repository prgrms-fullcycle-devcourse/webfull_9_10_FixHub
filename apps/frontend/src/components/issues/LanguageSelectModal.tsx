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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 text-black shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">언어 선택</h2>
            <p className="mt-2 text-sm text-gray-600">
              관심 있는 언어/기술 태그를 선택하세요.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {filteredLanguages.map((language) => {
            const isSelected = selectedLanguages.includes(language);

            return (
              <button
                key={language}
                type="button"
                onClick={() => onToggleLanguage(language)}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {language}
              </button>
            );
          })}
        </div>

        <div className="mb-5">
          <p className="mb-2 text-sm text-gray-600">검색</p>

          <input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search"
            className="h-12 w-full rounded-md border border-gray-300 px-4 outline-none"
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="h-12 w-full rounded-md bg-blue-400 text-base font-semibold text-white hover:bg-blue-500"
        >
          완료
        </button>
      </div>
    </div>
  );
}

export default LanguageSelectModal;
