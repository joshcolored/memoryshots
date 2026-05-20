import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { RouteTransition } from '@/components/ui/RouteTransition';
import './globals.css';

export const metadata: Metadata = {
  title: 'MemoryShots',
  description: 'QR event photo sharing for meaningful celebrations'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <RouteTransition>{children}</RouteTransition>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
