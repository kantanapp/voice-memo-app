'use client';

import { useCallback, useEffect, useState } from 'react';
import { Memo } from '@/types/memo';

export const STORAGE_KEY = 'voice-memos';

function loadMemos(): Memo[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    // 未保存なら空（一覧は「まだメモがありません」を表示）。サンプルは持たない。
    if (stored === null) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    // 旧バージョンのサンプル混入バグの掃除：
    // 本物のメモは crypto.randomUUID() 由来なので、id が 'sample-' で始まるものだけ除去する。
    return parsed.filter(
      (m: Memo) => !(typeof m?.id === 'string' && m.id.startsWith('sample-'))
    );
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

  // 論理削除（トゥームストーン）。配列からは消さず deletedAt を立てる。
  // updatedAt も更新し、共有マージで「新しい方が勝つ」ことで削除が他端末へ伝播する。
  const remove = useCallback((id: string) => {
    setMemos((prev) => {
      const now = Date.now();
      const next = prev.map((m) =>
        m.id === id ? { ...m, deletedAt: now, updatedAt: now } : m
      );
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

  // お気に入りトグル（件数上限なし）
  const favorite = useCallback((id: string) => {
    setMemos((prev) => {
      const next = prev.map((m) =>
        m.id === id ? { ...m, favorited: !m.favorited } : m
      );
      persist(next);
      return next;
    });
  }, []);

  return { memos, save, update, remove, toggle, favorite, search };
}
