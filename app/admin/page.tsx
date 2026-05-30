'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  LogOut,
  MessageSquare,
  RefreshCw,
  Users,
  Inbox,
} from 'lucide-react';

type Stats = {
  totalSessions: number;
  totalMessages: number;
  totalLeads: number;
  intentCounts: Record<string, string | number>;
  recentGaps: Array<{ sessionId?: string; question?: string; timestamp?: number }>;
  recentLeads: Array<{
    sessionId?: string;
    email?: string;
    message?: string;
    wantsCall?: boolean;
    timestamp?: number;
  }>;
  dailyCounts: Array<{ date: string; count: number }>;
};

const INTENT_LABELS: Record<string, string> = {
  projects: 'Projects',
  skills: 'Skills',
  experience: 'Experience',
  education: 'Education',
  contact: 'Contact',
  resume: 'Resume',
  about: 'About',
  offtopic: 'Off-topic',
  unknown: 'Unknown',
  lead_capture: 'Lead capture',
  lead: 'Leads (submitted)',
};

function formatDate(ts: number | undefined): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function shortDay(date: string): string {
  return new Date(date + 'T00:00:00Z').toLocaleDateString(undefined, {
    weekday: 'short',
  });
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' });
      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Stats;
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-mono text-sm text-foreground/60">./admin</h1>
            <p className="mt-1 text-2xl font-semibold text-foreground md:text-3xl">
              Chatbot analytics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              aria-label="Refresh stats"
              className="glass flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-foreground/80 transition-all hover:border-accent/40 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="glass flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-foreground/80 transition-all hover:border-red-400/40 hover:bg-white/[0.06] hover:text-foreground"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {error && (
          <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-300/90">
            {error}
          </p>
        )}

        {loading && !stats && (
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="glass h-24 animate-pulse rounded-2xl border border-white/10"
              />
            ))}
          </div>
        )}

        {stats && (
          <>
            <section className="mb-8 grid gap-4 sm:grid-cols-3">
              <StatCard
                icon={<Users size={16} />}
                label="Sessions (30d)"
                value={stats.totalSessions}
              />
              <StatCard
                icon={<MessageSquare size={16} />}
                label="Total events"
                value={stats.totalMessages}
              />
              <StatCard
                icon={<Inbox size={16} />}
                label="Leads"
                value={stats.totalLeads}
                accent
              />
            </section>

            <section className="mb-8">
              <SectionTitle icon={<Activity size={14} />}>Intent breakdown</SectionTitle>
              <IntentBars counts={stats.intentCounts} />
            </section>

            <section className="mb-8">
              <SectionTitle icon={<Activity size={14} />}>
                Daily activity (last 14 days)
              </SectionTitle>
              <DailySparkline data={stats.dailyCounts} />
            </section>

            <section className="mb-8">
              <SectionTitle icon={<AlertTriangle size={14} />}>
                Knowledge gaps
                <span className="ml-2 font-mono text-[11px] font-normal text-foreground/50">
                  questions my bot couldn&apos;t confidently answer
                </span>
              </SectionTitle>
              <GapsList gaps={stats.recentGaps} />
            </section>

            <section className="mb-4">
              <SectionTitle icon={<Inbox size={14} />}>Recent leads</SectionTitle>
              <LeadsTable leads={stats.recentLeads} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <h2 className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-foreground/60">
      <span className="text-accent-glow">{icon}</span>
      {children}
    </h2>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`glass-strong rounded-2xl border px-4 py-4 ${
        accent ? 'border-accent/30' : 'border-white/10'
      }`}
    >
      <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-foreground/55">
        <span className={accent ? 'text-accent-glow' : 'text-foreground/40'}>
          {icon}
        </span>
        {label}
      </div>
      <div
        className={`text-3xl font-semibold ${
          accent ? 'text-gradient' : 'text-foreground'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function IntentBars({ counts }: { counts: Record<string, string | number> }) {
  const entries = Object.entries(counts)
    .map(([k, v]) => [k, Number(v)] as [string, number])
    .filter(([, v]) => Number.isFinite(v) && v > 0)
    .sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return (
      <p className="glass rounded-xl border border-white/10 px-4 py-3 text-xs text-foreground/55">
        No traffic yet — talk to the bot to populate this.
      </p>
    );
  }

  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="glass-strong rounded-2xl border border-white/10 p-4">
      <div className="flex flex-col gap-2.5">
        {entries.map(([intent, count]) => {
          const pct = (count / max) * 100;
          return (
            <div key={intent} className="flex items-center gap-3">
              <span className="w-32 shrink-0 font-mono text-[11px] text-foreground/75 md:w-40">
                {INTENT_LABELS[intent] ?? intent}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent-glow"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right font-mono text-[11px] text-foreground/75">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DailySparkline({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="glass-strong rounded-2xl border border-white/10 p-4">
      <div className="flex items-end gap-1.5 h-24">
        {data.map((d) => {
          const pct = (d.count / max) * 100;
          return (
            <div
              key={d.date}
              className="group flex flex-1 flex-col items-center justify-end"
              title={`${d.date}: ${d.count} events`}
            >
              <div
                className="w-full rounded-t bg-gradient-to-t from-accent/70 to-accent-glow transition-all group-hover:from-accent group-hover:to-accent-glow"
                style={{
                  height: `${Math.max(pct, d.count > 0 ? 6 : 2)}%`,
                  opacity: d.count > 0 ? 1 : 0.25,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-foreground/45">
        <span>{shortDay(data[0].date)}</span>
        <span>{total} events / 14d</span>
        <span>{shortDay(data[data.length - 1].date)} (today)</span>
      </div>
    </div>
  );
}

function GapsList({
  gaps,
}: {
  gaps: { sessionId?: string; question?: string; timestamp?: number }[];
}) {
  if (gaps.length === 0) {
    return (
      <p className="glass rounded-xl border border-white/10 px-4 py-3 text-xs text-foreground/55">
        No knowledge gaps recorded. Either your data.ts is exhaustive or nobody&apos;s asked anything tricky yet.
      </p>
    );
  }

  return (
    <ul className="glass-strong divide-y divide-white/5 rounded-2xl border border-white/10">
      {gaps.map((g, i) => (
        <li key={i} className="flex items-start gap-3 px-4 py-2.5">
          <span className="mt-0.5 font-mono text-[10px] text-foreground/40">
            {formatDate(g.timestamp)}
          </span>
          <span className="flex-1 text-sm text-foreground/85">{g.question ?? '—'}</span>
        </li>
      ))}
    </ul>
  );
}

function LeadsTable({
  leads,
}: {
  leads: {
    sessionId?: string;
    email?: string;
    message?: string;
    wantsCall?: boolean;
    timestamp?: number;
  }[];
}) {
  if (leads.length === 0) {
    return (
      <p className="glass rounded-xl border border-white/10 px-4 py-3 text-xs text-foreground/55">
        No leads captured yet.
      </p>
    );
  }

  return (
    <>
      <div className="glass-strong hidden overflow-hidden rounded-2xl border border-white/10 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] font-mono text-[10px] uppercase tracking-wider text-foreground/55">
            <tr>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Message</th>
              <th className="px-4 py-2.5">Call</th>
              <th className="px-4 py-2.5">When</th>
              <th className="px-4 py-2.5">Session</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leads.map((l, i) => (
              <tr key={i} className="text-foreground/85">
                <td className="px-4 py-2.5">
                  <a
                    href={`mailto:${l.email}`}
                    className="text-accent-glow hover:underline"
                  >
                    {l.email ?? '—'}
                  </a>
                </td>
                <td className="px-4 py-2.5 text-foreground/75">
                  {l.message?.trim() ? l.message : '—'}
                </td>
                <td className="px-4 py-2.5">
                  {l.wantsCall ? (
                    <span className="rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] text-accent-glow">
                      Yes
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-foreground/40">no</span>
                  )}
                </td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-foreground/60">
                  {formatDate(l.timestamp)}
                </td>
                <td
                  className="px-4 py-2.5 font-mono text-[10px] text-foreground/40"
                  title={l.sessionId}
                >
                  {l.sessionId?.slice(0, 8) ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {leads.map((l, i) => (
          <div
            key={i}
            className="glass-strong rounded-2xl border border-white/10 p-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <a
                href={`mailto:${l.email}`}
                className="truncate text-sm text-accent-glow hover:underline"
              >
                {l.email ?? '—'}
              </a>
              {l.wantsCall && (
                <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] text-accent-glow">
                  Call
                </span>
              )}
            </div>
            {l.message?.trim() && (
              <p className="mt-1.5 text-sm text-foreground/75">{l.message}</p>
            )}
            <p className="mt-2 font-mono text-[10px] text-foreground/40">
              {formatDate(l.timestamp)} · {l.sessionId?.slice(0, 8) ?? '—'}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
