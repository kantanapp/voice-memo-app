'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Memo } from '@/types/memo';
import { STORAGE_KEY } from '@/hooks/useMemos';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; memos: Memo[] }
  | { status: 'done'; added: number; revived: number };

// LINE / Facebook / Instagram などのアプリ内ブラウザ検知。
// アプリ内ブラウザは localStorage が通常ブラウザ（Safari/Chrome）と別物のため、
// ここで取り込んでも普段のブラウザには反映されない。事前に注意を促す。
function detectInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Line\/|FBAN|FBAV|Instagram|Twitter|Micromessenger|; wv\)/i.test(ua);
}

// 取り込み（追加・復活優先）。
// 「取り込む」を押したら、送られてきた生きたメモは必ず手元に残す：
//  - 手元に無ければ追加
//  - 手元で削除済み（トゥームストーン）なら復活させる
//  - 両方生きていれば updatedAt が新しい方の内容を採用
// 受け取り側のメモを消さないため、送信側の削除（deletedAt 付き）は取り込まない。
// added = 新規追加した件数、revived = 削除済みから復活した件数
function mergeIntoLocal(incoming: Memo[]): { added: number; revived: number } {
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
  let revived = 0;
  for (const m of incoming) {
    if (m.deletedAt) continue; // 削除は伝播させない（手元のメモを消さない）
    const cur = map.get(m.id);
    if (!cur) {
      map.set(m.id, m);
      added++;
    } else if (cur.deletedAt) {
      // 手元で削除済み → 生きた状態で復活
      map.set(m.id, { ...m, deletedAt: undefined });
      revived++;
    } else if ((m.updatedAt ?? 0) > (cur.updatedAt ?? 0)) {
      // 両方生きている → 新しい方の内容を採用
      map.set(m.id, m);
    }
    // それ以外（手元の生メモの方が新しい）はそのまま
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify([...map.values()]));
  return { added, revived };
}

export default function SharePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    setInApp(detectInAppBrowser());
  }, []);

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
    const { added, revived } = mergeIntoLocal(state.memos);
    setState({ status: 'done', added, revived });
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
        {/* アプリ内ブラウザ警告：取り込み先がこのブラウザ内だけになる旨を案内 */}
        {inApp && state.status !== 'error' && (
          <div
            style={{
              background: 'var(--input)',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '16px',
            }}
          >
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              アプリ内ブラウザで開いています
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              このまま取り込むと、メモは<strong>このアプリ内ブラウザにだけ</strong>保存され、普段の Safari / Chrome には反映されません。
              右上などの「<strong>既定のブラウザで開く</strong>」からこのページを開き直して取り込むのがおすすめです。
            </p>
          </div>
        )}

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
              いまの端末のメモに<strong>追記</strong>します。受け取ったメモはすべて残ります（この端末で消していたメモも復活します）。
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
              {state.added === 0 && state.revived === 0
                ? 'すべて取り込み済みでした'
                : [
                    state.added > 0 ? `${state.added}件を追加` : null,
                    state.revived > 0 ? `${state.revived}件を復活` : null,
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
