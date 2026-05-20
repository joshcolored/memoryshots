import { Aperture } from 'lucide-react';

export function ShotCounter({ remaining, limit }: { remaining: number; limit: number }) {
  return (
    <div className="rounded-2xl bg-ink p-5 text-cream shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold uppercase tracking-widest text-parchment">Shots left</span>
        <Aperture className="text-sage" />
      </div>
      <div className="mt-4 font-mono text-5xl font-black tracking-normal">
        {remaining} / {limit}
      </div>
      <p className="mt-2 text-sm text-parchment">digital disposable camera counter</p>
    </div>
  );
}
