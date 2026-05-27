'use client';

interface Props {
  activeIndex: number;
  onTabChange: (i: number) => void;
}

const tabs = [
  {
    label: 'メモ一覧',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#111' : '#bbb'} strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
      </svg>
    ),
  },
  {
    label: '録音',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? '#111' : '#bbb'}>
        <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zM8 11a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.92V19h2v2H9v-2h2v-2.08A6 6 0 0 1 6 11H8z" />
      </svg>
    ),
  },
];

export default function BottomNav({ activeIndex, onTabChange }: Props) {
  return (
    <nav
      className="flex shrink-0"
      style={{
        background: 'var(--card)',
        borderTop: '1px solid #f0f0f0',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {tabs.map((tab, i) => {
        const active = activeIndex === i;
        return (
          <button
            key={i}
            onClick={() => onTabChange(i)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '10px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: active ? 600 : 400,
              color: active ? '#111' : '#bbb',
              transition: 'color 0.2s',
              fontFamily: 'inherit',
            }}
          >
            {tab.icon(active)}
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
