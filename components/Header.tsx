'use client';

import { Memo } from '@/types/memo';
import ShareButton from './ShareButton';

interface Props {
  memos: Memo[];
}

export default function Header({ memos }: Props) {
  return (
    <header className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
      <span
        style={{
          fontSize: '15px',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
        }}
      >
        ボイスメモ
      </span>
      <ShareButton memos={memos} />
    </header>
  );
}
