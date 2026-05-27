'use client';

interface RecordButtonProps {
  isRecording: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function RecordButton({ isRecording, onToggle, disabled }: RecordButtonProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-label={isRecording ? '録音停止' : '録音開始'}
      style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isRecording ? '#111' : '#f0f0f0',
        transform: isRecording ? 'scale(1.08)' : 'scale(1)',
        boxShadow: isRecording
          ? '0 0 0 8px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.18)'
          : 'none',
        transition: 'all 0.3s ease',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {isRecording ? (
        /* 停止アイコン (■) */
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="3" y="3" width="12" height="12" rx="2" fill="#ef4444" />
        </svg>
      ) : (
        /* マイクアイコン */
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#888">
          <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zM8 11a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.92V19h2v2H9v-2h2v-2.08A6 6 0 0 1 6 11H8z" />
        </svg>
      )}
    </button>
  );
}
