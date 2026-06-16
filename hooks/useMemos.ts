'use client';

import { useCallback, useEffect, useState } from 'react';
import { Memo } from '@/types/memo';

const STORAGE_KEY = 'voice-memos';

const SAMPLE_MEMOS: Memo[] = [
  {
    id: 'sample-1',
    text: '明日の朝、駅前のカフェで10時に打ち合わせ。資料を忘れずに持っていく。',
    createdAt: Date.now() - 1000 * 60 * 10,
    updatedAt: Date.now() - 1000 * 60 * 10,
    favorited: true,
  },
  {
    id: 'sample-2',
    text: 'スーパーで買うもの：牛乳、卵、パン、野菜（キャベツ・にんじん）',
    createdAt: Date.now() - 1000 * 60 * 60,
    updatedAt: Date.now() - 1000 * 60 * 60,
    completed: true,
  },
  {
    id: 'sample-3',
    text: 'Aプロジェクトのデザイン修正。フォントサイズを少し大きくして余白を調整する。レスポンシブ対応も確認。',
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    updatedAt: Date.now() - 1000 * 60 * 60 * 3,
    favorited: true,
  },
  {
    id: 'sample-4',
    text: '週末に公園でピクニック。お弁当を準備しておく。',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
  },
];

function loadMemos(): Memo[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    // 未保存の場合はサンプルデータを表示（保存はしない）
    if (stored === null) return SAMPLE_MEMOS;
    return JSON.parse(stored);
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
