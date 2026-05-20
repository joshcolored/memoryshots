import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }>;

export function Button({ children, className = '', variant = 'primary', ...props }: ButtonProps) {
  const styles = {
    primary: 'bg-moss text-cream hover:bg-ink',
    ghost: 'bg-cream text-moss ring-1 ring-moss/20 hover:bg-parchment/60',
    danger: 'bg-red-700 text-white hover:bg-red-800'
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
