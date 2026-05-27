'use client';

import { useMemo } from 'react';
import { useMemos } from '@/hooks/useMemos';
import SwipeContainer from '@/components/SwipeContainer';
import RecordView from '@/components/RecordView';
import MemosView from '@/components/MemosView';

export default function Page() {
  const { memos, save, update, remove, toggle } = useMemos();

  // views の順番 = BottomNav のタブ順: [0=メモ一覧, 1=録音]
  const views = useMemo(
    () => [
      <MemosView key="memos" memos={memos} onUpdate={update} onRemove={remove} onToggle={toggle} />,
      <RecordView key="record" onSave={save} />,
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [memos]
  );

  return <SwipeContainer views={views} defaultIndex={1} />;
}
