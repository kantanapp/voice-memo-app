'use client';

import { useCallback, useEffect, useState } from 'react';
import { Memo } from '@/types/memo';

const STORAGE_KEY = 'voice-memos';

function loadMemos(): Memo[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function persist(memos: Memo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
}

export function useMemos() {
  const [memos, setMemos] = useState<Memo[]>([]);

  useEffect(() => {
    setMemos(loadMemos());
  }, []);

  const save = useCallback((text: string) => {
    const memo: Memo = {
      id: crypto.randomUUID(),
      text,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setMemos((prev) => {
      const next = [memo, ...prev];
      persist(next);
      return next;
    });
  }, []);

  const update = useCallback((id: string, text: string) => {
    setMemos((prev) => {
      const next = prev.map((m) =>
        m.id === id ? { ...m, text, updatedAt: Date.now() } : m
      );
      persist(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setMemos((prev) => {
      const next = prev.filter((m) => m.id !== id);
      persist(next);
      return next;
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setMemos((prev) => {
      const next = prev.map((m) =>
        m.id === id ? { ...m, completed: !m.completed, updatedAt: Date.now() } : m
      );
      persist(next);
      return next;
    });
  }, []);

  const search = useCallback(
    (query: string): Memo[] => {
      if (!query.trim()) return memos;
      const q = query.toLowerCase();
      return memos.filter((m) => m.text.toLowerCase().includes(q));
    },
    [memos]
  );

  return { memos, save, update, remove, toggle, search };
}
