import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Rocket } from 'lucide-react';

import {
  getGetCommentsQueryKey,
  useAdoptComment,
  useDeleteComment,
  usePostIssuesIdComments,
  useUpdateComment,
} from '@/api/generated';
import { Button } from '@/components/ui/button';
import CommonModal from '@/components/ui/CommonModal';

export type IssueCommentItem = {
  id: string;
  author: {
    id: string;
    name: string;
  };
  selected: boolean;
  isReply: boolean;
  text: string;
  createdAt: string;
};

type IssueCommentListProps = {
  issueId: string;
  comments: IssueCommentItem[];
  currentUserId: string;
  isIssueAuthor: boolean;
};

function IssueCommentList({
  issueId,
  comments,
  currentUserId,
  isIssueAuthor,
}: IssueCommentListProps) {
  const queryClient = useQueryClient();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editedCommentTexts, setEditedCommentTexts] = useState<
    Record<string, string>
  >({});
  const [deleteConfirmCommentId, setDeleteConfirmCommentId] = useState<
    string | null
  >(null);
  const [deletedCommentIds, setDeletedCommentIds] = useState<string[]>([]);
  const [adoptedCommentIds, setAdoptedCommentIds] = useState<string[]>([]);
  const [adoptingCommentId, setAdoptingCommentId] = useState<string | null>(
    null,
  );
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(
    null,
  );
  const [replyText, setReplyText] = useState('');
  const [isEmptyReplyModalOpen, setIsEmptyReplyModalOpen] = useState(false);
  const [isAdoptErrorModalOpen, setIsAdoptErrorModalOpen] = useState(false);

  useEffect(() => {
    if (openMenuId === null) {
      return;
    }

    const closeMenuOnOutsideClick = (event: PointerEvent) => {
      const target = event.target;

      const menuRoot =
        target instanceof Element
          ? target.closest('[data-comment-menu-root]')
          : null;

      if (menuRoot?.getAttribute('data-comment-menu-root') === openMenuId) {
        return;
      }

      setOpenMenuId(null);
    };

    document.addEventListener('pointerdown', closeMenuOnOutsideClick);

    return () => {
      document.removeEventListener('pointerdown', closeMenuOnOutsideClick);
    };
  }, [openMenuId]);

  const remainingComments = comments.filter(
    (comment) => !deletedCommentIds.includes(comment.id),
  );
  const visibleComments = showAllComments
    ? remainingComments
    : remainingComments.slice(0, 3);
  const deleteConfirmComment = remainingComments.find(
    (comment) => comment.id === deleteConfirmCommentId,
  );
  const { mutate: adoptComment, isPending: isAdoptingComment } =
    useAdoptComment({
      mutation: {
        onSuccess: (adoptedComment, variables) => {
          const adoptedCommentId =
            adoptedComment.commentId ?? variables.commentId;

          setAdoptedCommentIds((prevCommentIds) =>
            prevCommentIds.includes(adoptedCommentId)
              ? prevCommentIds
              : [...prevCommentIds, adoptedCommentId],
          );
          queryClient.invalidateQueries({
            queryKey: getGetCommentsQueryKey(issueId),
          });
        },
        onError: () => {
          setIsAdoptErrorModalOpen(true);
        },
        onSettled: () => {
          setAdoptingCommentId(null);
        },
      },
    });
  const { mutate: updateComment, isPending: isUpdatingComment } =
    useUpdateComment({
      mutation: {
        onSuccess: (updatedComment) => {
          setEditedCommentTexts((prevTexts) => ({
            ...prevTexts,
            [updatedComment.id]: updatedComment.content,
          }));
          setEditingCommentId(null);
          setEditingText('');
          queryClient.invalidateQueries({
            queryKey: getGetCommentsQueryKey(issueId),
          });
        },
        onError: () => {
          alert('댓글 수정에 실패했습니다.');
        },
      },
    });
  const { mutate: deleteComment, isPending: isDeletingComment } =
    useDeleteComment({
      mutation: {
        onSuccess: (_, variables) => {
          setDeletedCommentIds((prevCommentIds) => [
            ...prevCommentIds,
            variables.commentId,
          ]);
          setDeleteConfirmCommentId(null);
          queryClient.invalidateQueries({
            queryKey: getGetCommentsQueryKey(issueId),
          });
        },
        onError: () => {
          alert('댓글 삭제에 실패했습니다.');
        },
      },
    });
  const { mutate: postReply, isPending: isPostingReply } =
    usePostIssuesIdComments({
      mutation: {
        onSuccess: () => {
          setReplyingCommentId(null);
          setReplyText('');
          setShowAllComments(true);
          queryClient.invalidateQueries({
            queryKey: getGetCommentsQueryKey(issueId),
          });
        },
        onError: () => {
          alert('답글 작성에 실패했습니다.');
        },
      },
    });

  const startEditComment = (comment: IssueCommentItem) => {
    setEditingCommentId(comment.id);
    setEditingText(editedCommentTexts[comment.id] ?? comment.text);
    setDeleteConfirmCommentId(null);
    setOpenMenuId(null);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  const startDeleteComment = (commentId: string) => {
    setDeleteConfirmCommentId(commentId);
    setEditingCommentId(null);
    setEditingText('');
    setReplyingCommentId(null);
    setReplyText('');
    setOpenMenuId(null);
  };

  const cancelDeleteComment = () => {
    setDeleteConfirmCommentId(null);
  };

  const handleAdoptComment = (commentId: string) => {
    if (!issueId || isAdoptingComment) {
      return;
    }

    setAdoptingCommentId(commentId);
    adoptComment({
      id: issueId,
      commentId,
    });
  };

  const startReplyComment = (commentId: string) => {
    setReplyingCommentId((prevCommentId) =>
      prevCommentId === commentId ? null : commentId,
    );
    setReplyText('');
    setEditingCommentId(null);
    setEditingText('');
    setDeleteConfirmCommentId(null);
    setOpenMenuId(null);
  };

  const cancelReplyComment = () => {
    setReplyingCommentId(null);
    setReplyText('');
  };

  const confirmDeleteComment = () => {
    if (deleteConfirmCommentId === null || isDeletingComment || !issueId) {
      return;
    }

    deleteComment({
      id: issueId,
      commentId: deleteConfirmCommentId,
    });
  };

  const saveEditedComment = (commentId: string) => {
    const nextText = editingText.trim();

    if (!nextText || !issueId) {
      return;
    }

    updateComment({
      id: issueId,
      commentId,
      data: {
        content: nextText,
      },
    });
  };

  const saveReplyComment = (parentCommentId: string) => {
    const nextReplyText = replyText.trim();

    if (!nextReplyText) {
      setIsEmptyReplyModalOpen(true);
      return;
    }

    if (!issueId) {
      return;
    }

    postReply({
      id: issueId,
      data: {
        content: nextReplyText,
        parentId: parentCommentId,
      },
    });
  };

  const formatCommentDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    });
  };

  return (
    <aside className="relative z-10 rounded-lg bg-(--surface-panel) p-5">
      <h2 className="mb-6 typo-semibold-18 text-(--text-primary)">
        댓글수 {remainingComments.length}
      </h2>

      <div className="space-y-5">
        {visibleComments.map((comment) => (
          <div key={comment.id}>
            {(() => {
              const isEditing = editingCommentId === comment.id;
              const isReplying = replyingCommentId === comment.id;
              const displayedText =
                editedCommentTexts[comment.id] ?? comment.text;

              const isCommentAuthor = comment.author.id === currentUserId;
              const isSelectedComment =
                comment.selected || adoptedCommentIds.includes(comment.id);
              const canAdoptComment = isIssueAuthor && !isCommentAuthor;
              const canSaveEdit =
                editingText.trim().length > 0 &&
                editingText.trim() !== displayedText;

              return (
                <div
                  className={comment.isReply ? 'relative ml-12' : 'relative'}
                >
                  {comment.isReply && (
                    <div className="absolute -left-10 top-0 h-16 w-8 rounded-bl-xl border-b border-l border-border" />
                  )}

                  <div
                    className={`rounded-md bg-(--surface-comment) p-5 ${
                      isSelectedComment
                        ? 'border border-(--status-unsaved) shadow-[0_0_18px_rgba(228,99,101,0.35)]'
                        : ''
                    } ${
                      isEditing
                        ? 'border border-(--primary) shadow-[0_0_18px_rgba(255,248,53,0.2)]'
                        : ''
                    } `}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white" />
                        <span className="typo-medium-16 text-(--text-primary)">
                          {comment.author.name}
                        </span>

                        {comment.isReply && (
                          <span className="rounded-sm bg-(--surface-tag) px-3 py-1 text-xs text-(--text-primary)">
                            작성자
                          </span>
                        )}

                        {isEditing && (
                          <span className="rounded-sm border px-3 py-1 text-xs text-(--text-secondary)">
                            수정 중
                          </span>
                        )}
                      </div>

                      <div
                        className="relative flex items-center gap-3"
                        data-comment-menu-root={comment.id}
                      >
                        {isSelectedComment ? (
                          <span className="rounded-full border-transparent border bg-(--status-unsaved) px-4 py-2 text-xs font-bold text-(--status-error-foreground)">
                            채택 +10
                          </span>
                        ) : canAdoptComment ? (
                          <button
                            type="button"
                            disabled={isAdoptingComment}
                            className="flex gap-1 rounded-full border-1 px-4 py-2 text-xs font-bold transition duration-300 hover:bg-(--status-unsaved) hover:border-transparent cursor-pointer"
                            onClick={() => handleAdoptComment(comment.id)}
                          >
                            {adoptingCommentId === comment.id
                              ? '채택 중'
                              : '채택'}
                            <Rocket size={18} />
                          </button>
                        ) : null}

                        {!isEditing && isCommentAuthor && (
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
                        )}

                        {openMenuId === comment.id && (
                          <div className="absolute right-0 top-9 z-30 w-32 overflow-hidden rounded-sm border border-border bg-popover typo-regular-14 text-popover-foreground shadow-(--shadow)">
                            {isCommentAuthor && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEditComment(comment)}
                                  className="block w-full cursor-pointer px-4 py-3 text-left hover:bg-(--surface-selected)"
                                >
                                  수정
                                </button>
                                <button
                                  type="button"
                                  onClick={() => startDeleteComment(comment.id)}
                                  className="block w-full cursor-pointer px-4 py-3 text-left text-(--status-error) hover:bg-(--surface-selected)"
                                >
                                  삭제
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          value={editingText}
                          onChange={(event) =>
                            setEditingText(event.target.value)
                          }
                          className="min-h-28 w-full resize-none rounded-md border border-border bg-(--surface-input) px-4 py-3 typo-regular-14 leading-6 text-(--text-primary) outline-none placeholder:text-(--text-secondary) focus:shadow-[0_0_14px_rgba(255,248,53,0.22)]"
                          placeholder="댓글 내용을 수정해주세요."
                          aria-label="댓글 수정 내용"
                        />

                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={cancelEditComment}
                            className="cursor-pointer text-(--text-primary) hover:bg-(--surface-selected)"
                          >
                            취소
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            disabled={!canSaveEdit || isUpdatingComment}
                            onClick={() => saveEditedComment(comment.id)}
                            className="cursor-pointer bg-(--primary) text-(--primary-foreground) hover:opacity-90 disabled:cursor-not-allowed"
                          >
                            {isUpdatingComment ? '저장 중' : '저장'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="typo-regular-14 leading-6 text-(--text-primary)">
                        {displayedText}
                      </p>
                    )}

                    <div className="mt-3 flex justify-between text-xs text-(--text-secondary)">
                      <span>{formatCommentDate(comment.createdAt)}</span>

                      {!comment.isReply && !isEditing && (
                        <button
                          type="button"
                          onClick={() => startReplyComment(comment.id)}
                          className="cursor-pointer hover:text-(--text-primary)"
                        >
                          {isReplying ? '답글 취소' : '답글'}
                        </button>
                      )}
                    </div>
                  </div>

                  {isReplying && (
                    <div className="relative ml-12 mt-3">
                      <div className="absolute -left-10 top-0 h-16 w-8 rounded-bl-xl border-b border-l border-border" />
                      <div className="rounded-md border border-border bg-(--surface-comment) p-4">
                        <textarea
                          value={replyText}
                          onChange={(event) => setReplyText(event.target.value)}
                          className="min-h-24 w-full resize-none rounded-md border border-border bg-(--surface-input) px-4 py-3 typo-regular-14 leading-6 text-(--text-primary) outline-none placeholder:text-(--text-secondary) focus:shadow-[0_0_14px_rgba(255,248,53,0.22)]"
                          placeholder={`${comment.author.name}님에게 답글을 남겨보세요.`}
                          aria-label="답글 내용"
                        />

                        <div className="mt-3 flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={cancelReplyComment}
                            className="cursor-pointer text-(--text-primary) hover:bg-(--surface-selected)"
                          >
                            취소
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            disabled={isPostingReply}
                            onClick={() => saveReplyComment(comment.id)}
                            className="cursor-pointer bg-(--primary) text-(--primary-foreground) hover:opacity-90 disabled:cursor-not-allowed"
                          >
                            {isPostingReply ? '작성 중' : '답글 작성'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ))}

        {remainingComments.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAllComments(!showAllComments)}
            className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-sm border border-border bg-(--surface-selected) py-3 typo-regular-14 text-(--text-primary) hover:opacity-90"
          >
            {showAllComments
              ? '접기'
              : `댓글 더보기 (${remainingComments.length - 3})`}
          </button>
        )}
      </div>

      <CommonModal
        isOpen={deleteConfirmCommentId !== null}
        title="댓글 삭제"
        description={
          <>
            {deleteConfirmComment?.author.name ?? '작성자'}님의 댓글을
            삭제할까요?
            <br />
            삭제한 댓글은 목록에서 더 이상 보이지 않습니다.
          </>
        }
        cancelText="취소하기"
        confirmText={isDeletingComment ? '삭제 중' : '삭제하기'}
        onClose={cancelDeleteComment}
        onConfirm={confirmDeleteComment}
        confirmButtonClassName="bg-(--status-error) text-(--status-error-foreground) hover:opacity-90"
      />

      <CommonModal
        isOpen={isAdoptErrorModalOpen}
        title="댓글 채택 실패"
        description="댓글을 채택하지 못했습니다. 잠시 후 다시 시도해주세요."
        confirmText="확인하기"
        onClose={() => setIsAdoptErrorModalOpen(false)}
        showCancelButton={false}
      />

      <CommonModal
        isOpen={isEmptyReplyModalOpen}
        title="답글 내용을 입력해주세요"
        description="답글 내용을 작성한 뒤 답글 작성 버튼을 눌러주세요."
        confirmText="확인하기"
        onClose={() => setIsEmptyReplyModalOpen(false)}
        showCancelButton={false}
      />
    </aside>
  );
}

export default IssueCommentList;
