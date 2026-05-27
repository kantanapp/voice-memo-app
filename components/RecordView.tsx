'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import RecordButton from './RecordButton';
import TranscriptDisplay from './TranscriptDisplay';
import WaveformBars from './WaveformBars';

interface Props {
  onSave: (text: string) => void;
}

export default function RecordView({ onSave }: Props) {
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

      {/* コントロールエリア（固定高さで安定） */}
      <div className="flex flex-col items-center gap-4">
        {/* 波形 */}
        <WaveformBars isRecording={isRecording} />

        {/* ステータステキスト */}
        <p
          style={{
            fontSize: '13px',
            fontWeight: isRecording ? 600 : 400,
            color: isRecording ? 'var(--text-primary)' : 'var(--text-muted)',
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
