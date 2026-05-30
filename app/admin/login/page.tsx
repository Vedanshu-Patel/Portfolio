'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("That's not it.");
        setSubmitting(false);
        return;
      }
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Network error — try again.');
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="glass-strong w-full max-w-sm rounded-2xl border border-white/10 p-7 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent-glow">
            <Lock size={18} />
          </div>
          <div className="flex flex-col leading-tight">
            <h1 className="text-base font-medium text-foreground">Admin</h1>
            <p className="font-mono text-[11px] text-foreground/55">
              Private — chatbot analytics
            </p>
          </div>
        </div>

        <label className="mb-4 block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-foreground/55">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            autoFocus
            disabled={submitting}
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-50"
          />
        </label>

        {error && (
          <p className="mb-3 font-mono text-[11px] text-red-300/80">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !password}
          className="flex w-full items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all hover:bg-accent-glow hover:shadow-[0_0_28px_rgba(167,139,250,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Checking…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
