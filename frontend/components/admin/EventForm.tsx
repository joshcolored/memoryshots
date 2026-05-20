'use client';

import { useState } from 'react';
import type { EventRecord, EventType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Field, SelectField } from '@/components/ui/Field';

const eventTypes: EventType[] = ['Wedding', 'Christening', 'Birthday', 'Corporate', 'Anniversary', 'Custom'];

const emptyEvent: EventRecord = {
  title: '',
  slug: '',
  event_type: 'Wedding',
  photo_limit: 24,
  cover_image: '',
  event_date: new Date().toISOString().slice(0, 10),
  is_active: true,
  guestbook_enabled: true,
  watermark_enabled: false
};

export function EventForm({ initial, onSubmit, submitLabel }: { initial?: Partial<EventRecord>; onSubmit: (event: EventRecord) => Promise<void>; submitLabel: string }) {
  const [form, setForm] = useState<EventRecord>({ ...emptyEvent, ...initial } as EventRecord);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await onSubmit(form);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-2xl bg-cream/80 p-5 shadow-soft">
      <Field label="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      <Field label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="john-mary-wedding" />
      <SelectField label="Event type" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value as EventType })}>
        {eventTypes.map((type) => <option key={type}>{type}</option>)}
      </SelectField>
      <Field label="Photo limit per guest" type="number" min={1} max={200} value={form.photo_limit} onChange={(e) => setForm({ ...form, photo_limit: Number(e.target.value) })} required />
      <Field label="Cover image URL" value={form.cover_image || ''} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://..." />
      <Field label="Event date" type="date" value={String(form.event_date).slice(0, 10)} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required />
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
      <Button disabled={busy}>{submitLabel}</Button>
    </form>
  );
}
