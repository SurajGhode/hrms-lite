import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 20px', gap: 12, textAlign: 'center',
    }}>
      {Icon && (
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: 'var(--bg-3)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', marginBottom: 4,
        }}>
          <Icon size={24} color="var(--text-muted)" />
        </div>
      )}
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{title}</div>
        {description && <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 300 }}>{description}</div>}
      </div>
      {action}
    </div>
  );
}
