import Image from 'next/image';

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span className="inline-flex items-center gap-3">
        <Image src="/brand/memoryshots-mark.svg" alt="MemoryShots" width={44} height={44} priority />
        <span className="text-2xl font-black text-ink">MemoryShots</span>
      </span>
    );
  }

  return <Image src="/brand/memoryshots-logo.svg" alt="MemoryShots" width={490} height={130} priority className="h-auto w-full max-w-[490px]" />;
}
