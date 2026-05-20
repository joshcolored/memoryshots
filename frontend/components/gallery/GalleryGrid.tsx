import type { Photo } from '@/types';

export function GalleryGrid({ photos }: { photos: Photo[] }) {
  if (!photos.length) {
    return <div className="rounded-2xl bg-cream/70 p-8 text-center text-moss">No approved photos yet.</div>;
  }

  return (
    <div className="masonry">
      {photos.map((photo) => (
        <figure key={photo._id} className="mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-cream shadow-soft">
          <img loading="lazy" src={photo.image_url} alt={photo.original_filename || 'Event memory'} className="w-full object-cover" />
          <figcaption className="flex items-center justify-between px-4 py-3 text-sm text-moss">
            <span>{photo.guest_id?.name || 'Guest'}</span>
            <span>{new Date(photo.created_at).toLocaleDateString()}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
