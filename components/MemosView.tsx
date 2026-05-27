'use client';

import { Memo } from '@/types/memo';
import MemoList from './MemoList';

interface Props {
  memos: Memo[];
  onUpdate: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function MemosView({ memos, onUpdate, onRemove, onToggle }: Props) {
  return (
    <div className="px-4 py-6">
      <h1 className="text-lg font-semibold mb-5">メモ一覧</h1>
      <MemoList memos={memos} onUpdate={onUpdate} onRemove={onRemove} onToggle={onToggle} />
    </div>
  );
}
