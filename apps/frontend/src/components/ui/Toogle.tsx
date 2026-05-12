import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

type ToggleProps = {
  checked: boolean;
  onChange: () => void;
};

export default function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={twMerge(
        clsx(
          'relative h-[28px] w-[52px] rounded-full border transition-all duration-200 cursor-pointer',
          checked
            ? 'border-[var(--color-gray-600)] bg-[var(--color-gray-600)]'
            : 'border-white/40',
        ),
      )}
    >
      <span
        className={clsx(
          'absolute top-1/2 h-[20px] w-[20px] -translate-y-1/2 rounded-full bg-white',
          'shadow-sm transition-all duration-200',
          checked ? 'left-[28px]' : 'left-[4px]',
        )}
      />
    </button>
  );
}
