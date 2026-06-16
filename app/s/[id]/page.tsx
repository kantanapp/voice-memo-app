'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Memo } from '@/types/memo';
import { STORAGE_KEY } from '@/hooks/useMemos';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; memos: Memo[] }
  | { status: 'done'; added: number; removed: number };

// 追記マージ。同idは updatedAt が新しい方を採用するため、削除（deletedAt 付き）も伝播する。
// added = 新規に追加された生メモ数、removed = 取り込みにより削除された生メモ数
function mergeIntoLocal(incoming: Memo[]): { added: number; removed: number } {
  let existing: Memo[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    existing = raw ? JSON.parse(raw) : [];
  } catch {
    existing = [];
  }

  const map = new Map<string, Memo>();
  for (const m of existing) map.set(m.id, m);

  let added = 0;
  let removed = 0;
  for (const m of incoming) {
    const cur = map.get(m.id);
    if (!cur) {
      map.set(m.id, m);
      if (!m.deletedAt) added++; // 削除済みメモの取り込みは「追加」に数えない
    } else if ((m.updatedAt ?? 0) > (cur.updatedAt ?? 0)) {
      if (!cur.deletedAt && m.deletedAt) removed++; // 生メモが削除に変わる
      map.set(m.id, m);
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify([...map.values()]));
  return { added, removed };
}

export default function SharePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const id = params?.id;
    if (!id) {
      setState({ status: 'error', message: 'リンクが正しくありません' });
      return;
    }
    fetch(`/api/share/${id}`)
      .then(async (res) => {
        if (res.status === 404) throw new Error('リンクが見つかりません（期限切れの可能性があります）');
        if (res.status === 503) throw new Error('共有機能は現在利用できません');
        if (!res.ok) throw new Error('読み込みに失敗しました');
        const data = await res.json();
        const memos = data?.memos;
        if (!Array.isArray(memos)) throw new Error('データの形式が正しくありません');
        setState({ status: 'ready', memos });
      })
      .catch((e: Error) => setState({ status: 'error', message: e.message }));
  }, [params]);

  const handleImport = () => {
    if (state.status !== 'ready') return;
    const { added, removed } = mergeIntoLocal(state.memos);
    setState({ status: 'done', added, removed });
  };

  // 表示用は生メモ（削除済みを除く）だけ
  const liveMemos = state.status === 'ready' ? state.memos.filter((m) => !m.deletedAt) : [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      <header className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          ボイスメモ
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>メモの取り込み</span>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-2 pb-8">
        {state.status === 'loading' && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', padding: '48px 0' }}>
            読み込み中…
          </p>
        )}

        {state.status === 'error' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: 'var(--text-primary)', fontSize: '14px', marginBottom: '20px' }}>{state.message}</p>
            <button onClick={() => router.push('/')} style={btnSecondary}>ホームへ</button>
          </div>
        )}

        {state.status === 'ready' && (
          <>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {liveMemos.length}件のメモを受け取りました
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              いまの端末のメモに<strong>追記</strong>します。送信側で削除されたメモは、この端末でも削除されます。
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {liveMemos.slice(0, 20).map((m) => (
                <div key={m.id} style={{ background: 'var(--input)', borderRadius: '12px', padding: '12px 14px' }}>
                  <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                    {m.text}
                  </p>
                </div>
              ))}
              {liveMemos.length > 20 && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  ほか {liveMemos.length - 20} 件
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => router.push('/')} style={btnSecondary}>キャンセル</button>
              <button onClick={handleImport} style={btnPrimary}>取り込む（追記）</button>
            </div>
          </>
        )}

        {state.status === 'done' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: 'var(--text-primary)', fontSize: '14px', marginBottom: '8px' }}>
              {state.added === 0 && state.removed === 0
                ? '変更はありませんでした（すべて同期済み）'
                : [
                    state.added > 0 ? `${state.added}件を追加` : null,
                    state.removed > 0 ? `${state.removed}件を削除` : null,
                  ]
                    .filter(Boolean)
                    .join('、') + 'しました'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              ホームで確認できます。
            </p>
            <button onClick={() => router.push('/')} style={btnPrimary}>メモ一覧を見る</button>
          </div>
        )}
      </div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  fontSize: '14px',
  color: '#fff',
  background: 'var(--accent)',
  border: 'none',
  borderRadius: '12px',
  padding: '12px 24px',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const btnSecondary: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--text-secondary)',
  background: 'var(--input)',
  border: 'none',
  borderRadius: '12px',
  padding: '12px 24px',
  cursor: 'pointer',
  fontFamily: 'inherit',
};
