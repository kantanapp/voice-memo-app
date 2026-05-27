'use client';

import { useState } from 'react';
import { Memo } from '@/types/memo';
import MemoCard from './MemoCard';

interface MemoListProps {
  memos: Memo[];
  onUpdate: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  search: (query: string) => Memo[];
}

export default function MemoList({ memos, onUpdate, onRemove, search }: MemoListProps) {
  const [query, setQuery] = useState('');
  const displayed = query ? search(query) : memos;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          type="search"
          placeholder="メモを検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {displayed.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-12">
          {query ? '検索結果がありません' : 'まだメモがありません'}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {displayed.map((memo) => (
            <MemoCard
              key={memo.id}
              memo={memo}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
