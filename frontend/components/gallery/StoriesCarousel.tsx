'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { BlossomCarousel, type BlossomCarouselHandle } from '@blossom-carousel/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Photo } from '@/types';
import { Spinner } from '@/components/ui/Spinner';

type Props = {
  photos: Photo[];
  index: number;
  autoPlay?: boolean;
  fullscreen?: boolean;
  onIndexChange: (index: number) => void;
};

const STORY_DURATION_MS = 3000;

export function StoriesCarousel({ photos, index, autoPlay = true, fullscreen = false, onIndexChange }: Props) {
  const carouselRef = useRef<BlossomCarouselHandle>(null);
  const ignoreScrollSyncUntilRef = useRef(0);
  const scrollSyncTimerRef = useRef<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const safeIndex = photos.length ? Math.min(index, photos.length - 1) : 0;

  const progressKey = useMemo(() => `${safeIndex}-${autoPlay ? 'play' : 'pause'}`, [autoPlay, safeIndex]);

  useEffect(() => {
    const element = carouselRef.current?.element;
    const slide = element?.querySelector<HTMLElement>(`[data-story-slide="${safeIndex}"]`);
    ignoreScrollSyncUntilRef.current = Date.now() + 650;
    if (scrollSyncTimerRef.current) window.clearTimeout(scrollSyncTimerRef.current);
    scrollSyncTimerRef.current = window.setTimeout(() => {
      ignoreScrollSyncUntilRef.current = 0;
    }, 650);
    slide?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

    return () => {
      if (scrollSyncTimerRef.current) window.clearTimeout(scrollSyncTimerRef.current);
    };
  }, [safeIndex]);

  function markLoaded(photoId: string) {
    setLoadedImages((current) => ({ ...current, [photoId]: true }));
  }

  function nextStory() {
    if (!photos.length) return;
    onIndexChange((safeIndex + 1) % photos.length);
  }

  function previousStory() {
    if (!photos.length) return;
    onIndexChange((safeIndex - 1 + photos.length) % photos.length);
  }

  function syncActiveFromScroll() {
    const element = carouselRef.current?.element;
    if (!element) return;
    if (Date.now() < ignoreScrollSyncUntilRef.current) return;

    const slides = Array.from(element.querySelectorAll<HTMLElement>('[data-story-slide]'));
    const center = element.scrollLeft + element.clientWidth / 2;
    const active = slides.reduce(
      (closest, slide, slideIndex) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const distance = Math.abs(slideCenter - center);
        return distance < closest.distance ? { distance, index: slideIndex } : closest;
      },
      { distance: Number.POSITIVE_INFINITY, index: safeIndex }
    );

    if (active.index !== safeIndex) onIndexChange(active.index);
  }

  if (!photos.length) return null;

  return (
    <div className={`stories-shell ${fullscreen ? 'stories-shell-fullscreen' : ''}`}>
      <div className="stories-progress" aria-hidden>
        {photos.map((photo, photoIndex) => (
          <span key={photo._id} className="stories-progress-track">
            <span
              key={photoIndex === safeIndex ? progressKey : photo._id}
              className={`stories-progress-fill ${photoIndex < safeIndex ? 'is-complete' : ''} ${
                photoIndex === safeIndex && autoPlay ? 'is-active' : ''
              }`}
              style={{ animationDuration: `${STORY_DURATION_MS}ms` }}
            />
          </span>
        ))}
      </div>

      <BlossomCarousel
        ref={carouselRef}
        className="stories-carousel"
        style={{ '--snap-type': 'x mandatory' } as CSSProperties}
        onScroll={syncActiveFromScroll}
      >
        {photos.map((photo, photoIndex) => (
          <article
            key={photo._id}
            data-story-slide={photoIndex}
            className={`stories-slide ${photoIndex === safeIndex ? 'is-active' : ''} ${
              photoIndex < safeIndex ? 'is-before' : photoIndex > safeIndex ? 'is-after' : ''
            }`}
          >
            <div className="stories-card">
              {!loadedImages[photo._id] && (
                <div className="absolute inset-0 z-20 grid place-items-center bg-black/40 text-cream">
                  <Spinner className="size-8" />
                </div>
              )}
              <img
                src={photo.image_url}
                alt="Story backdrop"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl"
                onLoad={() => markLoaded(photo._id)}
              />
              <img
                src={photo.image_url}
                alt="Story photo"
                className="relative z-10 h-full w-full object-cover"
                onLoad={() => markLoaded(photo._id)}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-4 text-cream">
                <p className="text-sm font-black">{photo.guest_id?.name || 'Guest'}</p>
                <p className="text-xs text-parchment">{new Date(photo.created_at).toLocaleString()}</p>
              </div>
            </div>
          </article>
        ))}
      </BlossomCarousel>

      <button className="stories-tap-zone stories-tap-zone-prev" onClick={previousStory} aria-label="Previous story">
        <ChevronLeft className="stories-nav-icon" />
      </button>
      <button className="stories-tap-zone stories-tap-zone-next" onClick={nextStory} aria-label="Next story">
        <ChevronRight className="stories-nav-icon" />
      </button>
    </div>
  );
}
