import { useState } from 'react';

const issues = [
  {
    id: 1,
    status: '미해결',
    title: '로그인 요청 시 간헐적으로 500 에러가 발생합니다',
    description:
      '특정 계정으로 로그인할 때 서버 응답이 실패하는 현상이 있어 인증 API와 세션 처리 흐름 확인이 필요합니다.',
    tags: ['Auth', 'Axios', 'Backend'],
    replies: 0,
    selected: 0,
    time: '49분 전',
  },
  {
    id: 2,
    status: '미해결',
    title: '프로필 이미지 업로드 후 미리보기가 갱신되지 않습니다',
    description:
      '이미지를 선택해도 화면에 바로 반영되지 않아 파일 상태 관리와 preview URL 생성 로직 점검이 필요합니다.',
    tags: ['React', 'Upload', 'State'],
    replies: 2,
    selected: 0,
    time: '1시간 전',
  },
  {
    id: 3,
    status: '미해결',
    title: '팀 생성 후 사이드바 팀 목록이 즉시 업데이트되지 않습니다',
    description:
      '팀 생성 요청은 성공하지만 목록 데이터가 갱신되지 않아 쿼리 무효화 또는 캐시 업데이트 처리가 필요합니다.',
    tags: ['React Query', 'Team', 'Cache'],
    replies: 3,
    selected: 0,
    time: '3시간 전',
  },
  {
    id: 4,
    status: '미해결',
    title: '댓글 작성 후 입력창 내용이 초기화되지 않습니다',
    description:
      '해결 제안 댓글을 등록한 뒤에도 textarea 값이 남아 있어 작성 완료 후 상태 초기화 처리가 필요합니다.',
    tags: ['Comment', 'Form', 'UX'],
    replies: 1,
    selected: 0,
    time: '어제',
  },
  {
    id: 5,
    status: '해결',
    title: '세션 만료 시간 설정 오류로 인한 인증 실패 해결',
    description:
      '세션 유지 시간이 너무 짧게 설정되어 발생한 문제로 확인되었고, 만료 시간을 조정해 정상 동작을 확인했습니다.',
    tags: ['Session', 'Auth', 'Server'],
    replies: 5,
    selected: 1,
    time: '이틀 전',
  },
];

function IssueFeed() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <section className="mx-auto w-full max-w-292.5 px-25 pt-20 pb-12 text-(--text-primary)">
      <div className="mb-6">
        <h1 className="typo-medium-40">최신 이슈 피드</h1>

        <p className="mt-3 typo-regular-14 text-(--text-secondary)">
          모든 팀에 공개된 이슈를 확인하고, 함께 해결해보세요.
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
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

      <div className="mb-6 flex items-center gap-3">
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

      <div className="space-y-6">
        {issues.map((issue) => (
          <article
            key={issue.id}
            className="cursor-pointer rounded-lg bg-(--surface-panel) px-8 py-6 transition hover:bg-(--surface-selected)"
            onClick={() => {
              window.location.href = `/issues/${issue.id}`;
            }}
          >
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0 flex-1">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold text-(--text-primary) ${
                      issue.status === '해결'
                        ? 'bg-(--status-solved)'
                        : 'bg-(--status-unsaved)'
                    }`}
                  >
                    {issue.status}
                  </span>

                  <h2 className="truncate typo-semibold-18 text-(--text-primary)">
                    {issue.title}
                  </h2>
                </div>

                <p className="mb-4 truncate typo-regular-14 text-(--text-secondary)">
                  {issue.description}
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
                <div>
                  답변 {issue.replies} &nbsp; 채택 {issue.selected}
                </div>

                <div>{issue.time}</div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-center gap-2">
        <button
          type="button"
          className="cursor-pointer rounded-sm border border-border px-3 py-2 text-sm text-(--text-secondary) hover:bg-(--surface-selected)"
        >
          ‹
        </button>

        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((page) => (
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
        ))}

        <button
          type="button"
          className="cursor-pointer rounded-sm bg-primary px-3 py-2 text-sm text-(--text-inverse) hover:opacity-90"
        >
          ›
        </button>
      </div>
    </section>
  );
}

export default IssueFeed;
