'use client';

import { useState } from 'react';
import { Memo } from '@/types/memo';

interface MemoCardProps {
  memo: Memo;
  onUpdate: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MemoCard({ memo, onUpdate, onRemove }: MemoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(memo.text);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed) {
      onUpdate(memo.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(memo.text);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
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
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {memo.text}
        </p>
      )}
    </div>
  );
}
