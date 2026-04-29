import { useMemo, useState } from 'react';
import { CircleHelp, FileImage, Plus, Sparkles } from 'lucide-react';

const allTags = ['JavaScript', 'Axios', 'React', 'frontend', 'ios'];
const teamOptions = ['팀 A', '팀 B', '팀 C'];
const memberOptions = ['김이름', '김하늘', '김병성'];

function IssueEdit() {
  const [title, setTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState(['JavaScript', 'Axios']);
  const [description, setDescription] = useState('');
  const [errorLog, setErrorLog] = useState('');
  const [requestInfo, setRequestInfo] = useState('');
  const [issueStatus, setIssueStatus] = useState<'unsolved' | 'solved'>(
    'unsolved',
  );
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');
  const [team, setTeam] = useState('팀');
  const [member, setMember] = useState('팀 멤버');

  const filteredTags = useMemo(() => {
    if (!tagInput.trim()) return [];
    return allTags.filter(
      (tag) =>
        tag.toLowerCase().includes(tagInput.toLowerCase()) &&
        !selectedTags.includes(tag),
    );
  }, [tagInput, selectedTags]);

  const addTag = (tag: string) => {
    if (selectedTags.includes(tag)) return;
    setSelectedTags((prev) => [...prev, tag]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((item) => item !== tag));
  };

  const handleUpdate = () => {
    alert('수정하기 클릭');
  };

  const handleCancel = () => {
    alert('취소하기 클릭');
  };

  const handleAiSummary = () => {
    alert('AI 도움받기 클릭');
  };

  return (
    <section className="mx-auto w-full max-w-292.5 px-8 pt-10 pb-10 text-(--text-primary)">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="typo-medium-40">이슈 수정</h1>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="h-12 cursor-pointer rounded-md bg-(--surface-overlay) px-6 typo-medium-16 text-(--text-primary) hover:bg-(--surface-selected)"
          >
            취소하기
          </button>

          <button
            type="button"
            onClick={handleUpdate}
            className="h-12 cursor-pointer rounded-md bg-primary px-6 typo-medium-16 text-(--text-inverse) hover:opacity-90"
          >
            수정하기
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-[120px_1fr] items-start gap-4">
          <label className="pt-4 typo-semibold-18 text-(--text-primary)">
            제목 *
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="이슈 제목을 입력하세요."
            className="h-14 w-full rounded-md border border-border bg-(--surface-input) px-5 typo-regular-14 text-(--text-primary) outline-none placeholder:text-(--text-muted)"
          />
        </div>

        <div className="grid grid-cols-[120px_1fr] items-start gap-4">
          <label className="pt-4 typo-semibold-18 text-(--text-primary)">
            분류/태그 *
          </label>

          <div>
            <div className="relative rounded-md border border-border bg-(--surface-input) px-4 py-3">
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-2 rounded-sm bg-(--surface-tag) px-3 py-1.5 text-xs text-(--text-primary)"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="cursor-pointer text-(--text-primary)"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="태그 검색 또는 입력 (예: Javascript, frontend, ios)"
                className="w-full bg-transparent typo-regular-14 text-(--text-primary) outline-none placeholder:text-(--text-muted)"
              />

              {filteredTags.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-md border border-border bg-popover p-2 shadow-(--shadow)">
                  {filteredTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="block w-full cursor-pointer rounded-sm px-3 py-2 text-left typo-regular-14 text-popover-foreground hover:bg-(--surface-selected)"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[120px_1fr] items-start gap-4">
          <label className="pt-4 typo-semibold-18 text-(--text-primary)">
            설명
          </label>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="typo-regular-14 text-(--text-muted)">
                마크다운을 지원합니다. **굵게**, `코드`, - 목록 등을 사용할 수
                있습니다.
              </p>

              <div className="flex items-center gap-4">
                <div className="flex overflow-hidden rounded-2xl bg-(--surface-overlay)">
                  <button
                    type="button"
                    onClick={() => alert('이미지 추가')}
                    className="flex h-14 w-14 cursor-pointer items-center justify-center text-(--text-primary) hover:bg-(--surface-selected)"
                    aria-label="이미지 추가"
                  >
                    <Plus size={32} strokeWidth={2.4} />
                  </button>

                  <button
                    type="button"
                    disabled
                    className="flex h-14 w-14 items-center justify-center text-(--text-primary)"
                    aria-label="이미지 아이콘"
                  >
                    <FileImage size={28} strokeWidth={2.2} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAiSummary}
                  className="flex h-14 cursor-pointer items-center gap-2 rounded-full bg-white px-5 typo-medium-16 text-black hover:opacity-90"
                >
                  <Sparkles size={16} />
                  AI 도움받기
                </button>
              </div>
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이슈 상태 내용을 입력하세요. (마크다운 지원)"
              className="min-h-189 w-full resize-none rounded-md border border-border bg-(--surface-input) p-5 typo-regular-16 text-(--text-primary) outline-none placeholder:text-(--text-muted)"
            />
          </div>
        </div>

        <div className="grid grid-cols-[120px_1fr] items-start gap-4">
          <div />

          <div className="grid grid-cols-2 gap-5">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="typo-semibold-18 text-(--text-primary)">
                  에러 로그
                </h2>
                <CircleHelp size={16} className="text-(--text-secondary)" />
              </div>

              <textarea
                value={errorLog}
                onChange={(e) => setErrorLog(e.target.value)}
                placeholder="스택 트레이스, 에러 메시지 등을 붙여넣으세요."
                className="h-40 w-full resize-none rounded-md border border-border bg-(--surface-input) p-4 typo-regular-14 text-(--text-primary) outline-none placeholder:text-(--text-muted)"
              />
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="typo-semibold-18 text-(--text-primary)">
                  요청 정보
                </h2>
                <CircleHelp size={16} className="text-(--text-secondary)" />
              </div>

              <textarea
                value={requestInfo}
                onChange={(e) => setRequestInfo(e.target.value)}
                placeholder="요청한 환경/재현 방법/추가 정보 등을 입력하세요."
                className="h-40 w-full resize-none rounded-md border border-border bg-(--surface-input) p-4 typo-regular-14 text-(--text-primary) outline-none placeholder:text-(--text-muted)"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 h-px w-full bg-white/40" />

        <div className="grid grid-cols-[120px_1fr] items-start gap-4 pt-5">
          <label className="pt-3 typo-semibold-18 text-(--text-primary)">
            상태 *
          </label>

          <div className="grid w-full max-w-[970px] grid-cols-2 gap-6 pt-0">
            <button
              type="button"
              onClick={() => setIssueStatus('unsolved')}
              className={`cursor-pointer rounded-md border p-5 text-left ${
                issueStatus === 'unsolved'
                  ? 'border-(--status-unsaved) bg-(--surface-selected)'
                  : 'border-border bg-(--surface-panel)'
              }`}
            >
              <div className="mb-2 flex items-center gap-3">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    issueStatus === 'unsolved'
                      ? 'border-(--status-unsaved)'
                      : 'border-white'
                  }`}
                >
                  {issueStatus === 'unsolved' && (
                    <span className="block h-2 w-2 rounded-full bg-(--status-unsaved)" />
                  )}
                </span>

                <span className="typo-medium-16 text-(--text-primary)">
                  미해결 이슈
                </span>
              </div>

              <p className="typo-regular-14 text-(--text-secondary)">
                이슈에 대한 적극적인 의견이 필요합니다.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setIssueStatus('solved')}
              className={`cursor-pointer rounded-md border p-5 text-left ${
                issueStatus === 'solved'
                  ? 'border-(--status-solved) bg-(--surface-selected)'
                  : 'border-border bg-(--surface-panel)'
              }`}
            >
              <div className="mb-2 flex items-center gap-3">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    issueStatus === 'solved'
                      ? 'border-(--status-solved)'
                      : 'border-white'
                  }`}
                >
                  {issueStatus === 'solved' && (
                    <span className="block h-2 w-2 rounded-full bg-(--status-solved)" />
                  )}
                </span>

                <span className="typo-medium-16 text-(--text-primary)">
                  해결 이슈
                </span>
              </div>

              <p className="typo-regular-14 text-(--text-secondary)">
                추가 의견이 들어오면 보기나, 기록하고 싶습니다.
              </p>
            </button>
          </div>
        </div>

        <div className="mt-4 h-px w-full bg-white/40" />

        <div className="grid grid-cols-[120px_1fr] items-start gap-4 pt-5">
          <label className="pt-3 typo-semibold-18 text-(--text-primary)">
            공개 범위 *
          </label>

          <div className="grid w-full max-w-[970px] grid-cols-2 gap-6 pt-0">
            <button
              type="button"
              onClick={() => setVisibility('public')}
              className={`cursor-pointer rounded-md border p-5 text-left ${
                visibility === 'public'
                  ? 'border-(--status-solved) bg-(--surface-selected)'
                  : 'border-border bg-(--surface-panel)'
              }`}
            >
              <div className="mb-2 flex items-center gap-3">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    visibility === 'public'
                      ? 'border-(--status-solved)'
                      : 'border-white'
                  }`}
                >
                  {visibility === 'public' && (
                    <span className="block h-2 w-2 rounded-full bg-(--status-solved)" />
                  )}
                </span>

                <span className="typo-medium-16 text-(--text-primary)">
                  공개
                </span>
              </div>

              <p className="typo-regular-14 text-(--text-secondary)">
                팀원 외 외부인의 조회, 댓글 생성이 가능합니다.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setVisibility('private')}
              className={`cursor-pointer rounded-md border p-5 text-left ${
                visibility === 'private'
                  ? 'border-primary bg-(--surface-selected)'
                  : 'border-border bg-(--surface-panel)'
              }`}
            >
              <div className="mb-2 flex items-center gap-3">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    visibility === 'private' ? 'border-primary' : 'border-white'
                  }`}
                >
                  {visibility === 'private' && (
                    <span className="block h-2 w-2 rounded-full bg-primary" />
                  )}
                </span>

                <span className="typo-medium-16 text-(--text-primary)">
                  비공개
                </span>
              </div>

              <p className="typo-regular-14 text-(--text-secondary)">
                해당 팀원 만이 조회, 댓글 생성이 가능합니다.
              </p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[120px_1fr_1px_120px_1fr] items-center gap-4 pt-5">
          <label className="typo-semibold-18 text-(--text-primary)">
            팀 선택
          </label>

          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="h-14 w-full cursor-pointer rounded-md border border-border bg-(--surface-input) px-4 typo-regular-14 text-(--text-primary) outline-none"
          >
            <option>팀</option>
            {teamOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <div className="h-14 w-px bg-white/40" />

          <label className="typo-semibold-18 text-(--text-primary)">
            팀 멤버 선택
          </label>

          <select
            value={member}
            onChange={(e) => setMember(e.target.value)}
            className="h-14 w-full cursor-pointer rounded-md border border-border bg-(--surface-input) px-4 typo-regular-14 text-(--text-primary) outline-none"
          >
            <option>팀 멤버</option>
            {memberOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 h-px w-full bg-white/40" />

        <div className="flex justify-between pt-4 pb-12">
          <button
            type="button"
            onClick={handleCancel}
            className="h-12 cursor-pointer rounded-md bg-(--surface-overlay) px-6 typo-medium-16 text-(--text-primary) hover:bg-(--surface-selected)"
          >
            취소하기
          </button>

          <button
            type="button"
            onClick={handleUpdate}
            className="h-12 cursor-pointer rounded-md bg-primary px-8 typo-medium-16 text-(--text-inverse) hover:opacity-90"
          >
            수정하기
          </button>
        </div>
      </div>
    </section>
  );
}

export default IssueEdit;
