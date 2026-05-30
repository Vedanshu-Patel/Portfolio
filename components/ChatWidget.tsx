'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Download, MessageCircle, Send, Sparkles, Trash2, X } from 'lucide-react';
import { profile } from '@/lib/data';
import { useChatStore } from '@/lib/useChatStore';
import { sendLeadEmail } from '@/lib/emailjs';
import { useSound } from './SoundProvider';
import { cn } from '@/lib/utils';

const SEEN_KEY = 'vp_chat_seen';
const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const CONTACT_CHIP_SEND = 'How can I contact you?';

const QUICK_REPLIES = [
  { emoji: '📁', send: 'Show me your top projects' },
  { emoji: '📄', send: 'Download Resume / CV' },
  { emoji: '🛠️', send: "What's your tech stack?" },
  { emoji: '📬', send: CONTACT_CHIP_SEND },
];

function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length > 254) return false;
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmed);
}

function formatRecentMessages(
  msgs: ReturnType<typeof useChatStore>['messages']
): string {
  return msgs
    .slice(-5)
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');
}

export default function ChatWidget() {
  const {
    messages,
    sendMessage,
    clearChat,
    appendAssistantMessage,
    isLoading,
    error,
    hydrated,
    sessionId,
  } = useChatStore();
  const { play } = useSound();
  const reduceMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [showPulse, setShowPulse] = useState(false);

  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [leadPrefillEmail, setLeadPrefillEmail] = useState('');
  const [leadPrefillMessage, setLeadPrefillMessage] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevMsgCount = useRef(0);
  const pingInitialized = useRef(false);
  const contactChipPendingRef = useRef(false);
  const lastProcessedAssistantId = useRef<string | null>(null);
  const triggerHydratedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (window.localStorage.getItem(SEEN_KEY) !== 'true') {
        setShowPulse(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!pingInitialized.current) {
      prevMsgCount.current = messages.length;
      pingInitialized.current = true;
      return;
    }
    if (messages.length > prevMsgCount.current) {
      const last = messages[messages.length - 1];
      if (last?.role === 'assistant') play('toggle');
    }
    prevMsgCount.current = messages.length;
  }, [hydrated, messages, play]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 50);
    return () => clearTimeout(t);
  }, [open, messages.length, isLoading]);

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !open && fabRef.current) {
      fabRef.current.focus();
    }
    wasOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!hydrated) return;
    if (!triggerHydratedRef.current) {
      const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
      lastProcessedAssistantId.current = lastAssistant?.id ?? null;
      triggerHydratedRef.current = true;
      return;
    }
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant') return;
    if (last.id === lastProcessedAssistantId.current) return;
    lastProcessedAssistantId.current = last.id;

    const fromContactChip = contactChipPendingRef.current;
    contactChipPendingRef.current = false;

    const shouldOpen =
      Boolean(last.isLead) || (last.intent === 'contact' && fromContactChip);

    if (shouldOpen && !leadFormOpen) {
      setLeadFormOpen(true);
    }
  }, [hydrated, messages, leadFormOpen]);

  function handleOpen() {
    setOpen(true);
    play('click');
    if (showPulse) {
      setShowPulse(false);
      try {
        window.localStorage.setItem(SEEN_KEY, 'true');
      } catch {}
    }
  }

  function handleClose() {
    setOpen(false);
    play('click');
  }

  function handleSend(text: string, source: 'typed' | 'chip' = 'typed') {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    if (source === 'typed') {
      const match = trimmed.match(EMAIL_REGEX);
      if (match && !leadFormOpen) {
        setLeadPrefillEmail(match[0]);
        const remainder = trimmed.replace(EMAIL_REGEX, '').trim();
        setLeadPrefillMessage(remainder);
        setLeadFormOpen(true);
        setDraft('');
        play('click');
        return;
      }
    }

    if (source === 'chip' && text === CONTACT_CHIP_SEND) {
      contactChipPendingRef.current = true;
    }

    play('click');
    sendMessage(trimmed);
    setDraft('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSend(draft, 'typed');
  }

  function handleLeadSuccess() {
    setLeadFormOpen(false);
    setLeadPrefillEmail('');
    setLeadPrefillMessage('');
    appendAssistantMessage(
      "Got it — I'll be in touch within 24 hours. Anything else you'd like to know in the meantime?",
      { intent: 'lead_capture', confidence: 'high', isLead: false }
    );
  }

  function handleLeadCancel() {
    setLeadFormOpen(false);
    setLeadPrefillEmail('');
    setLeadPrefillMessage('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(draft);
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          ref={fabRef}
          type="button"
          onClick={open ? handleClose : handleOpen}
          aria-label={open ? 'Close chat' : "Open chat with Vedanshu's AI twin"}
          aria-expanded={open}
          aria-controls="vp-chat-panel"
          className="relative flex h-[52px] w-[52px] items-center justify-center rounded-full bg-accent text-white shadow-[0_0_24px_rgba(124,58,237,0.45)] transition-all hover:bg-accent-glow hover:shadow-[0_0_32px_rgba(167,139,250,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-glow focus-visible:ring-offset-2 focus-visible:ring-offset-background md:h-14 md:w-14"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <X size={22} />
              </motion.span>
            ) : (
              <motion.span
                key="msg"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <MessageCircle size={22} />
              </motion.span>
            )}
          </AnimatePresence>

          {showPulse && !open && !reduceMotion && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full border-2 border-accent-glow"
              animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            key="panel"
            id="vp-chat-panel"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.22, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-label="Chat with Vedanshu's AI twin"
            className={cn(
              'fixed bottom-0 left-0 right-0 top-0 z-50 flex flex-col bg-background',
              'h-[100dvh]',
              'sm:bottom-24 sm:left-auto sm:right-6 sm:top-auto sm:h-[600px] sm:max-h-[calc(100dvh-8rem)] sm:w-[380px]',
              'sm:glass-strong sm:rounded-2xl sm:border sm:border-white/10 sm:bg-background/95 sm:shadow-[0_8px_40px_rgba(0,0,0,0.5)]'
            )}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent-glow">
                  <Sparkles size={16} />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium text-foreground">
                    {profile.name}
                  </span>
                  <span className="font-mono text-[11px] text-foreground/55">
                    Ask my AI twin
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      clearChat();
                      play('click');
                    }}
                    aria-label="Clear conversation"
                    className="rounded-full p-1.5 text-foreground/55 transition-colors hover:bg-white/5 hover:text-foreground"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close chat"
                  className="rounded-full p-1.5 text-foreground/55 transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4"
              aria-live="polite"
            >
              {messages.length === 0 && (
                <div className="flex flex-col gap-3 pt-2">
                  <div className="glass max-w-[85%] rounded-2xl rounded-tl-sm border border-white/10 px-3.5 py-2.5 text-sm leading-relaxed text-foreground/85">
                    Hey — I&apos;m {profile.name.split(' ')[0]}&apos;s AI twin. Ask me
                    about my projects, stack, or work. I&apos;ll keep it tight.
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}

              {leadFormOpen && (
                <LeadForm
                  sessionId={sessionId}
                  initialEmail={leadPrefillEmail}
                  initialMessage={leadPrefillMessage}
                  recentMessages={formatRecentMessages(messages)}
                  onSuccess={handleLeadSuccess}
                  onCancel={handleLeadCancel}
                />
              )}

              {isLoading && (
                <div className="mt-3 flex justify-start">
                  <div className="glass flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white/10 px-3.5 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-foreground/60"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1.1,
                          repeat: Infinity,
                          delay: i * 0.18,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <p className="mt-3 text-center font-mono text-[11px] text-red-400/80">
                  {error} — message saved, try again.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 border-t border-white/10 px-3 pb-2 pt-3">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q.send}
                  type="button"
                  onClick={() => handleSend(q.send, 'chip')}
                  disabled={isLoading || leadFormOpen}
                  aria-label={`Quick reply: ${q.send}`}
                  className="glass flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[12px] text-foreground/80 transition-all hover:border-accent/40 hover:bg-white/[0.06] hover:text-foreground focus-visible:border-accent/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span aria-hidden>{q.emoji}</span>
                  <span>{q.send}</span>
                </button>
              ))}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 border-t border-white/10 px-3 pt-3"
              style={{
                paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
              }}
            >
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about my work…"
                rows={1}
                maxLength={500}
                disabled={isLoading}
                className="max-h-32 min-h-[40px] flex-1 resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isLoading}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-[0_0_18px_rgba(124,58,237,0.35)] transition-all hover:bg-accent-glow hover:shadow-[0_0_24px_rgba(167,139,250,0.5)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

