import { useMemo, useState } from 'react';
import { CircleHelp, FileImage, Plus, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useGetTeamsTeamIdIssuesIssueId,
  usePatchTeamsTeamIdIssuesIssueId,
} from '@/api/generated';
import IssueMarkdown from '@/components/issues/IssueMarkdown';

const allTags = ['JavaScript', 'Axios', 'React', 'frontend', 'ios'];
const teamOptions = ['팀 A', '팀 B', '팀 C'];
const memberOptions = ['김이름', '김하늘', '김병성'];

type DraftState = {
  title: string;
  selectedTags: string[];
  description: string;
  errorLog: string;
  requestInfo: string;
  issueStatus: 'UNSOLVED' | 'SOLVED';
  visibility: 'public' | 'private';
};

function IssueEdit() {
  const navigate = useNavigate();
  const { teamId, issueId } = useParams();

  const { data, isPending: isDetailPending } = useGetTeamsTeamIdIssuesIssueId(
    teamId ?? '',
    issueId ?? '',
    {
      query: {
        enabled: Boolean(teamId && issueId),
      },
    },
  );

  const { mutateAsync, isPending } = usePatchTeamsTeamIdIssuesIssueId();

  const [tagInput, setTagInput] = useState('');
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [team, setTeam] = useState('팀');
  const [member, setMember] = useState('팀 멤버');

  const initialValues: DraftState | null = data
    ? {
        title: data.title,
        selectedTags: [...data.tag],
        description: data.content,
        errorLog:
          data.logs.find((log) => log.logType === 'SENT')?.message ?? '',
        requestInfo:
          data.logs.find((log) => log.logType === 'RECEIVED')?.message ?? '',
        issueStatus: data.status,
        visibility: data.isPublic ? 'public' : 'private',
      }
    : null;

  const title = draft?.title ?? initialValues?.title ?? '';
  const selectedTags = draft?.selectedTags ?? initialValues?.selectedTags ?? [];
  const description = draft?.description ?? initialValues?.description ?? '';
  const errorLog = draft?.errorLog ?? initialValues?.errorLog ?? '';
  const requestInfo = draft?.requestInfo ?? initialValues?.requestInfo ?? '';
  const issueStatus =
    draft?.issueStatus ?? initialValues?.issueStatus ?? 'UNSOLVED';
  const visibility: 'public' | 'private' =
    draft?.visibility ?? initialValues?.visibility ?? 'private';

  const getBaseDraft = (): DraftState => ({
    title,
    selectedTags,
    description,
    errorLog,
    requestInfo,
    issueStatus,
    visibility,
  });

  const updateDraft = (patch: Partial<DraftState>) => {
    setDraft({
      ...getBaseDraft(),
      ...patch,
    });
  };

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
    updateDraft({ selectedTags: [...selectedTags, tag] });
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    updateDraft({
      selectedTags: selectedTags.filter((item) => item !== tag),
    });
  };

  const handleUpdate = async () => {
    if (!teamId || !issueId) {
      alert('이슈 정보가 없습니다.');
      return;
    }

    if (!title.trim()) {
      alert('제목을 입력하세요.');
      return;
    }

    if (!description.trim()) {
      alert('설명을 입력하세요.');
      return;
    }

    if (selectedTags.length === 0) {
      alert('태그를 1개 이상 선택하세요.');
      return;
    }

    const logs = [];

    if (errorLog.trim()) {
      logs.push({
        logType: 'SENT' as const,
        stackTrace: errorLog.trim(),
      });
    }

    if (requestInfo.trim()) {
      logs.push({
        logType: 'RECEIVED' as const,
        stackTrace: requestInfo.trim(),
      });
    }

    try {
      await mutateAsync({
        teamId,
        issueId,
        data: {
          title: title.trim(),
          content: description.trim(),
          tags: selectedTags,
          isPublic: visibility === 'public',
          logs,
        },
      });

      navigate(`/teams/${teamId}/issues/${issueId}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '이슈 수정 중 오류가 발생했습니다.';

      alert(message);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleAiSummary = () => {
    alert('AI 도움받기 클릭');
  };

  if (isDetailPending) {
    return (
      <section className="w-full flex-1 px-[60px] pt-[60px] pb-[60px] text-(--text-primary)">
        <div className="py-10 text-center typo-regular-14 text-(--text-secondary)">
          불러오는 중...
        </div>
      </section>
    );
  }

  return (
    <section className="w-full flex-1 px-[60px] pt-[60px] pb-[60px] text-(--text-primary)">
      <div className="flex flex-col gap-[60px]">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="typo-medium-40">이슈 수정</h1>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="h-12 cursor-pointer rounded-md bg-(--surface-overlay) px-6 typo-medium-16 text-(--text-primary)
                transition-all duration-200 ease-out
                hover:shadow-(--shadow)"
            >
              취소하기
            </button>

            <button
              type="button"
              onClick={handleUpdate}
              disabled={isPending}
              className="h-12 cursor-pointer rounded-md bg-primary px-8 typo-medium-16 text-(--text-inverse)
                transition-all duration-200 ease-out
                hover:shadow-(--shadow) disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? '수정 중...' : '수정하기'}
            </button>
          </div>
        </div>

        {/* 입력 영역 */}
        <div className="flex flex-col gap-8">
          {/* 제목 */}
          <div className="grid grid-cols-[120px_1fr] items-start gap-4">
            <label className="pt-4 typo-semibold-18 text-(--text-primary)">
              제목 *
            </label>

            <input
              value={title}
              onChange={(e) => updateDraft({ title: e.target.value })}
              placeholder="이슈 제목을 입력하세요."
              className="h-14 w-full rounded-sm border border-border px-5 typo-regular-16 outline-none placeholder:text-(--text-muted)
                transition-all duration-300
                focus:border-primary
                focus:shadow-(--shadow)"
              style={{
                background: 'var(--surface-input)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* 분류/태그 */}
          <div className="grid grid-cols-[120px_1fr] items-start gap-4">
            <label className="pt-4 typo-semibold-18 text-(--text-primary)">
              분류/태그 *
            </label>

            <div>
              <div
                className="relative rounded-sm border border-border px-4 py-3
                  transition-all duration-300
                  focus-within:border-primary
                  focus-within:shadow-(--shadow)"
                style={{
                  background: 'var(--surface-input)',
                  color: 'var(--text-primary)',
                }}
              >
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-2 rounded-sm bg-(--surface-tag) px-3 py-1.5 typo-regular-14 text-(--text-primary)"
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
                  className="w-full bg-transparent typo-regular-16 text-(--text-primary) outline-none placeholder:text-(--text-muted)"
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

          {/* 설명 */}
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
                    className="flex h-14 cursor-pointer items-center gap-2 rounded-full bg-primary px-5 typo-medium-16 text-(--text-inverse)
                      transition-all duration-200 ease-out
                      hover:shadow-(--shadow)"
                  >
                    <Sparkles size={16} />
                    AI 도움받기
                  </button>
                </div>
              </div>

              <textarea
                value={description}
                onChange={(e) => updateDraft({ description: e.target.value })}
                placeholder="이슈 상태 내용을 입력하세요. (마크다운 지원)"
                className="min-h-189 w-full resize-none rounded-sm border border-border p-5 typo-regular-16 outline-none placeholder:text-(--text-muted)
                  transition-all duration-300
                  focus:border-primary
                  focus:shadow-(--shadow)"
                style={{
                  background: 'var(--surface-input)',
                  color: 'var(--text-primary)',
                }}
              />

              {description.trim() && (
                <div className="mt-4 rounded-sm bg-(--surface-panel) p-5">
                  <p className="mb-3 typo-medium-16 text-(--text-primary)">
                    미리보기
                  </p>
                  <IssueMarkdown content={description} />
                </div>
              )}
            </div>
          </div>

          {/* 로그 입력 영역 */}
          <div className="grid grid-cols-[120px_1fr] items-start gap-4">
            <div />

            <div className="grid grid-cols-2 gap-5">
              {/* 에러 로그 */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="typo-semibold-18 text-(--text-primary)">
                    에러 로그
                  </h2>
                  <CircleHelp size={16} className="text-(--text-secondary)" />
                </div>

                <textarea
                  value={errorLog}
                  onChange={(e) => updateDraft({ errorLog: e.target.value })}
                  placeholder="스택 트레이스, 에러 메시지 등을 붙여넣으세요."
                  className="h-40 w-full resize-none rounded-sm border border-border p-4 typo-regular-16 outline-none placeholder:text-(--text-muted)
                    transition-all duration-300
                    focus:border-primary
                    focus:shadow-(--shadow)"
                  style={{
                    background: 'var(--surface-input)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* 요청 정보 */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="typo-semibold-18 text-(--text-primary)">
                    요청 정보
                  </h2>
                  <CircleHelp size={16} className="text-(--text-secondary)" />
                </div>

                <textarea
                  value={requestInfo}
                  onChange={(e) => updateDraft({ requestInfo: e.target.value })}
                  placeholder="요청한 환경/재현 방법/추가 정보 등을 입력하세요."
                  className="h-40 w-full resize-none rounded-sm border border-border p-4 typo-regular-16 outline-none placeholder:text-(--text-muted)
                    transition-all duration-300
                    focus:border-primary
                    focus:shadow-(--shadow)"
                  style={{
                    background: 'var(--surface-input)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-border" />

          {/* 상태 */}
          <div className="grid grid-cols-[120px_1fr] items-start gap-4">
            <label className="pt-3 typo-semibold-18 text-(--text-primary)">
              상태 *
            </label>

            <div className="grid grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => updateDraft({ issueStatus: 'UNSOLVED' })}
                className={`cursor-pointer rounded-md border p-5 text-left ${
                  issueStatus === 'UNSOLVED'
                    ? 'border-(--status-unsaved) bg-(--surface-selected)'
                    : 'border-border bg-(--surface-panel)'
                }`}
              >
                <div className="mb-2 flex items-center gap-3">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      issueStatus === 'UNSOLVED'
                        ? 'border-(--status-unsaved)'
                        : 'border-border'
                    }`}
                  >
                    {issueStatus === 'UNSOLVED' && (
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
                onClick={() => updateDraft({ issueStatus: 'SOLVED' })}
                className={`cursor-pointer rounded-md border p-5 text-left ${
                  issueStatus === 'SOLVED'
                    ? 'border-(--status-solved) bg-(--surface-selected)'
                    : 'border-border bg-(--surface-panel)'
                }`}
              >
                <div className="mb-2 flex items-center gap-3">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      issueStatus === 'SOLVED'
                        ? 'border-(--status-solved)'
                        : 'border-border'
                    }`}
                  >
                    {issueStatus === 'SOLVED' && (
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

          <div className="h-px w-full bg-border" />

          {/* 공개 범위 */}
          <div className="grid grid-cols-[120px_1fr] items-start gap-4">
            <label className="pt-3 typo-semibold-18 text-(--text-primary)">
              공개 범위 *
            </label>

            <div className="grid grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => updateDraft({ visibility: 'public' })}
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
                        : 'border-border'
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
                onClick={() => updateDraft({ visibility: 'private' })}
                className={`cursor-pointer rounded-md border p-5 text-left ${
                  visibility === 'private'
                    ? 'border-primary bg-(--surface-selected)'
                    : 'border-border bg-(--surface-panel)'
                }`}
              >
                <div className="mb-2 flex items-center gap-3">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      visibility === 'private'
                        ? 'border-primary'
                        : 'border-border'
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

          {/* 팀 선택 영역 */}
          <div className="grid grid-cols-[120px_1fr_1px_120px_1fr] items-center gap-4">
            <label className="typo-semibold-18 text-(--text-primary)">
              팀 선택
            </label>

            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="h-14 w-full cursor-pointer rounded-sm border border-border px-4 typo-regular-16 outline-none
                transition-all duration-300
                focus:border-primary
                focus:shadow-(--shadow)"
              style={{
                background: 'var(--surface-input)',
                color: 'var(--text-primary)',
              }}
            >
              <option>팀</option>
              {teamOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <div className="h-14 w-px bg-border" />

            <label className="typo-semibold-18 text-(--text-primary)">
              팀 멤버 선택
            </label>

            <select
              value={member}
              onChange={(e) => setMember(e.target.value)}
              className="h-14 w-full cursor-pointer rounded-sm border border-border px-4 typo-regular-16 outline-none
                transition-all duration-300
                focus:border-primary
                focus:shadow-(--shadow)"
              style={{
                background: 'var(--surface-input)',
                color: 'var(--text-primary)',
              }}
            >
              <option>팀 멤버</option>
              {memberOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="h-px w-full bg-border" />

          {/* 하단 버튼 */}
          <div className="flex justify-between pt-[60px]">
            <button
              type="button"
              onClick={handleCancel}
              className="h-12 cursor-pointer rounded-md bg-(--surface-overlay) px-6 typo-medium-16 text-(--text-primary)
                transition-all duration-200 ease-out
                hover:shadow-(--shadow)"
            >
              취소하기
            </button>

            <button
              type="button"
              onClick={handleUpdate}
              disabled={isPending}
              className="h-12 cursor-pointer rounded-md bg-primary px-8 typo-medium-16 text-(--text-inverse)
                transition-all duration-200 ease-out
                hover:shadow-(--shadow) disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? '수정 중...' : '수정하기'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default IssueEdit;
