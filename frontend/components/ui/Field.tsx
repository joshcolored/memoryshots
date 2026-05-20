import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

export function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-moss">
      {label}
      <input className="min-h-12 rounded-lg border border-moss/20 bg-cream px-4 text-ink outline-none focus:border-moss" {...props} />
    </label>
  );
}

export function SelectField({ label, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-moss">
      {label}
      <select className="min-h-12 rounded-lg border border-moss/20 bg-cream px-4 text-ink outline-none focus:border-moss" {...props}>
        {children}
      </select>
    </label>
  );
}

export function TextAreaField({ label, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-moss">
      {label}
      <textarea className="min-h-28 rounded-lg border border-moss/20 bg-cream px-4 py-3 text-ink outline-none focus:border-moss" {...props} />
    </label>
  );
}
