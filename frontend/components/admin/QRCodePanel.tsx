'use client';

import { useRef } from 'react';
import QRCode from 'react-qr-code';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import { APP_URL } from '@/lib/api';
import { Button } from '@/components/ui/Button';

export function QRCodePanel({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const link = `${APP_URL}/event/${slug}`;

  async function download() {
    const svg = ref.current?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const image = new Image();
    image.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#FFF8EC';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 96, 96, 832, 832);
      const a = document.createElement('a');
      a.download = `${slug}-qr.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
  }

  return (
    <div className="grid gap-4 rounded-2xl bg-cream/80 p-5 shadow-soft">
      <div ref={ref} className="mx-auto rounded-2xl bg-cream p-4">
        <QRCode value={link} size={220} bgColor="#FFF8EC" fgColor="#546B41" />
      </div>
      <p className="break-all rounded-lg bg-white/60 p-3 text-sm text-moss">{link}</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="ghost" onClick={() => navigator.clipboard.writeText(link).then(() => toast.success('Event link copied'))}><Copy size={16} /> Copy</Button>
        <Button onClick={download}><Download size={16} /> PNG</Button>
      </div>
    </div>
  );
}
