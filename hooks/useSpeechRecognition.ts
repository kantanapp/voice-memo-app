'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = any;

export function useSpeechRecognition() {
  const [finalText, setFinalText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

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

    rec.onend = () => {
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

  const start = useCallback(() => {
    shouldStopRef.current = false;
    const rec = createRecognition();
    recognitionRef.current = rec;
    rec.start();
    setIsRecording(true);
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
  }, []);

  useEffect(() => {
    return () => {
      shouldStopRef.current = true;
      recognitionRef.current?.stop();
    };
  }, []);

  return { finalText, interimText, isRecording, isSupported, start, stop, reset };
}
