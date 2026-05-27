'use client';

import { useState } from 'react';
import { Memo } from '@/types/memo';
import MemoCard from './MemoCard';

interface Props {
  memos: Memo[];
  onUpdate: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  onFavorite: (id: string) => void;
}

export default function MemosView({ memos, onUpdate, onRemove, onToggle, onFavorite }: Props) {
  const [query, setQuery] = useState('');

  const filtered = query
    ? memos.filter((m) => m.text.toLowerCase().includes(query.toLowerCase()))
    : memos;

  // 未完了（新しい順）→ 完了済み（新しい順）
  const displayed = [...filtered].sort((a, b) => {
    const aComp = a.completed ? 1 : 0;
    const bComp = b.completed ? 1 : 0;
    if (aComp !== bComp) return aComp - bComp;
    return b.createdAt - a.createdAt;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* スクロール可能なカードエリア */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 8px' }}>
        {displayed.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', padding: '48px 0' }}>
            {query ? '検索結果がありません' : 'まだメモがありません'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {displayed.map((memo) => (
              <MemoCard
                key={memo.id}
                memo={memo}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onToggle={onToggle}
                onFavorite={onFavorite}
              />
            ))}
          </div>
        )}
      </div>

      {/* 検索バー（BottomNav 直上に固定） */}
      <div
        style={{
          padding: '12px 20px',
          background: 'var(--bg)',
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <div style={{ position: 'relative' }}>
          <svg
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#bbb' }}
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="search"
            placeholder="検索"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '36px',
              paddingRight: '16px',
              paddingTop: '10px',
              paddingBottom: '10px',
              background: 'var(--input)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>
    </div>
  );
}
