'use client';

import { useRef, useState } from 'react';
import { Memo } from '@/types/memo';

interface Props {
  memo: Memo;
  onUpdate: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
}

const SWIPE_THRESHOLD = 60;

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MemoCard({ memo, onUpdate, onRemove, onToggle }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(memo.text);
  const [slideX, setSlideX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const dirRef = useRef<'h' | 'v' | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    dirRef.current = null;
    setIsSwiping(false);
    setSlideX(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startXRef.current;
    const dy = e.touches[0].clientY - startYRef.current;
    if (dirRef.current === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      dirRef.current = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
    }
    if (dirRef.current !== 'h') return;
    if (dx > 0) {
      e.stopPropagation();
      setIsSwiping(true);
      setSlideX(Math.min(100, dx));
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (isSwiping) {
      e.stopPropagation();
      if (slideX >= SWIPE_THRESHOLD) onToggle(memo.id);
    }
    setSlideX(0);
    setIsSwiping(false);
  };

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed) onUpdate(memo.id, trimmed);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(memo.text);
    setIsEditing(false);
  };

  const showHint = slideX > 20;

  return (
    <div
      className="relative overflow-hidden"
      style={{ borderRadius: '16px', animation: 'memo-in 0.3s ease forwards' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* スワイプ背景アクション */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '18px',
          opacity: showHint ? 1 : 0,
          transition: 'opacity 0.15s',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: memo.completed ? '#e8e8e8' : '#e8f5e9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {memo.completed ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2L2 10" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6.5l3 3 5-6" stroke="#4caf50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>

      {/* カード本体 */}
      <div
        style={{
          background: 'var(--input)',
          borderRadius: '16px',
          padding: '16px 18px',
          transform: `translateX(${slideX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.25s ease',
        }}
      >
        {/* ヘッダー行 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {formatDate(memo.createdAt)}
          </span>
          {!isEditing && (
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => setIsEditing(true)}
                style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                編集
              </button>
              <button
                onClick={() => onRemove(memo.id)}
                style={{ fontSize: '12px', color: '#ccc', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                削除
              </button>
            </div>
          )}
        </div>

        {/* 本文 */}
        {isEditing ? (
          <>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                fontSize: '14px',
                color: 'var(--text-primary)',
                background: 'var(--card)',
                border: '1px solid #e8e8e8',
                borderRadius: '10px',
                padding: '10px 12px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.6,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={handleCancel}
                style={{ fontSize: '13px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                style={{
                  fontSize: '13px',
                  color: '#fff',
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 16px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                保存
              </button>
            </div>
          </>
        ) : (
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
              color: memo.completed ? '#bbb' : 'var(--text-primary)',
              textDecoration: memo.completed ? 'line-through' : 'none',
            }}
          >
            {memo.text}
          </p>
        )}
      </div>
    </div>
  );
}
