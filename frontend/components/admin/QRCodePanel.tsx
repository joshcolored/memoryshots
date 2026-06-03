'use client';

import { useRef } from 'react';
import QRCode from 'react-qr-code';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL, APP_URL } from '@/lib/api';
import { Button } from '@/components/ui/Button';

type QRCodePanelProps = {
  slug: string;
  title?: string;
  eventType?: string;
  eventDate?: string;
  coverImage?: string;
};

function drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  words.forEach((word, index) => {
    const testLine = `${line}${word} `;
    if (ctx.measureText(testLine).width > maxWidth && index > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = `${word} `;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  });

  ctx.fillText(line.trim(), x, currentY);
  return currentY;
}

function drawCameraIcon(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = '#546B41';
  ctx.lineWidth = 8;
  ctx.lineJoin = 'round';
  ctx.strokeRect(0, 26, 120, 82);
  ctx.beginPath();
  ctx.moveTo(28, 26);
  ctx.lineTo(42, 0);
  ctx.lineTo(78, 0);
  ctx.lineTo(94, 26);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(60, 67, 24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, rotate: number, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotate);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#99AD7A';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(70, -64, 148, -26, 172, 42);
  ctx.bezierCurveTo(96, 68, 32, 54, 0, 0);
  ctx.fill();
  ctx.strokeStyle = 'rgba(84, 107, 65, 0.42)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(18, 6);
  ctx.quadraticCurveTo(82, 18, 152, 42);
  ctx.stroke();
  ctx.restore();
}

function loadCanvasImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load image'));
    image.src = src;
  });
}

function drawCoverImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

export function QRCodePanel({ slug, title = 'MemoryShots', eventType = 'Event', eventDate, coverImage = '' }: QRCodePanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const link = `${APP_URL}/event/${slug}`;
  const posterCoverImage = coverImage ? `${API_URL}/api/image-proxy?url=${encodeURIComponent(coverImage)}` : '';

  async function download() {
    const svg = ref.current?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgUrl = URL.createObjectURL(new Blob([svgData], { type: 'image/svg+xml' }));

    try {
      const [image, cover] = await Promise.all([
        loadCanvasImage(svgUrl),
        posterCoverImage ? loadCanvasImage(posterCoverImage).catch(() => null) : Promise.resolve(null)
      ]);
      const canvas = document.createElement('canvas');
      canvas.width = 1800;
      canvas.height = 2400;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (cover) {
        drawCoverImage(ctx, cover, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(34, 40, 29, 0.52)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 248, 236, 0.72)';
        ctx.fillRect(90, 90, canvas.width - 180, canvas.height - 180);
      } else {
        ctx.fillStyle = '#FFF8EC';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, cover ? 'rgba(153, 173, 122, 0.18)' : 'rgba(153, 173, 122, 0.24)');
      gradient.addColorStop(0.5, cover ? 'rgba(255, 248, 236, 0.28)' : 'rgba(220, 204, 172, 0.22)');
      gradient.addColorStop(1, cover ? 'rgba(84, 107, 65, 0.18)' : 'rgba(84, 107, 65, 0.14)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawLeaf(ctx, 120, 260, -0.4, 1.2);
      drawLeaf(ctx, 1540, 2200, Math.PI + 0.2, 1.35);
      drawCameraIcon(ctx, 1390, 160, 1.25);

      ctx.strokeStyle = '#546B41';
      ctx.lineWidth = 10;
      ctx.strokeRect(90, 90, canvas.width - 180, canvas.height - 180);
      ctx.strokeStyle = 'rgba(84, 107, 65, 0.22)';
      ctx.lineWidth = 4;
      ctx.strokeRect(130, 130, canvas.width - 260, canvas.height - 260);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#546B41';
      ctx.font = '700 48px Arial';
      ctx.fillText(eventType.toUpperCase(), canvas.width / 2, 330);

      ctx.fillStyle = '#22281D';
      ctx.font = '900 112px Arial';
      drawWrappedText(ctx, title, canvas.width / 2, 500, 1260, 124);

      ctx.fillStyle = '#546B41';
      ctx.font = '600 42px Arial';
      ctx.fillText(eventDate ? new Date(eventDate).toLocaleDateString() : 'Scan to open the camera', canvas.width / 2, 760);

      ctx.fillStyle = '#22281D';
      ctx.font = '800 58px Arial';
      ctx.fillText('Scan. Snap. Share.', canvas.width / 2, 930);

      ctx.fillStyle = '#546B41';
      ctx.font = '500 36px Arial';
      ctx.fillText('Use your phone camera to join this digital disposable camera.', canvas.width / 2, 1000);

      ctx.fillStyle = '#FFF8EC';
      ctx.strokeStyle = '#546B41';
      ctx.lineWidth = 8;
      const qrX = 480;
      const qrY = 1110;
      const qrSize = 840;
      ctx.roundRect(qrX - 46, qrY - 46, qrSize + 92, qrSize + 92, 44);
      ctx.fill();
      ctx.stroke();
      ctx.drawImage(image, qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = '#546B41';
      ctx.font = '700 36px Arial';
      ctx.fillText('No app needed', canvas.width / 2, 2070);
      ctx.font = '500 28px Arial';
      ctx.fillText(link, canvas.width / 2, 2140);

      const a = document.createElement('a');
      a.download = `${slug}-qr-poster.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch {
      toast.error('Unable to generate poster');
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  }

  return (
    <div className="grid gap-4 rounded-2xl bg-cream/80 p-5 shadow-soft">
      <div ref={ref} className="mx-auto rounded-2xl bg-cream p-4">
        <QRCode value={link} size={220} bgColor="#FFF8EC" fgColor="#546B41" />
      </div>
      <p className="break-all rounded-lg bg-white/60 p-3 text-sm text-moss">{link}</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="ghost" onClick={() => navigator.clipboard.writeText(link).then(() => toast.success('Event link copied'))}><Copy size={16} /> Copy</Button>
        <Button onClick={download}><Download size={16} /> Poster PNG</Button>
      </div>
    </div>
  );
}
