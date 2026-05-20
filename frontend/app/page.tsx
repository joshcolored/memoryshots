import Link from 'next/link';
import { Camera, CheckCircle2, Clapperboard, Images, LogIn, QrCode, ShieldCheck, Tv } from 'lucide-react';
import { HomeAuthRedirect } from '@/components/admin/HomeAuthRedirect';
import { EventIllustration } from '@/components/landing/EventIllustration';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden px-5 py-8">
      <HomeAuthRedirect />
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-moss px-4 py-2 text-sm font-semibold text-cream">
            <Camera size={16} /> Digital disposable camera
          </div>
          <BrandLogo />
          <p className="mt-5 max-w-xl text-lg leading-8 text-moss">
            A premium QR photo sharing experience for weddings, birthdays, christenings, corporate events, and private celebrations.
          </p>
          <div className="mt-6 grid max-w-xl gap-3 sm:grid-cols-2">
            {[
              ['Guests scan one QR code', QrCode],
              ['Admin approves memories', ShieldCheck],
              ['Live gallery and TV mode', Tv],
              ['Printable QR event poster', Images]
            ].map(([label, Icon]) => (
              <div key={label as string} className="flex items-center gap-3 rounded-xl bg-cream/70 p-3 text-sm font-bold text-moss shadow-soft ring-1 ring-moss/10">
                <Icon size={18} /> {label as string}
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="inline-flex items-center gap-2 rounded-lg bg-moss px-5 py-3 font-bold text-cream shadow-soft" href="/admin/login">
              <LogIn size={18} /> Login
            </Link>
            <a className="inline-flex items-center gap-2 rounded-lg bg-cream px-5 py-3 font-bold text-moss shadow-soft ring-1 ring-moss/20" href="#features">
              <Clapperboard size={18} /> See Features
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-sage/20 blur-3xl" />
          <div className="relative rounded-[2rem] bg-cream/70 p-4 shadow-soft ring-1 ring-moss/10">
            <EventIllustration />
          </div>
        </div>
      </section>
      <section id="features" className="mx-auto grid max-w-6xl gap-4 pb-14 sm:grid-cols-3">
        {[
          ['No app required', 'Guests open the camera from a QR link and upload in seconds.'],
          ['Curated gallery', 'Photos stay pending until the event admin approves them.'],
          ['Made for venues', 'TV carousel mode turns approved photos into a live display.']
        ].map(([title, copy]) => (
          <article key={title} className="rounded-2xl bg-cream/80 p-5 shadow-soft ring-1 ring-moss/10">
            <CheckCircle2 className="text-moss" />
            <h2 className="mt-4 text-xl font-black text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-moss">{copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
