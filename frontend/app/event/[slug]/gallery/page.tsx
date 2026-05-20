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
    return () => {
      socket.disconnect();
    };
  }, [slug]);

  useEffect(() => {
    if (!slideshow || !autoPlay || !photos.length) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % photos.length), 5000);
    return () => clearInterval(timer);
  }, [autoPlay, slideshow, photos.length]);

  function nextPhoto() {
    setIndex((current) => (current + 1) % photos.length);
  }

  function previousPhoto() {
    setIndex((current) => (current - 1 + photos.length) % photos.length);
  }

  if (slideshow && photos.length) {
    const photo = photos[index];
    const nextPhotos = photos.filter((item) => item._id !== photo._id).slice(0, 6);

    return (
      <main className="min-h-screen bg-ink p-4 text-cream sm:p-8">
        <section className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-5 lg:grid-cols-[1fr_280px]">
          <div className="relative grid min-h-[65vh] place-items-center overflow-hidden rounded-3xl bg-black shadow-soft">
            <img
              src={photo.image_url}
              alt="Featured slideshow photo"
              className="absolute inset-0 h-full w-full scale-105 object-cover opacity-25 blur-2xl"
            />
            <img
              src={photo.image_url}
              alt="Featured slideshow photo"
              className="relative z-10 max-h-[78vh] max-w-full object-contain"
            />
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

          <aside className="grid content-between gap-4 rounded-3xl bg-cream/10 p-4 ring-1 ring-cream/15">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-parchment">{event?.event_type || 'Event'} TV gallery</p>
              <h1 className="mt-2 text-3xl font-black">{event?.title || 'Live gallery'}</h1>
              <p className="mt-3 text-sm text-parchment">
                Showing {index + 1} of {photos.length} approved memories
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:grid-cols-2">
              {nextPhotos.map((item) => (
                <button key={item._id} className="overflow-hidden rounded-xl ring-1 ring-cream/15" onClick={() => setIndex(photos.findIndex((photoItem) => photoItem._id === item._id))}>
                  <img src={item.image_url} alt="Gallery thumbnail" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>

            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="ghost" onClick={() => setAutoPlay((current) => !current)}>
                  {autoPlay ? <Pause size={16} /> : <Play size={16} />}
                  {autoPlay ? 'Pause' : 'Auto'}
                </Button>
                <Button variant="ghost" onClick={nextPhoto}><ChevronRight size={16} /> Next</Button>
              </div>
              <Button onClick={() => setSlideshow(false)}><X size={16} /> Close TV mode</Button>
            </div>
          </aside>
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