type Msg = ReturnType<typeof useChatStore>['messages'][number];

type LeadFormProps = {
  sessionId: string;
  initialEmail: string;
  initialMessage: string;
  recentMessages: string;
  onSuccess: () => void;
  onCancel: () => void;
};

function LeadForm({
  sessionId,
  initialEmail,
  initialMessage,
  recentMessages,
  onSuccess,
  onCancel,
}: LeadFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState(initialMessage);
  const [wantsCall, setWantsCall] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const reduceMotion = useReducedMotion();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError('');
    setSubmitError('');

    if (!isValidEmail(email)) {
      setEmailError('That email looks off — double-check it?');
      return;
    }

    setSubmitting(true);

    const [emailResult, apiResult] = await Promise.allSettled([
      sendLeadEmail({
        email: email.trim(),
        message: message.trim(),
        wantsCall,
        sessionId,
        recentMessages,
      }),
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          email: email.trim(),
          message: message.trim() || undefined,
          wantsCall,
        }),
      }).then((r) => {
        if (!r.ok) throw new Error(`lead api: HTTP ${r.status}`);
        return r.json();
      }),
    ]);

    setSubmitting(false);

    if (emailResult.status === 'rejected' || apiResult.status === 'rejected') {
      if (emailResult.status === 'rejected') {
        console.error('[lead] emailjs failed:', emailResult.reason);
      }
      if (apiResult.status === 'rejected') {
        console.error('[lead] /api/lead failed:', apiResult.reason);
      }
      setSubmitError("Couldn't send. Try once more — your input is saved.");
      return;
    }

    onSuccess();
  }

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.1 : 0.22, ease: 'easeOut' }}
      className="mt-3 flex justify-start"
    >
      <form
        onSubmit={handleSubmit}
        role="form"
        aria-label="Contact form"
        className="glass w-full max-w-[90%] rounded-2xl rounded-tl-sm border border-white/10 px-3.5 py-3"
      >
        <p className="mb-2.5 text-[13px] leading-snug text-foreground/85">
          Drop your details and I&apos;ll get back within 24 hours.
        </p>

        <label className="mb-2 block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-foreground/55">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            placeholder="you@company.com"
            required
            autoComplete="email"
            disabled={submitting}
            className={cn(
              'w-full rounded-lg border bg-white/[0.04] px-2.5 py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 disabled:opacity-50',
              emailError
                ? 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/30'
                : 'border-white/10 focus:border-accent/40 focus:ring-accent/30'
            )}
          />
          {emailError && (
            <span className="mt-1 block text-[11px] text-red-300/80">{emailError}</span>
          )}
        </label>

        <label className="mb-2 block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-foreground/55">
            Message (optional)
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's this about?"
            rows={2}
            maxLength={2000}
            disabled={submitting}
            className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-50"
          />
        </label>

        <label className="mb-3 flex cursor-pointer items-center gap-2 text-[12px] text-foreground/80">
          <input
            type="checkbox"
            checked={wantsCall}
            onChange={(e) => setWantsCall(e.target.checked)}
            disabled={submitting}
            className="h-3.5 w-3.5 cursor-pointer accent-[#7c3aed]"
          />
          <span>I&apos;d like to book a 30-min call</span>
        </label>

        {submitError && (
          <p className="mb-2 text-[11px] text-red-300/80">{submitError}</p>
        )}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-[12px] font-medium text-white shadow-[0_0_16px_rgba(124,58,237,0.35)] transition-all hover:bg-accent-glow hover:shadow-[0_0_22px_rgba(167,139,250,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Sending…' : 'Send'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-full border border-white/10 px-3 py-1.5 text-[12px] text-foreground/70 transition-colors hover:bg-white/5 hover:text-foreground disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function MessageBubble({ message }: { message: Msg }) {
  const isUser = message.role === 'user';
  const isResume = !isUser && message.intent === 'resume';
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.1 : 0.2, ease: 'easeOut' }}
      className={cn('mt-3 flex w-full', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[85%] whitespace-pre-wrap rounded-2xl border px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'rounded-tr-sm border-accent/30 bg-accent/20 text-foreground'
            : 'glass rounded-tl-sm border-white/10 text-foreground/90',
          message.failed && 'border-red-500/50 text-red-200/80'
        )}
      >
        <div>{message.content}</div>
        {isResume && (
          <a
            href={profile.links.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-[0_0_16px_rgba(124,58,237,0.35)] transition-all hover:bg-accent-glow"
          >
            <Download size={13} />
            Download Resume
          </a>
        )}
        {message.failed && (
          <div className="mt-1 font-mono text-[10px] text-red-300/70">
            failed to send
          </div>
        )}
      </div>
    </motion.div>
  );
}
