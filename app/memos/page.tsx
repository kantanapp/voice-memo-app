'use client';

import { useMemos } from '@/hooks/useMemos';
import MemoList from '@/components/MemoList';

export default function MemosPage() {
  const { memos, update, remove, search } = useMemos();

  return (
    <div className="px-4 py-6">
      <h1 className="text-lg font-semibold mb-5">メモ一覧</h1>
      <MemoList memos={memos} onUpdate={update} onRemove={remove} search={search} />
    </div>
  );
}
