import React from 'react';

export default function Spinner({ size = 20, color = 'var(--accent)' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid var(--border)`,
      borderTopColor: color,
      animation: 'spin 0.7s linear infinite',
      display: 'inline-block',
    }} />
  );
}

export function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, flexDirection: 'column', gap: 12 }}>
      <Spinner size={28} />
      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</span>
    </div>
  );
}
