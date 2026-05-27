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
    <div className="w-full min-h-40 max-h-72 overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
      {!hasContent && !isRecording && (
        <p className="text-gray-400 text-center text-sm leading-relaxed">
          マイクボタンを押して<br />録音を開始してください
        </p>
      )}
      {!hasContent && isRecording && (
        <p className="text-gray-400 text-center text-sm animate-pulse">
          話してください...
        </p>
      )}
      {hasContent && (
        <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed whitespace-pre-wrap">
          {finalText}
          <span className="text-gray-400">{interimText}</span>
        </p>
      )}
    </div>
  );
}
