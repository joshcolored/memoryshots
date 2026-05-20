'use client';

import { useRef, useState } from 'react';
import { Camera, RefreshCw, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';

type Props = {
  disabled: boolean;
  onFileReady: (file: File) => Promise<void>;
};

async function compressFile(file: File): Promise<File> {
  const image = await createImageBitmap(file);
  const maxWidth = 1600;
  const ratio = Math.min(1, maxWidth / image.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * ratio);
  canvas.height = Math.round(image.height * ratio);
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('Unable to compress photo'))), 'image/jpeg', 0.82);
  });

  return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
}

export function CameraCapture({ disabled, onFileReady }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [busy, setBusy] = useState(false);

  async function openCamera() {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      setStream(media);
      if (videoRef.current) videoRef.current.srcObject = media;
    } catch {
      toast.error('Camera access was blocked. You can still upload from gallery.');
    }
  }

  function closeCamera() {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  }

  async function capture() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('Capture failed'))), 'image/jpeg', 0.88);
    });
    setPreviewFile(new File([blob], `memoryshot-${Date.now()}.jpg`, { type: 'image/jpeg' }));
    closeCamera();
  }

  async function setPreviewFile(file: File) {
    const compressed = await compressFile(file);
    setPreview(compressed);
    setPreviewUrl(URL.createObjectURL(compressed));
  }

  async function submit() {
    if (!preview) return;
    setBusy(true);
    try {
      await onFileReady(preview);
      setPreview(null);
      setPreviewUrl('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      {stream && (
        <div className="overflow-hidden rounded-2xl bg-ink shadow-soft">
          <video ref={videoRef} autoPlay playsInline muted className="aspect-[3/4] w-full object-cover" />
          <div className="grid grid-cols-2 gap-2 p-3">
            <Button onClick={capture}><Camera size={18} /> Capture</Button>
            <Button variant="ghost" onClick={closeCamera}><X size={18} /> Close</Button>
          </div>
        </div>
      )}

      {previewUrl && (
        <div className="overflow-hidden rounded-2xl bg-cream shadow-soft">
          <img src={previewUrl} alt="Preview" className="aspect-[3/4] w-full object-cover" />
          <div className="grid grid-cols-2 gap-2 p-3">
            <Button disabled={busy} onClick={submit}><Upload size={18} /> Upload</Button>
            <Button disabled={busy} variant="ghost" onClick={() => setPreview(null)}><RefreshCw size={18} /> Retake</Button>
          </div>
        </div>
      )}

      {!stream && !preview && (
        <div className="grid grid-cols-2 gap-3">
          <Button disabled={disabled} onClick={openCamera}><Camera size={18} /> Take photo</Button>
          <Button disabled={disabled} variant="ghost" onClick={() => fileRef.current?.click()}><Upload size={18} /> Upload</Button>
        </div>
      )}

      <input
        ref={fileRef}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) setPreviewFile(file);
          event.target.value = '';
        }}
      />
    </div>
  );
}
