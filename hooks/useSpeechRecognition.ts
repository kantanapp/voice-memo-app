'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = any;

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed':
    'マイクの使用が許可されていません。ブラウザとOS（システム設定→プライバシー→マイク）の設定を確認してください。',
  'service-not-allowed':
    'マイクの使用がOS側でブロックされています。システム設定→プライバシー→マイクでこのブラウザを許可してください。',
  'audio-capture':
    'マイクが見つかりません。マイクの接続と入力デバイスを確認してください。',
  network:
    'ネットワークエラーです。音声認識にはインターネット接続が必要です（社内ネットワーク等ではブロックされる場合があります）。',
};

export function useSpeechRecognition() {
  const [finalText, setFinalText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');

  const recognitionRef = useRef<AnyRecognition>(null);
  const finalTextRef = useRef('');
  const shouldStopRef = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    setIsSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const createRecognition = useCallback((): AnyRecognition => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const API = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    const rec = new API();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'ja-JP';

    rec.onresult = (event: AnyRecognition) => {
      let interim = '';
      let accumulated = finalTextRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript as string;
        if (event.results[i].isFinal) {
          accumulated += transcript;
        } else {
          interim += transcript;
        }
      }

      finalTextRef.current = accumulated;
      setFinalText(accumulated);
      setInterimText(interim);
    };

    rec.onerror = (event: AnyRecognition) => {
      const code = event?.error as string;
      // no-speech / aborted は一時的なので無視（onend で自動再開する）
      if (code === 'no-speech' || code === 'aborted') return;
      // 致命的エラー：原因を表示し、自動再開を止めて録音状態を解除
      setError(ERROR_MESSAGES[code] || `音声認識エラー（${code}）が発生しました。`);
      shouldStopRef.current = true;
      setIsRecording(false);
    };

    rec.onend = () => {
      // 明示停止・致命的エラーでなければ継続のため再開
      if (!shouldStopRef.current && recognitionRef.current === rec) {
        try {
          rec.start();
        } catch {
          // already started or aborted — ignore
        }
      }
    };

    return rec;
  }, []);

  const start = useCallback(async () => {
    setError('');
    shouldStopRef.current = false;

    // マイク権限を明示的に要求（原因の切り分けとプロンプト確実化）。
    // ここで失敗すれば原因が明確になるため、音声認識は開始しない。
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch (e) {
      const name = (e as DOMException)?.name || '';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setError(ERROR_MESSAGES['not-allowed']);
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setError(ERROR_MESSAGES['audio-capture']);
      } else {
        setError('マイクにアクセスできませんでした。設定をご確認ください。');
      }
      setIsRecording(false);
      return;
    }

    const rec = createRecognition();
    recognitionRef.current = rec;
    try {
      rec.start();
      setIsRecording(true);
    } catch {
      // 既に開始済み等
      setIsRecording(true);
    }
  }, [createRecognition]);

  const stop = useCallback(() => {
    shouldStopRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setInterimText('');
  }, []);

  const reset = useCallback(() => {
    finalTextRef.current = '';
    setFinalText('');
    setInterimText('');
    setError('');
  }, []);

  useEffect(() => {
    return () => {
      shouldStopRef.current = true;
      recognitionRef.current?.stop();
    };
  }, []);

  return { finalText, interimText, isRecording, isSupported, error, start, stop, reset };
}
