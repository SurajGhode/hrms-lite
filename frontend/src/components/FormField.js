import React from 'react';

export default function FormField({ label, error, children, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
        {label} {required && <span style={{ color: 'var(--red)' }}>*</span>}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: 12, color: 'var(--red)', marginTop: 2 }}>{error}</span>
      )}
    </div>
  );
}

export const inputStyle = (hasError = false) => ({
  width: '100%',
  padding: '9px 12px',
  background: 'var(--bg-3)',
  border: `1px solid ${hasError ? 'var(--red)' : 'var(--border)'}`,
  borderRadius: 'var(--radius)',
  color: 'var(--text-primary)',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.15s',
});

export const selectStyle = (hasError = false) => ({
  ...inputStyle(hasError),
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b949e' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: 32,
});
