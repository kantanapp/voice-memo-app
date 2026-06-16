'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Memo } from '@/types/memo';

interface Props {
  // 表示中の生メモ（削除済み除外・並び替え済み）
  memos: Memo[];
}

function fmtDate(ts: number) {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function buildText(items: Memo[], target: 'all' | 'fav') {
  const title = target === 'fav' ? 'ボイスメモ（お気に入り）' : 'ボイスメモ（メモ一覧）';
  const body = items
    .map((m) => {
      const star = m.favorited ? '★ ' : '';
      const done = m.completed ? '【完了】' : '';
      return `${star}[${fmtDate(m.createdAt)}] ${done}${m.text}`;
    })
    .join('\n\n');
  return `${title}\n\n${body}\n`;
}

export default function ExportButton({ memos }: Props) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<'all' | 'fav'>('all');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const items = target === 'fav' ? memos.filter((m) => m.favorited) : memos;
  const text = buildText(items, target);
  const canExport = items.length > 0;

  const handleCopy = async () => {
    if (!canExport) return showToast('出力するメモがありません');
    try {
      await navigator.clipboard.writeText(text);
      showToast('コピーしました');
    } catch {
      showToast('コピーに失敗しました');
    }
  };

  const handleShare = async () => {
    if (!canExport) return showToast('出力するメモがありません');
    if (navigator.share) {
      try {
        // title は付けない（送信先で本文先頭の「ボイスメモ（…）」と二重表示になるため）
        await navigator.share({ text });
        return;
      } catch {
        return; // キャンセル等は何もしない
      }
    }
    // 共有非対応はコピーにフォールバック
    handleCopy();
  };

  const handleDownload = () => {
    if (!canExport) return showToast('出力するメモがありません');
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    const name = `voicememo-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}.txt`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('ファイルを保存しました');
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="テキストで書き出し"
        style={iconBtn}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="13" y2="17" />
        </svg>
        書き出し
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '420px',
              background: 'var(--card)',
              borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
              padding: '20px 20px calc(env(safe-area-inset-bottom, 0px) + 20px)',
              boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
            }}
          >
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
              テキストで書き出し
            </p>

            {/* 対象トグル */}
            <div style={{ display: 'flex', gap: '8px', background: 'var(--input)', borderRadius: '10px', padding: '4px', marginBottom: '14px' }}>
              {([['all', '全メモ'], ['fav', 'お気に入り']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTarget(key)}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '13px', fontFamily: 'inherit',
                    fontWeight: target === key ? 600 : 400,
                    background: target === key ? 'var(--card)' : 'transparent',
                    color: target === key ? 'var(--text-primary)' : 'var(--text-secondary)',
                    boxShadow: target === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              {canExport ? `${items.length}件を書き出します` : '対象のメモがありません'}
            </p>

            {/* アクション */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={handleCopy} disabled={!canExport} style={actionBtn(canExport)}>コピー</button>
              <button onClick={handleShare} disabled={!canExport} style={actionBtn(canExport)}>共有で送る（LINE等）</button>
              <button onClick={handleDownload} disabled={!canExport} style={actionBtn(canExport)}>テキストファイル(.txt)で保存</button>
              <button onClick={() => setOpen(false)} style={{ ...actionBtn(true), background: 'transparent', color: 'var(--text-muted)' }}>閉じる</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {toast && typeof document !== 'undefined' && createPortal(
        <div style={toastStyle}>{toast}</div>,
        document.body
      )}
    </>
  );
}

const iconBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '4px',
  background: 'none', border: 'none', cursor: 'pointer',
  padding: '4px 2px', color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'inherit',
};

const actionBtn = (enabled: boolean): React.CSSProperties => ({
  width: '100%', padding: '13px 0', borderRadius: '12px', border: 'none',
  fontSize: '14px', fontFamily: 'inherit', cursor: enabled ? 'pointer' : 'default',
  background: enabled ? 'var(--input)' : '#f0f0f0',
  color: enabled ? 'var(--text-primary)' : '#bbb',
});

const toastStyle: React.CSSProperties = {
  position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)', left: '50%',
  transform: 'translateX(-50%)', background: '#111', color: '#fff', fontSize: '13px',
  padding: '8px 20px', borderRadius: '999px', zIndex: 9999, maxWidth: '90vw', textAlign: 'center',
};
