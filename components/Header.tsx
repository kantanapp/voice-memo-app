'use client';

import { useEffect, useState } from 'react';

export default function Header() {
  const [domain, setDomain] = useState('');

  useEffect(() => {
    setDomain(window.location.hostname);
  }, []);

  return (
    <header className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
      <span
        style={{
          fontSize: '15px',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
        }}
      >
        ボイスメモ
      </span>
      {domain && (
        <span style={{ fontSize: '11px', color: '#bbb' }}>
          {domain}
        </span>
      )}
    </header>
  );
}
