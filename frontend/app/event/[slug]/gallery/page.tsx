'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { io } from 'socket.io-client';
import { Camera, MonitorPlay } from 'lucide-react';
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
    if (!slideshow || !photos.length) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % photos.length), 5000);
    return () => clearInterval(timer);
  }, [slideshow, photos.length]);

  if (slideshow && photos.length) {
    const photo = photos[index];
    return (
      <main className="grid min-h-screen place-items-center bg-ink p-6 text-cream">
        <button className="absolute right-5 top-5 rounded-lg bg-cream px-4 py-2 font-bold text-moss" onClick={() => setSlideshow(false)}>Close</button>
        <img src={photo.image_url} alt="Slideshow photo" className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-soft" />
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
            <Button disabled={!photos.length} onClick={() => setSlideshow(true)}><MonitorPlay size={16} /> TV mode</Button>
          </div>
        </div>
        <GalleryGrid photos={photos} />
      </section>
    </main>
  );
}
