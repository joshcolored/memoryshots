import type { EventRecord, Photo } from '@/types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

type RequestOptions = RequestInit & { token?: string | null };
type GalleryOptions = { page?: number; limit?: number };
export type PaginationMeta = { page: number; limit: number; total: number; total_pages: number };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers, cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data as T;
}

export const publicApi = {
  event: (slug: string) => request<{ data: EventRecord }>(`/api/events/${slug}`),
  session: (slug: string, token: string) =>
    request<{ guest: { id: string; name: string; photo_count: number }; event: EventRecord; remaining: number }>(
      `/api/events/${slug}/session`,
      { token }
    ),
  join: (slug: string, name: string) =>
    request<{ token: string; guest: { id: string; name: string; photo_count: number }; event: EventRecord; remaining: number }>(
      `/api/events/${slug}/join`,
      { method: 'POST', body: JSON.stringify({ name }) }
    ),
  upload: (slug: string, token: string, file: File) => {
    const form = new FormData();
    form.append('photo', file);
    return request<{ remaining: number; message: string }>(`/api/events/${slug}/photos`, { method: 'POST', body: form, token });
  },
  gallery: (slug: string, options: GalleryOptions = {}) => {
    const params = new URLSearchParams();
    if (options.page) params.set('page', String(options.page));
    if (options.limit) params.set('limit', String(options.limit));
    const query = params.toString();
    return request<{ data: Photo[]; event: EventRecord; meta?: PaginationMeta }>(
      `/api/events/${slug}/gallery${query ? `?${query}` : ''}`
    );
  },
  guestbook: (slug: string, token: string, message: string) =>
    request(`/api/events/${slug}/guestbook`, { method: 'POST', body: JSON.stringify({ message }), token })
};

export const adminApi = {
  register: (name: string, email: string, password: string) =>
    request<{ token: string; admin: { id: string; name: string; email: string } }>('/api/admin/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    }),
  login: (email: string, password: string) =>
    request<{ token: string; admin: { id?: string; name?: string; email: string } }>('/api/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  events: (token: string) => request<{ data: EventRecord[] }>('/api/admin/events', { token }),
  createEvent: (token: string, payload: EventRecord) =>
    request<{ data: EventRecord }>('/api/admin/events', { method: 'POST', body: JSON.stringify(payload), token }),
  updateEvent: (token: string, id: string, payload: EventRecord) =>
    request<{ data: EventRecord }>(`/api/admin/events/${id}`, { method: 'PUT', body: JSON.stringify(payload), token }),
  event: (token: string, id: string) => request<{ data: EventRecord; stats: Record<string, number> }>(`/api/admin/events/${id}`, { token }),
  guests: (token: string, id: string) => request<{ data: Array<{ _id: string; name: string; photo_count: number }> }>(`/api/admin/events/${id}/guests`, { token }),
  photos: (token: string, id: string, guestId?: string) =>
    request<{ data: Photo[] }>(`/api/admin/events/${id}/photos${guestId ? `?guest_id=${guestId}` : ''}`, { token }),
  setPhotoStatus: (token: string, id: string, status: Photo['status']) =>
    request<{ data: Photo }>(`/api/admin/photos/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }), token }),
  deletePhoto: (token: string, id: string) => request(`/api/admin/photos/${id}`, { method: 'DELETE', token }),
  deleteEvent: (token: string, id: string) => request(`/api/admin/events/${id}`, { method: 'DELETE', token })
};
