'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Memo } from '@/types/memo';
import RecordButton from './RecordButton';
import TranscriptDisplay from './TranscriptDisplay';
import WaveformBars from './WaveformBars';
import MemoCard from './MemoCard';

interface Props {
  onSave: (text: string) => void;
  memos: Memo[];
  onUpdate: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  onFavorite: (id: string) => void;
}

export default function RecordView({ onSave, memos, onUpdate, onRemove, onToggle, onFavorite }: Props) {
  const { finalText, interimText, isRecording, isSupported, start, stop, reset } =
    useSpeechRecognition();
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleToggle = () => {
    if (isRecording) {
      stop();
      if (finalText.trim()) {
        onSave(finalText.trim());
        showToast('保存しました');
      }
      reset();
    } else {
      reset();
      start();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 px-5 pt-4 pb-8">
      {/* テキストエリア（上部固定） */}
      <div className="shrink-0 mb-5">
        <TranscriptDisplay
          finalText={finalText}
          interimText={interimText}
          isRecording={isRecording}
        />
      </div>

      {/* メモ一覧（中央スクロール領域）― お気に入り機能はカードの星で維持 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '8px' }}>
          メモ一覧
        </p>
        {memos.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', padding: '32px 0' }}>
            まだメモがありません
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {memos.map((memo) => (
              <MemoCard
                key={memo.id}
                memo={memo}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onToggle={onToggle}
                onFavorite={onFavorite}
              />
            ))}
          </div>
        )}
      </div>

      {/* コントロールエリア（下部固定） */}
      <div className="shrink-0 flex flex-col items-center gap-4 pt-5">
        {/* 波形 */}
        <WaveformBars isRecording={isRecording} />

        {/* ステータステキスト */}
        <p
          style={{
            fontSize: '13px',
            fontWeight: isRecording ? 600 : 400,
            color: isRecording ? '#ef4444' : 'var(--text-muted)',
            transition: 'color 0.3s',
            letterSpacing: isRecording ? '0.04em' : 0,
          }}
        >
          {isRecording ? '● REC' : 'タップして録音'}
        </p>

        {/* 録音ボタン */}
        <RecordButton
          isRecording={isRecording}
          onToggle={handleToggle}
          disabled={!isSupported}
        />

        {/* 非対応ブラウザ通知 */}
        {!isSupported && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Chrome または Edge をご利用ください
          </p>
        )}
      </div>

      {/* トースト（Portal でtransform外に描画） */}
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
            whiteSpace: 'nowrap',
          }}
        >
          {toast}
        </div>,
        document.body
      )}
    </div>
  );
}
