'use client';

import { Search, X } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Search...', onClear = null }) {
  return (
    <div className="search-bar">
      <Search size={16} color="var(--text-muted)" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
