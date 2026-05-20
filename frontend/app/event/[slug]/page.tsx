'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Images, Send } from 'lucide-react';
import { toast } from 'sonner';
import type { EventRecord } from '@/types';
import { publicApi } from '@/lib/api';
import { guestTokenKey } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Field, TextAreaField } from '@/components/ui/Field';
import { CameraCapture } from '@/components/guest/CameraCapture';
import { ShotCounter } from '@/components/guest/ShotCounter';

export default function GuestEventPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [name, setName] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    publicApi.event(slug).then(({ data }) => {
      setEvent(data);
      const saved = localStorage.getItem(guestTokenKey(slug));
      if (!saved) {
        setRemaining(data.photo_limit);
        return;
      }

      setToken(saved);
      publicApi.session(slug, saved)
        .then((session) => {
          setEvent(session.event);
          setRemaining(session.remaining);
        })
        .catch(() => {
          localStorage.removeItem(guestTokenKey(slug));
          setToken(null);
          setRemaining(data.photo_limit);
        });
    }).catch((error) => toast.error(error.message));
  }, [slug]);

  async function join(eventSubmit: React.FormEvent) {
    eventSubmit.preventDefault();
    setJoining(true);
    try {
      const response = await publicApi.join(slug, name);
      localStorage.setItem(guestTokenKey(slug), response.token);
      setToken(response.token);
      setEvent(response.event);
      setRemaining(response.remaining);
      toast.success(`Hi ${response.guest.name}, your camera is ready`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to join');
    } finally {
      setJoining(false);
    }
  }

  async function upload(file: File) {
    if (!token) return;
    try {
      const response = await publicApi.upload(slug, token, file);
      setRemaining(response.remaining);
      toast.success(response.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    }
  }

  async function sendMessage() {
    if (!token || !message.trim()) return;
    await publicApi.guestbook(slug, token, message);
    setMessage('');
    toast.success('Guestbook message saved');
  }

  if (!event) return <main className="grid min-h-screen place-items-center text-moss">Loading event...</main>;

  return (
    <main className="min-h-screen px-4 py-5">
      <section className="mx-auto grid max-w-lg gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl bg-cream shadow-soft">
          <div className="relative h-56 bg-moss">
            {event.cover_image ? <img src={event.cover_image} alt={event.title} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-[linear-gradient(135deg,#546B41,#99AD7A,#DCCCAC)]" />}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-5 text-cream">
              <p className="text-sm font-bold uppercase tracking-widest">{event.event_type}</p>
              <h1 className="text-3xl font-black">{event.title}</h1>
            </div>
          </div>
        </motion.div>

        {!token ? (
          <form onSubmit={join} className="grid gap-4 rounded-2xl bg-cream/85 p-5 shadow-soft">
            <h2 className="text-2xl font-black text-ink">Pick your camera name</h2>
            <Field label="Name or nickname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Auntie May" required />
            <Button disabled={joining}>Start shooting</Button>
          </form>
        ) : (
          <>
            <ShotCounter remaining={remaining} limit={event.photo_limit} />
            {remaining <= 0 ? (
              <div className="rounded-2xl bg-cream/85 p-5 text-center text-xl font-black text-moss">You used all {event.photo_limit} shots.</div>
            ) : (
              <CameraCapture disabled={!event.is_active || remaining <= 0} onFileReady={upload} />
            )}
            {event.guestbook_enabled && (
              <div className="grid gap-3 rounded-2xl bg-cream/80 p-5 shadow-soft">
                <TextAreaField label="Guestbook message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Leave a note for the hosts..." />
                <Button onClick={sendMessage} disabled={!message.trim()}><Send size={16} /> Send message</Button>
              </div>
            )}
          </>
        )}

        <Link href={`/event/${slug}/gallery`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-sage px-4 font-bold text-ink">
          <Images size={18} /> View public gallery
        </Link>
      </section>
    </main>
  );
}
