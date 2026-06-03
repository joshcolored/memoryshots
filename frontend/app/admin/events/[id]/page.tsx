'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, Download, ExternalLink, MailOpen, Trash2 } from 'lucide-react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import type { EventRecord, GuestbookMessage, Photo } from '@/types';
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
  const [guestbookMessages, setGuestbookMessages] = useState<GuestbookMessage[]>([]);
  const [guests, setGuests] = useState<Array<{ _id: string; name: string; photo_count: number }>>([]);
  const [guestFilter, setGuestFilter] = useState('');

  function sortGuestbookMessages(messages: GuestbookMessage[]) {
    return [...messages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async function load() {
    const token = getAdminToken();
    if (!token) return router.push('/admin/login');
    const [eventRes, photoRes, guestRes, guestbookRes] = await Promise.all([
      adminApi.event(token, id),
      adminApi.photos(token, id, guestFilter || undefined),
      adminApi.guests(token, id),
      adminApi.guestbookMessages(token, id)
    ]);
    setEvent(eventRes.data);
    setStats(eventRes.stats);
    setPhotos(photoRes.data);
    setGuests(guestRes.data);
    setGuestbookMessages(sortGuestbookMessages(guestbookRes.data));
  }

  useEffect(() => {
    load().catch((error) => toast.error(error.message));
  }, [guestFilter]);

  useEffect(() => {
    if (!event?.slug) return;
    const socket = io(API_URL);
    socket.emit('join-event', event.slug);
    socket.on('photo:new', () => {
      load().catch((error) => toast.error(error.message));
    });
    socket.on('guestbook:new', ({ message }: { message?: GuestbookMessage }) => {
      if (!message) return;
      setGuestbookMessages((current) => {
        if (current.some((item) => item._id === message._id)) return current;
        return sortGuestbookMessages([message, ...current]);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [event?.slug, guestFilter]);

  async function save(payload: EventRecord, coverImageFile?: File | null) {
    const token = getAdminToken();
    if (!token) return;
    const response = await adminApi.updateEvent(token, id, payload, { coverImageFile });
    setEvent(response.data);
    toast.success('Event updated');
  }

  async function setStatus(photoId: string, status: Photo['status']) {
    const token = getAdminToken();
    if (!token) return;
    const currentPhoto = photos.find((photo) => photo._id === photoId);
    await adminApi.setPhotoStatus(token, photoId, status);
    setPhotos((current) => current.map((photo) => (photo._id === photoId ? { ...photo, status } : photo)));
    if (currentPhoto?.status !== status) {
      setStats((current) => ({
        ...current,
        approved_total: (current.approved_total || 0) + (status === 'approved' ? 1 : currentPhoto?.status === 'approved' ? -1 : 0),
        pending_total: (current.pending_total || 0) + (status === 'pending' ? 1 : currentPhoto?.status === 'pending' ? -1 : 0)
      }));
    }
    toast.success('Photo updated');
  }

  async function removePhoto(photoId: string) {
    const token = getAdminToken();
    if (!token) return;
    const currentPhoto = photos.find((photo) => photo._id === photoId);
    await adminApi.deletePhoto(token, photoId);
    setPhotos((current) => current.filter((photo) => photo._id !== photoId));
    setStats((current) => ({
      ...current,
      photo_total: Math.max((current.photo_total || 0) - 1, 0),
      approved_total: Math.max((current.approved_total || 0) - (currentPhoto?.status === 'approved' ? 1 : 0), 0),
      pending_total: Math.max((current.pending_total || 0) - (currentPhoto?.status === 'pending' ? 1 : 0), 0)
    }));
    toast.success('Photo deleted');
  }

  async function markGuestbookRead(messageId: string) {
    const token = getAdminToken();
    if (!token) return;
    const response = await adminApi.markGuestbookRead(token, messageId);
    setGuestbookMessages((current) => current.map((item) => (item._id === messageId ? response.data : item)));
    toast.success('Message marked as read');
  }

  if (!event) return <main className="min-h-screen px-5 py-8 text-moss">Loading event...</main>;

  const unreadMessages = guestbookMessages.filter((item) => !item.read_at).length;
  const readMessages = guestbookMessages.length - unreadMessages;

  return (
    <main className="min-h-screen px-5 py-8">
      <section className="mx-auto grid max-w-7xl gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black text-ink">{event.title}</h1>
            <p className="mt-1 text-moss">{stats.photo_total || 0} uploads · {stats.guest_total || 0} guests · {stats.pending_total || 0} pending</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => router.push('/admin/dashboard')}><ArrowLeft size={16} /> Dashboard</Button>
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
            <Button
              variant="danger"
              onClick={async () => {
                const token = getAdminToken();
                if (!token) return;
                const confirmed = window.confirm(`Delete "${event.title}" and all of its photos, guests, and messages?`);
                if (!confirmed) return;
                await adminApi.deleteEvent(token, id);
                toast.success('Event deleted');
                router.push('/admin/dashboard');
              }}
            >
              <Trash2 size={16} /> Delete Event
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <EventForm initial={event} submitLabel="Save event" onSubmit={save} />
          <div className="grid gap-6">
            <div className="rounded-2xl bg-cream/80 p-5 shadow-soft">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-ink">Guestbook</h2>
                  <p className="mt-1 text-sm text-moss">{guestbookMessages.length} messages</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm font-black">
                  <span className="rounded-lg bg-moss px-3 py-2 text-cream">Unread {unreadMessages}</span>
                  <span className="rounded-lg bg-white/70 px-3 py-2 text-moss ring-1 ring-moss/10">Read {readMessages}</span>
                </div>
              </div>

              {guestbookMessages.length ? (
                <div className="grid max-h-[18rem] gap-3 overflow-y-auto pr-1">
                  {guestbookMessages.map((item) => (
                    <article key={item._id} className="rounded-xl bg-white/70 p-4 ring-1 ring-moss/10">
                      <div className="mb-2 flex flex-wrap items-start justify-between gap-2 text-sm text-moss">
                        <div className="grid gap-1">
                          <span className="font-black">{item.guest_id?.name || 'Guest'}</span>
                          <span className="font-semibold">{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                        <span className={`rounded-lg px-2.5 py-1 text-xs font-black uppercase tracking-widest ${item.read_at ? 'bg-white text-moss ring-1 ring-moss/10' : 'bg-moss text-cream'}`}>
                          {item.read_at ? 'Read' : 'Unread'}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-ink">{item.message}</p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-black uppercase tracking-widest text-moss">{item.status}</p>
                        {item.read_at ? (
                          <span className="inline-flex items-center gap-1 text-xs font-black text-moss"><Check size={14} /> Read</span>
                        ) : (
                          <Button variant="ghost" className="min-h-9 px-3 py-2 text-sm" onClick={() => markGuestbookRead(item._id)}>
                            <MailOpen size={15} /> Mark read
                          </Button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-white/60 p-6 text-center font-semibold text-moss">No guestbook messages yet.</div>
              )}
            </div>

            <QRCodePanel slug={event.slug} title={event.title} eventType={event.event_type} eventDate={event.event_date} coverImage={event.cover_image} />
          </div>
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
