'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Memo } from '@/types/memo';

interface Props {
  memos: Memo[];
}

export default function ShareButton({ memos }: Props) {
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleShare = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!memos || memos.length === 0) {
        showToast('共有できるメモがありません');
        return;
      }

      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memos }),
      });

      if (res.status === 503) {
        showToast('共有機能は準備中です（ストレージ未接続）');
        return;
      }
      if (!res.ok) {
        showToast('共有リンクの作成に失敗しました');
        return;
      }

      const { id } = await res.json();
      const url = `${window.location.origin}/s/${id}`;

      // iOS等では OS の共有シート（LINE/Slack 等）を直接開く
      if (navigator.share) {
        try {
          await navigator.share({ title: 'ボイスメモ', text: 'メモを共有します', url });
          return;
        } catch {
          // ユーザーがキャンセル等 → クリップボードにフォールバック
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        showToast('共有リンクをコピーしました（7日間有効）');
      } catch {
        showToast(url);
      }
    } catch {
      showToast('共有に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        disabled={busy}
        aria-label="メモを共有"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          cursor: busy ? 'default' : 'pointer',
          padding: '4px 2px',
          color: 'var(--text-secondary)',
          fontSize: '12px',
          fontFamily: 'inherit',
          opacity: busy ? 0.5 : 1,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        共有
      </button>

      {toast && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#111',
            color: '#fff',
            fontSize: '13px',
            padding: '8px 20px',
            borderRadius: '999px',
            zIndex: 9999,
            maxWidth: '90vw',
            textAlign: 'center',
          }}
        >
          {toast}
        </div>,
        document.body
      )}
    </>
  );
}
