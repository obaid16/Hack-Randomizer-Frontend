'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({ page = 1, totalPages = 1, total = 0, onPageChange }) {
  if (totalPages <= 1 && total <= 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)'
      }}
    >
      <div>
        Showing page <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{page}</span> of{' '}
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{totalPages || 1}</span>{' '}
        {total > 0 && `(${total} total records)`}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          icon={<ChevronLeft size={16} />}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <span>Next</span>
          <ChevronRight size={16} style={{ marginLeft: '4px' }} />
        </Button>
      </div>
    </div>
  );
}
