'use client';

interface RecordButtonProps {
  isRecording: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function RecordButton({ isRecording, onToggle, disabled }: RecordButtonProps) {
  return (
    <div className="relative flex items-center justify-center">
      {isRecording && (
        <span className="absolute w-44 h-44 rounded-full bg-red-400 animate-ping opacity-30" />
      )}
      <button
        onClick={onToggle}
        disabled={disabled}
        aria-label={isRecording ? '録音停止' : '録音開始'}
        className={[
          'relative w-36 h-36 rounded-full flex items-center justify-center',
          'transition-all duration-300 shadow-xl focus:outline-none focus-visible:ring-4',
          isRecording
            ? 'bg-red-500 hover:bg-red-600 focus-visible:ring-red-300'
            : 'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-300',
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95',
        ].join(' ')}
      >
        {isRecording ? (
          <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zM8 11a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.92V19h2v2H9v-2h2v-2.08A6 6 0 0 1 6 11H8z" />
          </svg>
        )}
      </button>
    </div>
  );
}
