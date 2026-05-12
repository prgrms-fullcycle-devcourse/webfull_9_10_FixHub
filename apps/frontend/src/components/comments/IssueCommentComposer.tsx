import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  getGetCommentsQueryKey,
  usePostIssuesIdComments,
} from '@/api/generated';
import { Button } from '@/components/ui/button';
import CommonModal from '@/components/ui/CommonModal';

type IssueCommentComposerProps = {
  issueId: string;
};

function IssueCommentComposer({ issueId }: IssueCommentComposerProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [isEmptyContentModalOpen, setIsEmptyContentModalOpen] = useState(false);

  const { mutate: postComment, isPending } = usePostIssuesIdComments({
    mutation: {
      onSuccess: () => {
        setContent('');
        queryClient.invalidateQueries({
          queryKey: getGetCommentsQueryKey(issueId),
        });
      },
      onError: () => {
        alert('댓글 작성에 실패했습니다.');
      },
    },
  });

  const handlePostComment = () => {
    const nextContent = content.trim();

    if (!nextContent) {
      setIsEmptyContentModalOpen(true);
      return;
    }

    postComment({
      id: issueId,
      data: {
        content: nextContent,
        parentId: null,
      },
    });
  };

  return (
    <div className="rounded-md bg-(--surface-panel) p-7">
      <div className="mb-5 flex items-center">
        <h2 className="typo-semibold-18 text-(--text-primary)">
          해결 제안 하기
        </h2>

        <div className="ml-auto flex items-center gap-3">
          <Button
            type="button"
            variant="default"
            disabled={isPending}
            onClick={handlePostComment}
            className="h-12 rounded-sm px-6 typo-medium-16 text-(--text-inverse) hover:opacity-90"
          >
            {isPending ? '작성 중' : '댓글 작성'}
          </Button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        className="h-42.5 w-full resize-none rounded-md border border-border bg-(--surface-input) p-5 text-(--text-primary) outline-none placeholder:text-(--text-muted)"
        placeholder="해결 제안을 입력하세요"
      />

      <CommonModal
        isOpen={isEmptyContentModalOpen}
        title="댓글 내용을 입력해주세요"
        description="해결 제안을 작성한 뒤 댓글 작성 버튼을 눌러주세요."
        confirmText="확인하기"
        onClose={() => setIsEmptyContentModalOpen(false)}
        showCancelButton={false}
      />
    </div>
  );
}

export default IssueCommentComposer;
