import { useState } from 'react';

const issues = [
  {
    id: 1,
    status: '미해결',
    title: '로그인 시 간헐적으로 500에러 발생합니다 ㅜㅜ',
    description:
      '왜이러는지 모르겠는데 아니 이게 왜이래요 이유를 알려주세요 제발 설명입니다 설명이에요 이거 이 글 설명입니다...',
    tags: ['JavaScript', 'React', 'Axios'],
    replies: 0,
    selected: 0,
    time: '49분 전',
  },
  {
    id: 2,
    status: '해결',
    title: '로그인 시 간헐적으로 500에러 발생합니다 ㅜㅜ',
    description:
      '왜이러는지 모르겠는데 아니 이게 왜이래요 이유를 알려주세요 제발 설명입니다 설명이에요 이거 이 글 설명입니다...',
    tags: ['HTML', 'CSS', 'JavaScript'],
    replies: 5,
    selected: 1,
    time: '이틀 전',
  },
  {
    id: 3,
    status: '해결',
    title: '로그인 시 간헐적으로 500에러 발생합니다 ㅜㅜ',
    description:
      '왜이러는지 모르겠는데 아니 이게 왜이래요 이유를 알려주세요 제발 설명입니다 설명이에요 이거 이 글 설명입니다...',
    tags: ['HTML', 'CSS', 'JavaScript'],
    replies: 5,
    selected: 1,
    time: '이틀 전',
  },
  {
    id: 4,
    status: '해결',
    title: '로그인 시 간헐적으로 500에러 발생합니다 ㅜㅜ',
    description:
      '왜이러는지 모르겠는데 아니 이게 왜이래요 이유를 알려주세요 제발 설명입니다 설명이에요 이거 이 글 설명입니다...',
    tags: ['HTML', 'CSS', 'JavaScript'],
    replies: 5,
    selected: 1,
    time: '이틀 전',
  },
  {
    id: 5,
    status: '해결',
    title: '로그인 시 간헐적으로 500에러 발생합니다 ㅜㅜ',
    description:
      '왜이러는지 모르겠는데 아니 이게 왜이래요 이유를 알려주세요 제발 설명입니다 설명이에요 이거 이 글 설명입니다...',
    tags: ['HTML', 'CSS', 'JavaScript'],
    replies: 5,
    selected: 1,
    time: '이틀 전',
  },
];

function IssueFeed() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <section className="mx-auto -ml-0 w-full max-w-[1170px] px-25 -mt-4 pt-0 pb-12 text-white">
      <div className="mb-6">
        <h1 className="font-mono text-4xl font-bold tracking-tight">
          최신 이슈 피드
        </h1>

        <p className="mt-3 text-sm text-white/80">
          모든 팀에 공개된 이슈를 확인하고, 함께 해결해보세요.
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="cursor-pointer rounded border border-white/60 px-5 py-2 text-sm text-white hover:bg-white/10"
          >
            상태⌃
          </button>

          <button
            type="button"
            className="cursor-pointer rounded border border-white/60 px-5 py-2 text-sm text-white hover:bg-white/10"
          >
            상태⌃
          </button>

          <button
            type="button"
            className="cursor-pointer rounded border border-white/60 px-5 py-2 text-sm text-white hover:bg-white/10"
          >
            언어 선택
          </button>
        </div>

        <button
          type="button"
          className="cursor-pointer rounded border border-white/60 px-5 py-2 text-sm text-white hover:bg-white/10"
        >
          정렬⌃
        </button>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <span className="rounded bg-[#6553a8] px-3 py-1.5 text-xs">
          JavaScript ×
        </span>

        <span className="rounded bg-[#6553a8] px-3 py-1.5 text-xs">
          Axios ×
        </span>

        <button
          type="button"
          className="cursor-pointer text-xs text-white/80 hover:text-white"
        >
          ↻ 초기화
        </button>
      </div>

      <div className="space-y-6">
        {issues.map((issue) => (
          <article
            key={issue.id}
            className="cursor-pointer rounded-2xl bg-[#252447]/80 px-8 py-6 transition hover:bg-[#2c2b55]"
            onClick={() => {
              window.location.href = `/issues/${issue.id}`;
            }}
          >
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0 flex-1">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      issue.status === '해결'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-400 text-white'
                    }`}
                  >
                    {issue.status}
                  </span>

                  <h2 className="truncate text-base font-bold">
                    {issue.title}
                  </h2>
                </div>

                <p className="mb-4 truncate text-sm text-white/75">
                  {issue.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {issue.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-[#6553a8] px-3 py-1.5 text-xs text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex w-28 shrink-0 flex-col items-end gap-9 text-xs text-white/80">
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
          className="cursor-pointer rounded border border-white/20 px-3 py-2 text-sm text-white/70 hover:bg-white/10"
        >
          ‹
        </button>

        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => setCurrentPage(page)}
            className={`h-8 w-8 cursor-pointer rounded border text-sm ${
              currentPage === page
                ? 'border-yellow-300 bg-yellow-300 text-black'
                : 'border-white/40 text-white hover:bg-white/10'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          className="cursor-pointer rounded bg-yellow-300 px-3 py-2 text-sm text-black hover:bg-yellow-200"
        >
          ›
        </button>
      </div>
    </section>
  );
}

export default IssueFeed;
