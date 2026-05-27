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
    <div style={{ padding: '4px 20px 32px' }}>
      <MemoList memos={memos} onUpdate={onUpdate} onRemove={onRemove} onToggle={onToggle} />
    </div>
  );
}
