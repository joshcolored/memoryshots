export type EventType = 'Wedding' | 'Christening' | 'Birthday' | 'Corporate' | 'Anniversary' | 'Custom';

export type EventRecord = {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  event_type: EventType;
  photo_limit: number;
  cover_image?: string;
  event_date: string;
  is_active: boolean;
  guestbook_enabled?: boolean;
  watermark_enabled?: boolean;
  guest_total?: number;
  photo_total?: number;
};

export type Guest = {
  _id?: string;
  id?: string;
  name: string;
  photo_count: number;
};

export type Photo = {
  _id: string;
  image_url: string;
  storage_path: string;
  original_filename: string;
  status: 'pending' | 'approved' | 'hidden';
  created_at: string;
  guest_id?: Guest;
};

export type GuestbookMessage = {
  _id: string;
  message: string;
  status: 'pending' | 'approved' | 'hidden';
  created_at: string;
  read_at?: string | null;
  guest_id?: Guest;
};
