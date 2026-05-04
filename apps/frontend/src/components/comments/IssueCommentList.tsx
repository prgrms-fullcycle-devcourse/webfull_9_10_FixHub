import { useState } from 'react';

import { MoreHorizontal, Rocket } from 'lucide-react';

import { Button } from '@/components/ui/button';

export type IssueCommentItem = {
  id: number;
  authorId: string;
  name: string;
  selected: boolean;
  isReply: boolean;
  text: string;
};

type IssueCommentListProps = {
  comments: IssueCommentItem[];
  currentUserId: string;
  issueAuthorId: string;
};

function IssueCommentList({
  comments,
  currentUserId,
  issueAuthorId,
}: IssueCommentListProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);

  const visibleComments = showAllComments ? comments : comments.slice(0, 3);
  const canAdoptComments = currentUserId === issueAuthorId;

  return (
    <aside className="relative z-10 rounded-lg bg-(--surface-panel) p-5">
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
                  {comment.selected ? (
                    <span className="rounded-full border-transparent border bg-(--status-unsaved) px-4 py-2 text-xs font-bold text-(--status-error-foreground)">
                      채택 +5
                    </span>
                  ) : canAdoptComments && comment.authorId !== currentUserId ? (
                    <button
                      type="button"
                      className="flex gap-1 rounded-full border-1 px-4 py-2 text-xs font-bold transition duration-300 hover:bg-(--status-unsaved) hover:border-transparent cursor-pointer"
                      onClick={() => {
                        alert('채택하기 클릭');
                      }}
                    >
                      채택
                      <Rocket size={18} />
                    </button>
                  ) : null}

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === comment.id ? null : comment.id,
                      )
                    }
                    className="cursor-pointer text-(--text-primary) hover:bg-(--surface-selected)"
                    aria-label="댓글 메뉴"
                  >
                    <MoreHorizontal size={24} />
                  </Button>

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
            {showAllComments ? '접기' : `댓글 더보기 (${comments.length - 3})`}
          </button>
        )}
      </div>
    </aside>
  );
}

export default IssueCommentList;
