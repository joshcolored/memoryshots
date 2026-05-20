'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarPlus, Image, LogOut, X, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { EventRecord } from '@/types';
import { adminApi } from '@/lib/api';
import { clearAdminToken, getAdminToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function DashboardPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      location.href = '/admin/login';
      return;
    }
    adminApi.events(token).then((res) => setEvents(res.data)).catch((error) => toast.error(error.message));
  }, []);

  const totals = events.reduce(
    (sum, event) => ({
      photos: sum.photos + (event.photo_total || 0),
      guests: sum.guests + (event.guest_total || 0)
    }),
    { photos: 0, guests: 0 }
  );

  return (
    <main className="min-h-screen px-5 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-3"><BrandLogo compact /></div>
            <h1 className="text-4xl font-black text-ink">Dashboard</h1>
            <p className="mt-2 text-moss">A calm command center for every celebration.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/events/create"><Button><CalendarPlus size={18} /> Create event</Button></Link>
            <Button
              variant="ghost"
              onClick={() => setShowLogoutModal(true)}
            >
              <LogOut size={18} /> Logout
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Events" value={events.length} icon={<CalendarPlus />} />
          <Stat label="Guests" value={totals.guests} icon={<Users />} />
          <Stat label="Uploads" value={totals.photos} icon={<Image />} />
        </div>

        <div className="mt-8 grid gap-4">
          {events.map((event) => (
            <Link key={event._id} href={`/admin/events/${event._id}`} className="grid gap-3 rounded-2xl bg-cream/80 p-5 shadow-soft transition hover:-translate-y-0.5 sm:grid-cols-[1fr_auto]">
              <div>
                <h2 className="text-xl font-black text-ink">{event.title}</h2>
                <p className="text-sm text-moss">/{event.slug} · {event.event_type} · {String(event.event_date).slice(0, 10)}</p>
              </div>
              <div className="flex gap-3 text-sm font-bold text-moss">
                <span>{event.guest_total || 0} guests</span>
                <span>{event.photo_total || 0} photos</span>
                <span>{event.is_active ? 'Active' : 'Paused'}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-cream p-6 shadow-soft ring-1 ring-moss/15">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-4 inline-flex rounded-full bg-moss p-3 text-cream">
                  <LogOut size={22} />
                </div>
                <h2 className="text-2xl font-black text-ink">Logout?</h2>
                <p className="mt-2 text-sm leading-6 text-moss">Are you sure you want to logout?</p>
              </div>
              <button
                className="grid size-10 place-items-center rounded-full bg-white/70 text-moss ring-1 ring-moss/10"
                onClick={() => setShowLogoutModal(false)}
                aria-label="Close logout confirmation"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="ghost" onClick={() => setShowLogoutModal(false)}>Cancel</Button>
              <Button
                variant="danger"
                onClick={() => {
                  clearAdminToken();
                  toast.success('Logged out');
                  router.push('/admin/login');
                }}
              >
                <LogOut size={18} /> Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-cream/80 p-5 shadow-soft">
      <div className="flex items-center justify-between text-moss">{label}<span>{icon}</span></div>
      <div className="mt-4 text-4xl font-black text-ink">{value}</div>
    </div>
  );
}
