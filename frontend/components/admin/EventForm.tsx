'use client';

import { useEffect, useState } from 'react';
import type { EventRecord, EventType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Field, SelectField } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';

const eventTypes: EventType[] = ['Wedding', 'Christening', 'Birthday', 'Corporate', 'Anniversary', 'Custom'];

const emptyEvent: EventRecord = {
  title: '',
  slug: '',
  event_type: 'Wedding',
  photo_limit: 16,
  cover_image: '',
  event_date: new Date().toISOString().slice(0, 10),
  is_active: true,
  guestbook_enabled: true,
  watermark_enabled: false
};

export function EventForm({
  initial,
  onSubmit,
  submitLabel
}: {
  initial?: Partial<EventRecord>;
  onSubmit: (event: EventRecord, coverImageFile?: File | null) => Promise<void>;
  submitLabel: string;
}) {
  const [form, setForm] = useState<EventRecord>({ ...emptyEvent, ...initial } as EventRecord);
  const [coverMode, setCoverMode] = useState<'link' | 'upload'>('link');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!coverImageFile) {
      setCoverPreviewUrl('');
      return;
    }

    const url = URL.createObjectURL(coverImageFile);
    setCoverPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [coverImageFile]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await onSubmit(form, coverMode === 'upload' ? coverImageFile : null);
    } finally {
      setBusy(false);
    }
  }

  const coverPreview = coverMode === 'upload' ? coverPreviewUrl : form.cover_image || '';
  const isSavedEvent = Boolean(initial?._id || initial?.id);

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-2xl bg-cream/80 p-5 shadow-soft">
      <Field label="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      {form.slug && (
        <div className="rounded-lg bg-white/60 p-3 text-sm font-semibold text-moss">
          Event link slug
          <div className="mt-1 break-all font-mono text-xs text-ink">{form.slug}</div>
        </div>
      )}
      <SelectField label="Event type" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value as EventType })}>
        {eventTypes.map((type) => <option key={type}>{type}</option>)}
      </SelectField>
      <Field label="Photo limit per guest" type="number" min={1} max={16} value={form.photo_limit} onChange={(e) => setForm({ ...form, photo_limit: Number(e.target.value) })} required />
      <div className="grid gap-3 rounded-xl bg-white/50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-semibold text-moss">Cover image</span>
          <div className="grid grid-cols-2 rounded-lg bg-cream p-1 ring-1 ring-moss/15">
            <button
              type="button"
              className={`rounded-md px-4 py-2 text-sm font-black transition ${coverMode === 'link' ? 'bg-moss text-cream' : 'text-moss'}`}
              onClick={() => setCoverMode('link')}
            >
              Link
            </button>
            <button
              type="button"
              className={`rounded-md px-4 py-2 text-sm font-black transition ${coverMode === 'upload' ? 'bg-moss text-cream' : 'text-moss'}`}
              onClick={() => setCoverMode('upload')}
            >
              Upload
            </button>
          </div>
        </div>

        {coverMode === 'link' ? (
          <Field label="Cover image URL" value={form.cover_image || ''} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://..." />
        ) : (
          <label className="grid gap-2 text-sm font-semibold text-moss">
            Cover image file
            <input
              className="min-h-12 rounded-lg border border-moss/20 bg-cream px-4 py-3 text-ink outline-none file:mr-4 file:rounded-md file:border-0 file:bg-moss file:px-3 file:py-2 file:text-sm file:font-bold file:text-cream focus:border-moss"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setCoverImageFile(event.target.files?.[0] || null)}
            />
          </label>
        )}

        {coverPreview && (
          <img src={coverPreview} alt="Cover preview" className="aspect-[16/9] w-full rounded-lg object-cover ring-1 ring-moss/10" />
        )}
      </div>
      <Field label="Event date" type="date" value={String(form.event_date).slice(0, 10)} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required />
      {!isSavedEvent && (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex items-center gap-2 rounded-lg bg-white/60 p-3 text-sm font-semibold text-moss">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active
          </label>
          <label className="flex items-center gap-2 rounded-lg bg-white/60 p-3 text-sm font-semibold text-moss">
            <input type="checkbox" checked={Boolean(form.guestbook_enabled)} onChange={(e) => setForm({ ...form, guestbook_enabled: e.target.checked })} /> Guestbook
          </label>
          <label className="flex items-center gap-2 rounded-lg bg-white/60 p-3 text-sm font-semibold text-moss">
            <input type="checkbox" checked={Boolean(form.watermark_enabled)} onChange={(e) => setForm({ ...form, watermark_enabled: e.target.checked })} /> Watermark
          </label>
        </div>
      )}
      <Button disabled={busy}>{busy && <Spinner />} {busy ? 'Saving...' : submitLabel}</Button>
    </form>
  );
}
