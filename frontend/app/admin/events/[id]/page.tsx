'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { EventRecord, Photo } from '@/types';
import { adminApi, API_URL, APP_URL } from '@/lib/api';
import { getAdminToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { EventForm } from '@/components/admin/EventForm';
import { QRCodePanel } from '@/components/admin/QRCodePanel';

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [guests, setGuests] = useState<Array<{ _id: string; name: string; photo_count: number }>>([]);
  const [guestFilter, setGuestFilter] = useState('');

  async function load() {
    const token = getAdminToken();
    if (!token) return router.push('/admin/login');
    const [eventRes, photoRes, guestRes] = await Promise.all([
      adminApi.event(token, id),
      adminApi.photos(token, id, guestFilter || undefined),
      adminApi.guests(token, id)
    ]);
    setEvent(eventRes.data);
    setStats(eventRes.stats);
    setPhotos(photoRes.data);
    setGuests(guestRes.data);
  }

  useEffect(() => {
    load().catch((error) => toast.error(error.message));
  }, [guestFilter]);

  async function save(payload: EventRecord) {
    const token = getAdminToken();
    if (!token) return;
    const response = await adminApi.updateEvent(token, id, payload);
    setEvent(response.data);
    toast.success('Event updated');
  }

  async function setStatus(photoId: string, status: Photo['status']) {
    const token = getAdminToken();
    if (!token) return;
    await adminApi.setPhotoStatus(token, photoId, status);
    toast.success('Photo updated');
    await load();
  }

  async function removePhoto(photoId: string) {
    const token = getAdminToken();
    if (!token) return;
    await adminApi.deletePhoto(token, photoId);
    toast.success('Photo deleted');
    await load();
  }

  if (!event) return <main className="min-h-screen px-5 py-8 text-moss">Loading event...</main>;

  return (
    <main className="min-h-screen px-5 py-8">
      <section className="mx-auto grid max-w-7xl gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black text-ink">{event.title}</h1>
            <p className="mt-1 text-moss">{stats.photo_total || 0} uploads · {stats.guest_total || 0} guests · {stats.pending_total || 0} pending</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`${APP_URL}/event/${event.slug}`} target="_blank"><Button variant="ghost"><ExternalLink size={16} /> Guest link</Button></a>
            <Button onClick={async () => {
              const token = getAdminToken();
              if (!token) return;
              const response = await fetch(`${API_URL}/api/admin/events/${id}/photos.zip`, { headers: { Authorization: `Bearer ${token}` } });
              if (!response.ok) return toast.error('Download failed');
              const blob = await response.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${event.slug}-photos.zip`;
              a.click();
              URL.revokeObjectURL(url);
            }}><Download size={16} /> ZIP</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <EventForm initial={event} submitLabel="Save event" onSubmit={save} />
          <QRCodePanel slug={event.slug} />
        </div>

        <div className="rounded-2xl bg-cream/80 p-5 shadow-soft">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-ink">Photos</h2>
            <select className="min-h-11 rounded-lg border border-moss/20 bg-cream px-3 text-moss" value={guestFilter} onChange={(e) => setGuestFilter(e.target.value)}>
              <option value="">All guests</option>
              {guests.map((guest) => <option key={guest._id} value={guest._id}>{guest.name} ({guest.photo_count})</option>)}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <article key={photo._id} className="overflow-hidden rounded-2xl bg-white/70">
                <img src={photo.image_url} alt={photo.original_filename} className="aspect-square w-full object-cover" />
                <div className="grid gap-3 p-3">
                  <div className="flex items-center justify-between text-sm text-moss">
                    <span>{photo.guest_id?.name || 'Guest'}</span>
                    <span className="font-bold">{photo.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {photo.status !== 'approved' && (
                      <Button variant="ghost" onClick={() => setStatus(photo._id, 'approved')}>Approve</Button>
                    )}
                    {photo.status !== 'hidden' && (
                      <Button variant="ghost" className={photo.status === 'approved' ? 'col-span-2' : ''} onClick={() => setStatus(photo._id, 'hidden')}>Hide</Button>
                    )}
                    <Button variant="danger" className="col-span-2" onClick={() => removePhoto(photo._id)}><Trash2 size={16} /> Delete</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
