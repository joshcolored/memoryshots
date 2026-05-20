'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

type Props = {
  disabled: boolean;
  onFileReady: (file: File) => Promise<void>;
};

const filters = [
  { id: 'clean', label: 'Clean', css: 'none' },
  { id: 'warm', label: 'Warm', css: 'sepia(0.22) saturate(1.18) contrast(1.04) brightness(1.03)' },
  { id: 'film', label: 'Film', css: 'sepia(0.32) saturate(1.35) contrast(1.08) brightness(0.98)' },
  { id: 'mono', label: 'Mono', css: 'grayscale(1) contrast(1.12) brightness(1.02)' },
  { id: 'dream', label: 'Dream', css: 'saturate(1.18) contrast(0.92) brightness(1.08)' }
] as const;

type FilterId = (typeof filters)[number]['id'];

function getFilter(id: FilterId) {
  return filters.find((filter) => filter.id === id) || filters[0];
}

async function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unable to read image'));
    };
    image.src = url;
  });
}

async function processImageFile(file: File, filterId: FilterId): Promise<File> {
  const image = await loadImage(file);
  const maxWidth = 1600;
  const ratio = Math.min(1, maxWidth / image.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * ratio);
  canvas.height = Math.round(image.height * ratio);
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.filter = getFilter(filterId).css;
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
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [openingCamera, setOpeningCamera] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [filterId, setFilterId] = useState<FilterId>('clean');
  const selectedFilter = getFilter(filterId);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    const playVideo = () => video.play().catch(() => undefined);

    if (video.readyState >= 1) {
      playVideo();
    } else {
      video.addEventListener('loadedmetadata', playVideo, { once: true });
    }

    return () => {
      video.removeEventListener('loadedmetadata', playVideo);
      video.srcObject = null;
    };
  }, [stream]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [stream, previewUrl]);

  useEffect(() => {
    if (!sourceFile) return;

    let cancelled = false;
    setProcessing(true);
    processImageFile(sourceFile, filterId)
      .then((filteredFile) => {
        if (cancelled) return;
        setPreview(filteredFile);
        setPreviewUrl((currentUrl) => {
          if (currentUrl) URL.revokeObjectURL(currentUrl);
          return URL.createObjectURL(filteredFile);
        });
      })
      .catch(() => {
        if (!cancelled) toast.error('Unable to apply this filter');
      })
      .finally(() => {
        if (!cancelled) setProcessing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filterId, sourceFile]);

  async function openCamera() {
    setOpeningCamera(true);
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 2560 }
        },
        audio: false
      });
      setStream(media);
    } catch {
      toast.error('Camera access was blocked. You can still upload from gallery.');
    } finally {
      setOpeningCamera(false);
    }
  }

  function closeCamera() {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  }

  async function capture() {
    const video = videoRef.current;
    if (!video) return;
    if (!video.videoWidth || !video.videoHeight) {
      toast.error('Camera is still warming up. Try again in a second.');
      return;
    }

    const maxWidth = 1600;
    const ratio = Math.min(1, maxWidth / video.videoWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * ratio);
    canvas.height = Math.round(video.videoHeight * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('Capture failed'))), 'image/jpeg', 0.88);
    });
    setSourceFile(new File([blob], `memoryshot-${Date.now()}.jpg`, { type: 'image/jpeg' }));
    closeCamera();
  }

  function clearPreview() {
    setSourceFile(null);
    setPreview(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
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
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="aspect-[3/4] w-full bg-ink object-cover"
            style={{ filter: selectedFilter.css }}
          />
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
            <Button disabled={busy || processing} onClick={submit}>
              {(busy || processing) && <Spinner />}
              {processing ? 'Filtering...' : busy ? 'Uploading...' : <><Upload size={18} /> Upload</>}
            </Button>
            <Button disabled={busy || processing} variant="ghost" onClick={clearPreview}><RefreshCw size={18} /> Retake</Button>
          </div>
        </div>
      )}

      <div className="grid gap-2 rounded-2xl bg-cream/80 p-3 shadow-soft">
        <div className="text-xs font-bold uppercase tracking-widest text-moss">Filter</div>
        <div className="grid grid-cols-5 gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setFilterId(filter.id)}
              className={`rounded-lg px-2 py-3 text-xs font-black transition ${
                filterId === filter.id ? 'bg-moss text-cream' : 'bg-white/70 text-moss ring-1 ring-moss/10'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {!stream && !preview && (
        <div className="grid grid-cols-2 gap-3">
          <Button disabled={disabled || openingCamera} onClick={openCamera}>
            {openingCamera ? <Spinner /> : <Camera size={18} />}
            {openingCamera ? 'Opening...' : 'Take photo'}
          </Button>
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
          if (file) setSourceFile(file);
          event.target.value = '';
        }}
      />
    </div>
  );
}
