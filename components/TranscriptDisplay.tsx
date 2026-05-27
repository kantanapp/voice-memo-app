interface TranscriptDisplayProps {
  finalText: string;
  interimText: string;
  isRecording: boolean;
}

export default function TranscriptDisplay({
  finalText,
  interimText,
  isRecording,
}: TranscriptDisplayProps) {
  const hasContent = finalText || interimText;

  return (
    <div
      className="w-full min-h-40 max-h-72 overflow-y-auto"
      style={{
        background: 'var(--input)',
        borderRadius: '16px',
        padding: '16px 18px',
      }}
    >
      {!hasContent && !isRecording && (
        <p
          className="text-center text-sm"
          style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}
        >
          マイクボタンを押して<br />録音を開始してください
        </p>
      )}
      {!hasContent && isRecording && (
        <p
          className="text-center text-sm"
          style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}
        >
          話してください…
        </p>
      )}
      {hasContent && (
        <p
          className="text-sm whitespace-pre-wrap"
          style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}
        >
          {finalText}
          <span style={{ color: '#aaa' }}>{interimText}</span>
        </p>
      )}
    </div>
  );
}
