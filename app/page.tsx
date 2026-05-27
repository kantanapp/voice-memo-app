'use client';

import { useMemo } from 'react';
import { useMemos } from '@/hooks/useMemos';
import SwipeContainer from '@/components/SwipeContainer';
import RecordView from '@/components/RecordView';
import MemosView from '@/components/MemosView';

export default function Page() {
  const { memos, save, update, remove, toggle, favorite } = useMemos();

  const favoriteMemos = useMemo(
    () => memos.filter((m) => m.favorited).slice(0, 2),
    [memos]
  );

  // views の順番 = BottomNav のタブ順: [0=メモ一覧, 1=録音]
  const views = useMemo(
    () => [
      <MemosView key="memos" memos={memos} onUpdate={update} onRemove={remove} onToggle={toggle} onFavorite={favorite} />,
      <RecordView key="record" onSave={save} favoriteMemos={favoriteMemos} onUpdate={update} onRemove={remove} onToggle={toggle} onFavorite={favorite} />,
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [memos, favoriteMemos]
  );

  return <SwipeContainer views={views} defaultIndex={1} />;
}
