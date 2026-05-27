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

    // 右スワイプのみカードが処理（伝播を止める）
    // 左スワイプはそのままページ切替へ伝播させる
    if (dx > 0) {
      e.stopPropagation();
      setIsSwiping(true);
      setSlideX(Math.min(100, dx));
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (isSwiping) {
      e.stopPropagation();
      if (slideX >= SWIPE_THRESHOLD) {
        onToggle(memo.id);
      }
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
      className="relative overflow-hidden rounded-2xl"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* スワイプ時に現れる背景アクション */}
      <div
        className={`absolute inset-y-0 left-0 flex items-center pl-5 transition-opacity duration-150 ${
          showHint ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center ${
            memo.completed ? 'bg-gray-200 dark:bg-gray-700' : 'bg-green-100'
          }`}
        >
          {memo.completed ? (
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* カード本体 */}
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
        style={{
          transform: `translateX(${slideX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.25s ease',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400">{formatDate(memo.createdAt)}</span>
          {!isEditing && (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
              >
                編集
              </button>
              <button
                onClick={() => onRemove(memo.id)}
                className="text-xs text-red-400 hover:text-red-600 font-medium"
              >
                削除
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={4}
              className="w-full text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleCancel}
                className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg font-medium"
              >
                保存
              </button>
            </div>
          </>
        ) : (
          <p
            className={`text-sm leading-relaxed whitespace-pre-wrap ${
              memo.completed
                ? 'line-through text-gray-400 dark:text-gray-500'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {memo.text}
          </p>
        )}
      </div>
    </div>
  );
}
