import { useState } from 'react';
import { Trash2 } from 'lucide-react';

import IssueDeleteModal from '@/pages/issue/IssueDeleteModal';
// import { useDeleteIssue } from '@/hooks/useDeleteIssue';

interface IssueDeleteButtonProps {
  teamId?: string;
  issueId?: string;
}

function IssueDeleteButton({
  teamId: _teamId,
  issueId: _issueId,
}: IssueDeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // const { mutate, isPending } = useDeleteIssue();
  const isPending = false;

  const handleConfirmDelete = () => {
    // if (!_teamId || !_issueId) return;

    // mutate(
    //   { teamId: _teamId, issueId: _issueId },
    //   {
    //     onSuccess: () => {
    //       setIsOpen(false);
    //     },
    //     onError: (error) => {
    //       const message =
    //         error instanceof Error
    //           ? error.message
    //           : '이슈 삭제 중 오류가 발생했습니다.';
    //
    //       alert(message);
    //     },
    //   },
    // );

    alert('삭제 UI만 구현된 상태입니다.');
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-16 w-20 cursor-pointer items-center justify-center rounded-md bg-(--surface-overlay) text-(--text-primary) shadow-(--shadow) hover:bg-(--surface-selected)"
        aria-label="삭제"
      >
        <Trash2 size={30} strokeWidth={1.7} />
      </button>

      <IssueDeleteModal
        isOpen={isOpen}
        isPending={isPending}
        onClose={() => {
          if (isPending) return;
          setIsOpen(false);
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

export default IssueDeleteButton;
