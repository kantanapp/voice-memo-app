'use client';

import { useMemo } from 'react';
import { useMemos } from '@/hooks/useMemos';
import Header from '@/components/Header';
import RecordView from '@/components/RecordView';

export default function Page() {
  const { memos, save, update, remove, toggle, favorite } = useMemos();

  // お気に入り（上部）→ 未完了 → 完了済み、各グループ内は新しい順
  // 論理削除済み（deletedAt あり）は一覧から除外
  const sortedMemos = useMemo(
    () =>
      memos
        .filter((m) => !m.deletedAt)
        .sort((a, b) => {
        const aFav = a.favorited ? 0 : 1;
        const bFav = b.favorited ? 0 : 1;
        if (aFav !== bFav) return aFav - bFav;
        const aComp = a.completed ? 1 : 0;
        const bComp = b.completed ? 1 : 0;
        if (aComp !== bComp) return aComp - bComp;
        return b.createdAt - a.createdAt;
      }),
    [memos]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      <Header memos={memos} />
      <RecordView
        onSave={save}
        memos={sortedMemos}
        onUpdate={update}
        onRemove={remove}
        onToggle={toggle}
        onFavorite={favorite}
      />
    </div>
  );
}
