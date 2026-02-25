import React from 'react';
import Spinner from './Spinner';

const variants = {
  primary: {
    bg: 'var(--accent)', color: '#0d1117', border: 'transparent',
    hover: '#79b8ff',
  },
  secondary: {
    bg: 'var(--bg-3)', color: 'var(--text-primary)', border: 'var(--border)',
    hover: '#30363d',
  },
  danger: {
    bg: 'transparent', color: 'var(--red)', border: 'var(--red)',
    hover: 'rgba(248,81,73,0.1)',
  },
  ghost: {
    bg: 'transparent', color: 'var(--text-secondary)', border: 'transparent',
    hover: 'var(--bg-3)',
  },
};

export default function Button({ children, variant = 'primary', loading, disabled, icon, size = 'md', style: customStyle, ...props }) {
  const v = variants[variant];
  const pad = size === 'sm' ? '6px 12px' : size === 'lg' ? '11px 20px' : '8px 16px';
  const fontSize = size === 'sm' ? 12 : 14;

  return (
    <button
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: pad, borderRadius: 'var(--radius)',
        background: v.bg, color: v.color,
        border: `1px solid ${v.border}`,
        fontSize, fontWeight: 500,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
        ...customStyle,
      }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.background = v.hover; }}
      onMouseLeave={e => { e.currentTarget.style.background = v.bg; }}
      {...props}
    >
      {loading ? <Spinner size={14} color={v.color} /> : icon}
      {children}
    </button>
  );
}
