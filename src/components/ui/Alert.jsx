'use client';

import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export default function Alert({ type = 'error', message, errors = [], className = '' }) {
  if (!message && (!errors || errors.length === 0)) return null;

  const icons = {
    error: <AlertCircle size={18} className="text-rose-600" />,
    success: <CheckCircle size={18} className="text-emerald-600" />,
    warning: <AlertTriangle size={18} className="text-amber-600" />,
    info: <Info size={18} className="text-blue-600" />
  };

  const bgStyles = {
    error: { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' },
    success: { background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46' },
    warning: { background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' },
    info: { background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af' }
  };

  return (
    <div
      className={`alert-box ${className}`}
      style={{
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        fontSize: '0.88rem',
        ...bgStyles[type]
      }}
    >
      <span style={{ marginTop: '2px', flexShrink: 0 }}>{icons[type]}</span>
      <div style={{ flex: 1 }}>
        {message && <div style={{ fontWeight: 600 }}>{message}</div>}
        {Array.isArray(errors) && errors.length > 0 && (
          <ul style={{ marginTop: '0.4rem', paddingLeft: '1.25rem', fontSize: '0.82rem' }}>
            {errors.map((err, i) => (
              <li key={i}>{typeof err === 'string' ? err : `${err.field ? `${err.field}: ` : ''}${err.message}`}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
