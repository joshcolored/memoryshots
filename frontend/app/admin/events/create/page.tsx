'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { EventRecord } from '@/types';
import { adminApi } from '@/lib/api';
import { getAdminToken } from '@/lib/auth';
import { EventForm } from '@/components/admin/EventForm';

export default function CreateEventPage() {
  const router = useRouter();

  async function create(payload: EventRecord, coverImageFile?: File | null) {
    const token = getAdminToken();
    if (!token) return router.push('/admin/login');
    const response = await adminApi.createEvent(token, payload, { coverImageFile }).catch((error) => {
      toast.error(error.message);
      throw error;
    });
    toast.success('Event created');
    router.push(`/admin/events/${response.data._id}`);
  }

  return (
    <main className="min-h-screen px-5 py-8">
      <section className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-4xl font-black text-ink">Create event</h1>
        <EventForm submitLabel="Create event" onSubmit={create} />
      </section>
    </main>
  );
}
