'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { io } from 'socket.io-client';
import { Camera, ChevronLeft, ChevronRight, MonitorPlay, Pause, Play, X } from 'lucide-react';
import { toast } from 'sonner';
import type { EventRecord, Photo } from '@/types';
import { API_URL, publicApi, type PaginationMeta } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { StoriesCarousel } from '@/components/gallery/StoriesCarousel';
import { Spinner } from '@/components/ui/Spinner';

const GALLERY_LIMIT = 10;

export default function GalleryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [slideshow, setSlideshow] = useState(false);
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [tvLoading, setTvLoading] = useState(false);
  const [galleryPage, setGalleryPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const pageRef = useRef(1);

  const load = useCallback(async (page = pageRef.current) => {
    const response = await publicApi.gallery(slug, { page, limit: GALLERY_LIMIT });
    const meta = response.meta || { page, limit: GALLERY_LIMIT, total: response.data.length, total_pages: 1 };
    setEvent(response.event);
    setPhotos(response.data);
    setPagination(meta);
    setGalleryPage(meta.page);
    pageRef.current = meta.page;
  }, [slug]);

  useEffect(() => {
    load().catch((error) => toast.error(error.message));
    const socket = io(API_URL);
    socket.emit('join-event', slug);
    const refreshGallery = () => load().catch((error) => toast.error(error.message));
    socket.on('photo:new', refreshGallery);
    socket.on('photo:updated', refreshGallery);
    socket.on('photo:deleted', refreshGallery);
    return () => {
      socket.disconnect();
    };
  }, [load, slug]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSlideshow(params.get('tv') === '1');
  }, []);

  useEffect(() => {
    if (!slideshow || !autoPlay || photos.length < 2) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % photos.length);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [autoPlay, index, slideshow, photos.length]);

  useEffect(() => {
    if (index >= photos.length) setIndex(0);
  }, [index, photos.length]);

  function nextPhoto() {
    if (!photos.length) return;
    setIndex((current) => (current + 1) % photos.length);
  }

  function previousPhoto() {
    if (!photos.length) return;
    setIndex((current) => (current - 1 + photos.length) % photos.length);
  }

  function goToPage(page: number) {
    load(page).catch((error) => toast.error(error.message));
  }

  function openTvMode() {
    setTvLoading(true);
    setAutoPlay(true);
    setSlideshow(true);
    window.history.replaceState(null, '', `/event/${slug}/gallery?tv=1`);
    window.setTimeout(() => setTvLoading(false), 450);
  }

  if (slideshow && photos.length) {
    const photo = photos[index];
    const queuedPhotos = photos.map((item, photoIndex) => ({ item, photoIndex })).filter(({ photoIndex }) => photoIndex !== index);

    return (
      <main className="min-h-screen overflow-hidden bg-black text-cream">
        <section className="grid min-h-screen grid-rows-[auto_1fr_auto] gap-3 p-3 sm:gap-4 sm:p-5">
          <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream/10 px-4 py-3 backdrop-blur ring-1 ring-cream/10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-parchment">MemoryShots TV</p>
              <h1 className="text-xl font-black sm:text-3xl">{event?.title || 'Live gallery'}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => setAutoPlay((current) => !current)}>
                {autoPlay ? <Pause size={16} /> : <Play size={16} />}
                {autoPlay ? 'Pause' : 'Auto'}
              </Button>
              <Button onClick={() => {
                setSlideshow(false);
                window.history.replaceState(null, '', `/event/${slug}/gallery`);
              }}><X size={16} /> Close</Button>
            </div>
          </header>

          <div className="relative rounded-[2rem] bg-zinc-950 shadow-[0_0_0_10px_rgba(255,248,236,0.08),0_40px_120px_rgba(0,0,0,0.7)] ring-1 ring-cream/10">
            <StoriesCarousel photos={photos} index={index} autoPlay={autoPlay} fullscreen onIndexChange={setIndex} />
            <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-end justify-between gap-3 rounded-2xl bg-black/55 p-4 backdrop-blur">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-parchment">TV Stories - Now showing</p>
                <h2 className="text-xl font-black">{photo.guest_id?.name || 'Guest'}</h2>
                <p className="text-sm text-parchment">{new Date(photo.created_at).toLocaleString()}</p>
              </div>
              <p className="font-mono text-sm text-parchment">{index + 1} / {photos.length}</p>
            </div>
          </div>

          <section className="rounded-3xl bg-cream/10 p-3 ring-1 ring-cream/15 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-parchment">Up Next Queue</h2>
                <p className="mt-1 text-xs text-parchment">Tap a memory to jump it into the stories carousel.</p>
              </div>
              <Button variant="ghost" onClick={nextPhoto}><ChevronRight size={16} /> Next</Button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {queuedPhotos.map(({ item, photoIndex }) => (
                <button
                  key={item._id}
                  className="grid min-w-[260px] grid-cols-[72px_1fr] gap-3 rounded-2xl bg-cream/10 p-2 text-left ring-1 ring-cream/10 transition hover:bg-cream/20"
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
            <a
              href={`/event/${slug}/gallery?tv=1`}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                photos.length ? 'bg-moss text-cream hover:bg-ink' : 'pointer-events-none bg-moss text-cream opacity-50'
              }`}
              onClick={(event) => {
                event.preventDefault();
                openTvMode();
              }}
            >
              {tvLoading ? <Spinner /> : <MonitorPlay size={16} />}
              {tvLoading ? 'Opening...' : 'TV Carousel'}
            </a>
          </div>
        </div>
        {photos.length > 0 && (
          <section className="mb-8 -mx-2 rounded-3xl bg-cream/80 p-2 shadow-soft sm:mx-0 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-moss">Live Stories</p>
                <h2 className="text-xl font-black text-ink sm:text-2xl">Now showing memories</h2>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={previousPhoto}><ChevronLeft size={16} /> Prev</Button>
                <Button onClick={nextPhoto}>Next <ChevronRight size={16} /></Button>
              </div>
            </div>

            <StoriesCarousel photos={photos} index={index} autoPlay={false} onIndexChange={setIndex} />

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:grid sm:max-h-60 sm:grid-cols-2 sm:overflow-y-auto lg:grid-cols-3">
              {photos.map((photo, photoIndex) => (
                <button
                  key={photo._id}
                  className={`grid min-w-[245px] grid-cols-[64px_1fr] gap-3 rounded-2xl p-2 text-left ring-1 transition sm:min-w-0 ${
                    photoIndex === index ? 'bg-moss text-cream ring-moss' : 'bg-white/70 text-moss ring-moss/10'
                  }`}
                  onClick={() => setIndex(photoIndex)}
                >
                  <img src={photo.image_url} alt="Queue thumbnail" className="aspect-square w-full rounded-xl object-cover" />
                  <span className="min-w-0 self-center">
                    <span className="block truncate font-black">{photo.guest_id?.name || 'Guest'}</span>
                    <span className="mt-1 block text-xs opacity-80">{new Date(photo.created_at).toLocaleString()}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
        <GalleryGrid photos={photos} />
        {pagination && pagination.total_pages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant="ghost" disabled={galleryPage <= 1} onClick={() => goToPage(galleryPage - 1)}>
              <ChevronLeft size={16} /> Prev
            </Button>
            <span className="rounded-lg bg-cream/80 px-4 py-2 text-sm font-black text-moss shadow-soft">
              Page {galleryPage} / {pagination.total_pages}
            </span>
            <Button disabled={galleryPage >= pagination.total_pages} onClick={() => goToPage(galleryPage + 1)}>
              Next <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
