'use client';

import { Memo } from '@/types/memo';
import ShareButton from './ShareButton';
import ExportButton from './ExportButton';

interface Props {
  // 共有リンク用：全メモ（削除トゥームストーン含む）
  memos: Memo[];
  // テキスト書き出し用：表示中の生メモ（削除除外・並び替え済み）
  displayMemos: Memo[];
}

export default function Header({ memos, displayMemos }: Props) {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <ExportButton memos={displayMemos} />
        <ShareButton memos={memos} />
      </div>
    </header>
  );
}
