'use client';

import { WifiOff, RefreshCw, Database, Terminal } from 'lucide-react';
import Button from './Button';

export default function ApiErrorState({
  error = 'Backend API is currently unreachable.',
  onRetry = null,
  isRetrying = false
}) {
  return (
    <div
      className="state-box"
      style={{
        border: '1px solid #fecaca',
        background: '#fff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div
        className="state-icon"
        style={{
          background: '#fee2e2',
          color: '#dc2626'
        }}
      >
        <WifiOff size={28} />
      </div>

      <h3 className="state-title" style={{ color: '#991b1b' }}>
        Backend Connection Unavailable
      </h3>

      <p className="state-desc" style={{ maxWidth: '520px', color: '#64748b' }}>
        {error || 'Unable to establish connection with the backend API service.'}
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxWidth: '480px',
          width: '100%',
          padding: '1rem',
          marginBottom: '1.5rem',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 'var(--radius-md)',
          textAlign: 'left',
          fontSize: '0.8rem',
          color: '#475569'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', fontWeight: 600 }}>
          <Database size={15} />
          <span>MongoDB Atlas Disconnected State</span>
        </div>
        <p>
          The frontend is operating in <strong>real API mode</strong>. When MongoDB Atlas connection is configured in <code>Backend/.env</code> and the backend server is running on port 5000, live data will populate automatically.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontFamily: 'monospace' }}>
          <Terminal size={14} />
          <span>Backend URL: http://localhost:5000/api/v1</span>
        </div>
      </div>

      {onRetry && (
        <Button
          variant="primary"
          onClick={onRetry}
          loading={isRetrying}
          icon={<RefreshCw size={16} />}
        >
          Retry Connection
        </Button>
      )}
    </div>
  );
}
