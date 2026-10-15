'use client';

import { FolderOpen } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  title = 'No records found',
  description = 'There are currently no items matching your criteria.',
  icon = null,
  actionText = null,
  onAction = null
}) {
  return (
    <div className="state-box">
      <div
        className="state-icon"
        style={{
          background: 'rgba(99, 102, 241, 0.1)',
          color: 'var(--primary)'
        }}
      >
        {icon || <FolderOpen size={28} />}
      </div>
      <h4 className="state-title">{title}</h4>
      <p className="state-desc">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
