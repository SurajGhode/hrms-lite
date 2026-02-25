import React from 'react';

const variants = {
  present: { color: 'var(--green)', bg: 'var(--green-bg)' },
  absent: { color: 'var(--red)', bg: 'var(--red-bg)' },
  default: { color: 'var(--text-secondary)', bg: 'var(--bg-3)' },
};

export default function Badge({ children, variant = 'default' }) {
  const style = variants[variant.toLowerCase()] || variants.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 20,
      fontSize: 12, fontWeight: 500,
      color: style.color, background: style.bg,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%', background: style.color,
      }} />
      {children}
    </span>
  );
}
