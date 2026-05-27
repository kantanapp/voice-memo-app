'use client';

import { useState } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import RecordButton from './RecordButton';
import TranscriptDisplay from './TranscriptDisplay';

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
    <div className="flex flex-col items-center justify-center min-h-full gap-8 px-6 py-10">
      {!isSupported && (
        <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-center">
          Chrome または Edge をご利用ください。このブラウザは音声認識に対応していません。
        </p>
      )}

      <div className="w-full">
        <TranscriptDisplay
          finalText={finalText}
          interimText={interimText}
          isRecording={isRecording}
        />
      </div>

      {isRecording && (
        <p className="text-sm text-red-500 font-medium animate-pulse">録音中...</p>
      )}

      <RecordButton isRecording={isRecording} onToggle={handleToggle} disabled={!isSupported} />

      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-sm px-5 py-2 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
