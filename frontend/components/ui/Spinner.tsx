export function Spinner({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M21 12a9 9 0 0 0-9-9v4a5 5 0 0 1 5 5h4Z" />
    </svg>
  );
}
