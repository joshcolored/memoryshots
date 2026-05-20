'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';
import { saveAdminToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@memoryshots.local');
  const [password, setPassword] = useState('change-this-password');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await adminApi.login(email, password);
      saveAdminToken(response.token);
      toast.success('Welcome back');
      router.push('/admin/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <form onSubmit={submit} className="grid w-full max-w-md gap-5 rounded-2xl bg-cream/85 p-6 shadow-soft">
        <div>
          <div className="mb-4 inline-flex rounded-full bg-moss p-3 text-cream"><Lock /></div>
          <h1 className="text-3xl font-black text-ink">Login</h1>
          <p className="mt-2 text-sm text-moss">Manage events, approvals, guests, QR codes, and downloads.</p>
        </div>
        <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button disabled={busy}>Login</Button>
      </form>
    </main>
  );
}
