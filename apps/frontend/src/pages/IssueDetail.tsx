import { useState } from 'react';

import {
  CalendarDays,
  FileImage,
  Globe2,
  MoreHorizontal,
  Plus,
  SquarePen,
  Trash2,
} from 'lucide-react';

function IssueDetail() {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);

  const isPublic = false;
  const visibilityText = isPublic ? '전체공개' : '비공개';

  const comments = [
    {
      id: 1,
      name: '김하늘',
      selected: true,
      isReply: false,
      text: 'Redis 세션 만료 시간이 너무 짧게 설정되어 있어서 발생한 것 같습니다. SessionTimeout 값을 30분으로 늘려보시고 확인해주세요.',
    },
    {
      id: 2,
      name: '김이름',
      selected: false,
      isReply: true,
      text: 'Redis 세션 만료 시간이 너무 짧게 설정되어 있어서 발생한 것 같습니다. SessionTimeout 값을 30분으로 늘려보시고 확인해주세요.',
    },
    {
      id: 3,
      name: '김하늘',
      selected: false,
      isReply: false,
      text: 'Redis 세션 만료 시간이 너무 짧게 설정되어 있어서 발생한 것 같습니다. SessionTimeout 값을 30분으로 늘려보시고 확인해주세요.',
    },
    {
      id: 4,
      name: '김하늘',
      selected: false,
      isReply: false,
      text: 'Redis 세션 만료 시간이 너무 짧게 설정되어 있어서 발생한 것 같습니다. SessionTimeout 값을 30분으로 늘려보시고 확인해주세요.',
    },
    {
      id: 5,
      name: '김하늘',
      selected: false,
      isReply: false,
      text: 'Redis 세션 만료 시간이 너무 짧게 설정되어 있어서 발생한 것 같습니다. SessionTimeout 값을 30분으로 늘려보시고 확인해주세요.',
    },
  ];

  const visibleComments = showAllComments ? comments : comments.slice(0, 3);

  return (
    <section className="relative flex min-h-[calc(100vh-90px)] -translate-y-12 gap-8 overflow-hidden px-12 pt-0 pb-10 text-(--text-primary)">
      <div className="relative z-10 w-182.5 shrink-0">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="typo-semibold-18 text-(--text-primary)">
                로그인 시 500 에러 발생
              </h1>

              <span className="rounded-full bg-(--status-solved) px-4 py-1 typo-regular-14 text-success-foreground">
                해결
              </span>
            </div>

            <div className="mt-8 flex gap-3">
              <span className="rounded-sm bg-(--surface-tag) px-5 py-2.5 typo-regular-14 text-(--text-primary)">
                Axios
              </span>

              <span className="rounded-sm bg-(--surface-tag) px-5 py-2.5 typo-regular-14 text-(--text-primary)">
                JavaScript
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3 typo-regular-14 text-(--text-primary)">
              <Globe2 size={24} />
              <span>{visibilityText}</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => alert('삭제 버튼 클릭')}
              className="flex h-16 w-20 cursor-pointer items-center justify-center rounded-md bg-(--surface-overlay) text-(--text-primary) shadow-(--shadow) hover:bg-(--surface-selected)"
              aria-label="삭제"
            >
              <Trash2 size={30} strokeWidth={1.7} />
            </button>

            <button
              type="button"
              onClick={() => alert('수정 버튼 클릭')}
              className="flex h-16 w-20 cursor-pointer items-center justify-center rounded-md bg-(--surface-overlay) text-(--text-primary) shadow-(--shadow) hover:bg-(--surface-selected)"
              aria-label="수정"
            >
              <SquarePen size={30} strokeWidth={1.7} />
            </button>
          </div>
        </div>

        <div className="mb-6 flex justify-between typo-regular-14 text-(--text-secondary)">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-white" />
            <span>김이름</span>
          </div>

          <div className="flex items-center gap-2 typo-regular-14 text-(--text-primary)">
            <CalendarDays size={22} strokeWidth={1.8} />
            <span>2026-04-25(토)</span>
          </div>
        </div>

        <div className="min-h-47.5 rounded-md bg-(--surface-panel) p-7 typo-regular-14 leading-8 text-(--text-primary)">
          네트워크단 Description에 여기서 나타내는 내용으로 입력합니다. 500에서
          에러가 발생합니다. 내용을 넣습니다 Description에 여기서 나타내는
          내용으로 넣습니다. 500에서 에러가 발생합니다. 내용을 넣습니다
          Description에 여기서 나타내는 내용으로 넣습니다. 500에서 에러가
          발생합니다. 내용입니다. TTT
        </div>

        <div className="mt-9 grid grid-cols-2 gap-5">
          <div>
            <h2 className="mb-3 typo-semibold-18 text-(--text-primary)">
              에러 로그
            </h2>

            <div className="h-57.5 rounded-md bg-(--surface-panel) p-5 typo-regular-14 text-(--text-secondary)">
              {'{여기는 에러로그에 시도하며 자동 코드가 보였야 할 영역입니다}'}
            </div>
          </div>

          <div>
            <h2 className="mb-3 typo-semibold-18 text-(--text-primary)">
              요청 정보
            </h2>

            <div className="h-57.5 rounded-md bg-(--surface-panel) p-5 typo-regular-14 text-(--text-secondary)">
              {
                '{여기는 클라이언트에서 서버 API를 호출한 기록이 보일 영역입니다}'
              }
            </div>
          </div>
        </div>

        <div className="mt-44 rounded-md bg-(--surface-panel) p-7">
          <div className="mb-5 flex items-center">
            <h2 className="typo-semibold-18 text-(--text-primary)">
              해결 제안 하기
            </h2>

            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => alert('첨부 추가 클릭')}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-sm bg-(--surface-input) text-(--text-primary) hover:bg-(--surface-selected)"
                aria-label="첨부 추가"
              >
                <Plus size={24} />
              </button>

              <button
                type="button"
                onClick={() => alert('이미지 추가 클릭')}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-sm bg-(--surface-input) text-(--text-primary) hover:bg-(--surface-selected)"
                aria-label="이미지 추가"
              >
                <FileImage size={22} />
              </button>

              <button
                type="button"
                onClick={() => alert('댓글 작성 버튼 클릭')}
                className="h-12 cursor-pointer rounded-sm bg-primary px-6 typo-medium-16 text-(--text-inverse) hover:opacity-90"
              >
                댓글 작성
              </button>
            </div>
          </div>

          <textarea
            className="h-42.5 w-full resize-none rounded-md border border-border bg-(--surface-input) p-5 text-(--text-primary) outline-none placeholder:text-(--text-muted)"
            placeholder="해결 제안을 입력하세요"
          />
        </div>
      </div>

      <aside className="relative z-10 w-102.5 shrink-0 rounded-lg bg-(--surface-panel) p-5">
        <h2 className="mb-6 typo-semibold-18 text-(--text-primary)">
          댓글수 {comments.length}
        </h2>

        <div className="space-y-5">
          {visibleComments.map((comment) => (
            <div
              key={comment.id}
              className={comment.isReply ? 'relative ml-12' : 'relative'}
            >
              {comment.isReply && (
                <div className="absolute -left-10 top-0 h-16 w-8 rounded-bl-xl border-b border-l border-border" />
              )}

              <div
                className={`rounded-md bg-(--surface-comment) p-5 ${
                  comment.selected
                    ? 'border border-(--status-unsaved) shadow-[0_0_18px_rgba(228,99,101,0.35)]'
                    : ''
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white" />
                    <span className="typo-medium-16 text-(--text-primary)">
                      {comment.name}
                    </span>

                    {comment.isReply && (
                      <span className="rounded-sm bg-(--surface-tag) px-3 py-1 text-xs text-(--text-primary)">
                        작성자
                      </span>
                    )}
                  </div>

                  <div className="relative flex items-center gap-3">
                    {comment.selected && (
                      <span className="rounded-full bg-(--status-unsaved) px-4 py-2 text-xs font-bold text-(--status-error-foreground)">
                        채택 +5
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === comment.id ? null : comment.id,
                        )
                      }
                      className="cursor-pointer text-(--text-primary)"
                      aria-label="댓글 메뉴"
                    >
                      <MoreHorizontal size={24} />
                    </button>

                    {openMenuId === comment.id && (
                      <div className="absolute right-0 top-9 z-30 w-32 overflow-hidden rounded-sm border border-border bg-popover typo-regular-14 text-popover-foreground shadow-(--shadow)">
                        <button
                          type="button"
                          onClick={() => {
                            alert('댓글 수정 클릭');
                            setOpenMenuId(null);
                          }}
                          className="block w-full cursor-pointer px-4 py-3 text-left hover:bg-(--surface-selected)"
                        >
                          수정
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            alert('댓글 삭제 클릭');
                            setOpenMenuId(null);
                          }}
                          className="block w-full cursor-pointer px-4 py-3 text-left hover:bg-(--surface-selected)"
                        >
                          삭제
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            alert('채택하기 클릭');
                            setOpenMenuId(null);
                          }}
                          className="block w-full cursor-pointer px-4 py-3 text-left hover:bg-(--surface-selected)"
                        >
                          채택하기
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="typo-regular-14 leading-6 text-(--text-primary)">
                  {comment.text}
                </p>

                <div className="mt-3 flex justify-between text-xs text-(--text-secondary)">
                  <span>2026-04-25(토)</span>

                  <button
                    type="button"
                    onClick={() => alert('답글 클릭')}
                    className="cursor-pointer hover:text-(--text-primary)"
                  >
                    답글
                  </button>
                </div>
              </div>
            </div>
          ))}

          {comments.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAllComments(!showAllComments)}
              className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-sm border border-border bg-(--surface-selected) py-3 typo-regular-14 text-(--text-primary) hover:opacity-90"
            >
              {showAllComments
                ? '접기'
                : `댓글 더보기 (${comments.length - 3})`}
            </button>
          )}
        </div>
      </aside>
    </section>
  );
}

export default IssueDetail;
