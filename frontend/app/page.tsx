import Link from 'next/link';
import { Camera, QrCode } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen px-5 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-center gap-8">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-moss px-4 py-2 text-sm font-semibold text-cream">
            <Camera size={16} /> Digital disposable camera
          </div>
          <h1 className="text-5xl font-black tracking-normal text-ink sm:text-7xl">MemoryShots</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-moss">
            QR photo sharing for weddings, christenings, birthdays, corporate events, and private celebrations.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="inline-flex items-center gap-2 rounded-lg bg-moss px-5 py-3 font-bold text-cream shadow-soft" href="/admin/login">
              <QrCode size={18} /> Admin login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
