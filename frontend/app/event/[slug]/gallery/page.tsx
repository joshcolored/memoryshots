'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { io } from 'socket.io-client';
import { Camera, ChevronLeft, ChevronRight, MonitorPlay, Pause, Play, X } from 'lucide-react';
import { toast } from 'sonner';
import type { EventRecord, Photo } from '@/types';
import { API_URL, publicApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';

export default function GalleryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [slideshow, setSlideshow] = useState(false);
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  async function load() {
    const response = await publicApi.gallery(slug);
    setEvent(response.event);
    setPhotos(response.data);
  }

  useEffect(() => {
    load().catch((error) => toast.error(error.message));
    const socket = io(API_URL);
    socket.emit('join-event', slug);
    socket.on('photo:new', load);
    socket.on('photo:updated', load);
    socket.on('photo:deleted', load);
    return () => {
      socket.disconnect();
    };
  }, [slug]);

  useEffect(() => {
    if (!slideshow || !autoPlay || !photos.length) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % photos.length), 5000);
    return () => clearInterval(timer);
  }, [autoPlay, slideshow, photos.length]);

  useEffect(() => {
    if (index >= photos.length) setIndex(0);
  }, [index, photos.length]);

  function nextPhoto() {
    setIndex((current) => (current + 1) % photos.length);
  }

  function previousPhoto() {
    setIndex((current) => (current - 1 + photos.length) % photos.length);
  }

  if (slideshow && photos.length) {
    const photo = photos[index];
    const queuedPhotos = photos.map((item, photoIndex) => ({ item, photoIndex })).filter(({ photoIndex }) => photoIndex !== index);

    return (
      <main className="min-h-screen bg-ink p-4 text-cream sm:p-6">
        <section className="mx-auto grid max-w-7xl gap-4">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-parchment">{event?.event_type || 'Event'} TV gallery</p>
              <h1 className="text-2xl font-black sm:text-4xl">{event?.title || 'Live gallery'}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => setAutoPlay((current) => !current)}>
                {autoPlay ? <Pause size={16} /> : <Play size={16} />}
                {autoPlay ? 'Pause' : 'Auto'}
              </Button>
              <Button onClick={() => setSlideshow(false)}><X size={16} /> Close</Button>
            </div>
          </header>

          <div className="relative grid min-h-[58vh] place-items-center overflow-hidden rounded-3xl bg-black shadow-soft sm:min-h-[70vh]">
            <img
              src={photo.image_url}
              alt="Featured slideshow photo"
              className="absolute inset-0 h-full w-full scale-105 object-cover opacity-25 blur-2xl"
            />
            <img
              src={photo.image_url}
              alt="Featured slideshow photo"
              className="relative z-10 max-h-[70vh] max-w-full object-contain"
            />
            <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-end justify-between gap-3 rounded-2xl bg-black/45 p-4 backdrop-blur">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-parchment">Now showing</p>
                <h2 className="text-xl font-black">{photo.guest_id?.name || 'Guest'}</h2>
                <p className="text-sm text-parchment">{new Date(photo.created_at).toLocaleString()}</p>
              </div>
              <p className="font-mono text-sm text-parchment">{index + 1} / {photos.length}</p>
            </div>
            <button
              className="absolute left-4 top-1/2 z-20 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-cream/90 text-moss shadow-soft"
              onClick={previousPhoto}
              aria-label="Previous photo"
            >
              <ChevronLeft />
            </button>
            <button
              className="absolute right-4 top-1/2 z-20 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-cream/90 text-moss shadow-soft"
              onClick={nextPhoto}
              aria-label="Next photo"
            >
              <ChevronRight />
            </button>
          </div>

          <section className="rounded-3xl bg-cream/10 p-3 ring-1 ring-cream/15 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-parchment">Queue</h2>
              <Button variant="ghost" onClick={nextPhoto}><ChevronRight size={16} /> Next</Button>
            </div>
            <div className="grid max-h-[34vh] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {queuedPhotos.map(({ item, photoIndex }) => (
                <button
                  key={item._id}
                  className="grid grid-cols-[72px_1fr] gap-3 rounded-2xl bg-cream/10 p-2 text-left ring-1 ring-cream/10 transition hover:bg-cream/20"
                  onClick={() => setIndex(photoIndex)}
                >
                  <img src={item.image_url} alt="Queued gallery thumbnail" className="aspect-square w-full rounded-xl object-cover" />
                  <span className="min-w-0 self-center">
                    <span className="block truncate font-black text-cream">{item.guest_id?.name || 'Guest'}</span>
                    <span className="mt-1 block text-xs text-parchment">{new Date(item.created_at).toLocaleString()}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-moss">{event?.event_type || 'Event'} gallery</p>
            <h1 className="text-4xl font-black text-ink">{event?.title || 'Gallery'}</h1>
          </div>
          <div className="flex gap-2">
            <Link href={`/event/${slug}`}><Button variant="ghost"><Camera size={16} /> Camera</Button></Link>
            <Button disabled={!photos.length} onClick={() => { setAutoPlay(true); setSlideshow(true); }}><MonitorPlay size={16} /> TV mode</Button>
          </div>
        </div>
        <GalleryGrid photos={photos} />
      </section>
    </main>
  );
}
