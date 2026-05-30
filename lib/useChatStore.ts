'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'vp_chat_v1';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type Intent =
  | 'projects'
  | 'skills'
  | 'experience'
  | 'education'
  | 'contact'
  | 'resume'
  | 'about'
  | 'offtopic'
  | 'unknown'
  | 'lead_capture';
export type Confidence = 'high' | 'medium' | 'low';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  intent?: Intent;
  confidence?: Confidence;
  isLead?: boolean;
  failed?: boolean;
};

type Stored = {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: number;
  lastSeenAt: number;
};

function safeRandomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function freshSession(): Stored {
  const now = Date.now();
  return {
    sessionId: safeRandomId(),
    messages: [],
    createdAt: now,
    lastSeenAt: now,
  };
}

function loadFromStorage(): Stored | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (
      !parsed ||
      typeof parsed.sessionId !== 'string' ||
      !Array.isArray(parsed.messages) ||
      typeof parsed.lastSeenAt !== 'number'
    ) {
      return null;
    }
    if (Date.now() - parsed.lastSeenAt > TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function persist(state: Stored): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota / private-mode: swallow, conversation just won't persist this turn
  }
}

type ApiResponse = {
  reply: string;
  intent: Intent;
  isLead: boolean;
  confidence: Confidence;
};

export function useChatStore() {
  const [state, setState] = useState<Stored>(freshSession);
  const [hydrated, setHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const loaded = loadFromStorage();
    if (loaded) {
      setState({ ...loaded, lastSeenAt: Date.now() });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persist(state);
  }, [hydrated, state]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || inFlight.current) return;

    inFlight.current = true;
    setError(null);
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: safeRandomId(),
      role: 'user',
      content: trimmed,
      createdAt: Date.now(),
    };

    const current = stateRef.current;
    const cleanedHistory = current.messages.filter((m) => !m.failed);
    const snapshotForApi = [...cleanedHistory, userMsg];

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages.filter((m) => !m.failed), userMsg],
      lastSeenAt: Date.now(),
    }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: current.sessionId,
          messages: snapshotForApi.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok && res.status !== 429) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as ApiResponse;

      const assistantMsg: ChatMessage = {
        id: safeRandomId(),
        role: 'assistant',
        content: data.reply,
        createdAt: Date.now(),
        intent: data.intent,
        confidence: data.confidence,
        isLead: data.isLead,
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMsg],
        lastSeenAt: Date.now(),
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Network error';
      setError(msg);
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === userMsg.id ? { ...m, failed: true } : m
        ),
        lastSeenAt: Date.now(),
      }));
    } finally {
      inFlight.current = false;
      setIsLoading(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setState(freshSession());
    setError(null);
  }, []);

  const appendAssistantMessage = useCallback(
    (
      content: string,
      metadata?: Partial<Pick<ChatMessage, 'intent' | 'confidence' | 'isLead'>>
    ) => {
      const msg: ChatMessage = {
        id: safeRandomId(),
        role: 'assistant',
        content,
        createdAt: Date.now(),
        ...metadata,
      };
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, msg],
        lastSeenAt: Date.now(),
      }));
    },
    []
  );

  return {
    sessionId: state.sessionId,
    messages: state.messages,
    sendMessage,
    clearChat,
    appendAssistantMessage,
    isLoading,
    error,
    hydrated,
  };
}
