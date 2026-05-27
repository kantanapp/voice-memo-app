'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Memo } from '@/types/memo';
import RecordButton from './RecordButton';
import TranscriptDisplay from './TranscriptDisplay';
import WaveformBars from './WaveformBars';

interface Props {
  onSave: (text: string) => void;
  favoriteMemos: Memo[];
}

export default function RecordView({ onSave, favoriteMemos }: Props) {
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
    <div className="flex flex-col min-h-full px-5 pt-4 pb-8">
      {/* テキストエリア */}
      <div className="flex-1 mb-6">
        <TranscriptDisplay
          finalText={finalText}
          interimText={interimText}
          isRecording={isRecording}
        />
      </div>

      {/* お気に入りメモ（最大2件）― 録音ボタンの上 */}
      {favoriteMemos.length > 0 && (
        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '2px' }}>
            ★ お気に入り
          </p>
          {favoriteMemos.map((memo) => (
            <div
              key={memo.id}
              style={{
                background: 'var(--input)',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#f5a623" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <p
                style={{
                  fontSize: '13px',
                  color: memo.completed ? '#bbb' : 'var(--text-primary)',
                  textDecoration: memo.completed ? 'line-through' : 'none',
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  margin: 0,
                }}
              >
                {memo.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* コントロールエリア（固定高さで安定） */}
      <div className="flex flex-col items-center gap-4">
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
