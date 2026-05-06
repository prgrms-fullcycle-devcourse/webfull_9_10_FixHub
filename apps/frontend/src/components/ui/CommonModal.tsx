import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import AlertTriangle from '@/assets/icons/alert-triangle.svg';

type CommonModalProps = {
  isOpen: boolean;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm?: () => void;
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  cancelButtonClassName?: string;
  confirmButtonClassName?: string;
};

function CommonModal({
  isOpen,
  title,
  description,
  icon,
  confirmText = '확인하기',
  cancelText = '취소하기',
  onClose,
  onConfirm,
  closeOnBackdropClick = true,
  showCloseButton = true,
  showCancelButton = true,
  showConfirmButton = true,
  className,
  iconClassName,
  titleClassName,
  descriptionClassName,
  cancelButtonClassName,
  confirmButtonClassName,
}: CommonModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscapeKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscapeKeyDown);

    return () => {
      window.removeEventListener('keydown', handleEscapeKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(5,5,5,0.48)] px-4 py-8"
      onClick={handleBackdropClick}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="common-modal-title"
        className={cn(
          'relative w-full max-w-126 rounded-[28px] bg-[#686989] px-6 py-10 text-center text-(--text-primary) shadow-[0_24px_80px_rgba(0,0,0,0.38)] sm:px-12 sm:py-11',
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-6 top-5 flex size-9 cursor-pointer items-center justify-center rounded-sm text-(--text-primary) transition hover:bg-white/10"
            aria-label="모달 닫기"
          >
            <X size={24} strokeWidth={2.2} />
          </button>
        )}

        <div
          className={cn(
            'mx-auto mb-5 flex size-18 items-center justify-center text-(--text-primary)',
            iconClassName,
          )}
        >
          {icon ?? <AlertTriangle />}
        </div>

        <h2
          id="common-modal-title"
          className={cn(
            'font-display text-[24px] leading-none font-normal text-(--primary) sm:text-[28px]',
            titleClassName,
          )}
        >
          {title}
        </h2>

        {description && (
          <div
            className={cn(
              'mx-auto mt-5 max-w-96 typo-regular-14 leading-6 text-(--text-primary)',
              descriptionClassName,
            )}
          >
            {description}
          </div>
        )}

        {(showCancelButton || showConfirmButton) && (
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {showCancelButton && (
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className={cn(
                  'h-10 min-w-30 cursor-pointer rounded-sm bg-(--secondary) typo-medium-16 text-(--secondary-foreground) hover:opacity-90',
                  cancelButtonClassName,
                )}
              >
                {cancelText}
              </Button>
            )}

            {showConfirmButton && (
              <Button
                type="button"
                onClick={onConfirm ?? onClose}
                className={cn(
                  'h-10 min-w-30 cursor-pointer rounded-sm bg-(--primary) typo-medium-16 text-(--primary-foreground) hover:opacity-90',
                  confirmButtonClassName,
                )}
              >
                {confirmText}
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default CommonModal;
