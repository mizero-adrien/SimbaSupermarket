'use client';

interface Props {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export default function GoogleAuthButton({ label, onClick, disabled, className = '' }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-3 border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text font-semibold py-3 rounded-lg hover:border-[#16a34a] hover:bg-[#16a34a]/5 disabled:opacity-60 transition-all ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" role="img">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.28 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C35.087 6.053 29.847 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.652-.389-3.917z"/>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C35.087 6.053 29.847 4 24 4c-7.682 0-14.35 4.327-17.694 10.691z"/>
        <path fill="#4CAF50" d="M24 44c5.846 0 11.086-2.053 15.222-5.472l-7.03-5.951C30.153 34.48 27.24 36 24 36c-5.26 0-9.621-3.29-11.283-7.946l-6.53 5.025C9.472 39.556 16.227 44 24 44z"/>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.357 3.824-4.07 6.84-7.111 8.577l.003-.002 7.03 5.951C34.722 41.156 44 34 44 24c0-1.341-.138-2.652-.389-3.917z"/>
      </svg>
      <span>{label}</span>
    </button>
  );
}