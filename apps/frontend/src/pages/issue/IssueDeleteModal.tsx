interface IssueDeleteModalProps {
  isOpen: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function IssueDeleteModal({
  isOpen,
  isPending = false,
  onClose,
  onConfirm,
}: IssueDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-md bg-(--surface-panel) p-6 shadow-(--shadow)">
        <div className="flex flex-col gap-3">
          <h2 className="typo-semibold-18 text-(--text-primary)">
            이슈를 삭제하시겠습니까?
          </h2>

          <p className="typo-regular-14 text-(--text-secondary)">
            삭제한 이슈는 되돌릴 수 없습니다.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="h-11 cursor-pointer rounded-md bg-(--surface-overlay) px-5 typo-medium-16 text-(--text-primary) hover:bg-(--surface-selected) disabled:cursor-not-allowed disabled:opacity-50"
          >
            취소
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="h-11 cursor-pointer rounded-md bg-primary px-5 typo-medium-16 text-(--text-inverse) hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

export default IssueDeleteModal;
