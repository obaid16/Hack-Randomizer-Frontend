'use client';

export default function Badge({ children, variant = 'active', className = '' }) {
  const variantClass = `badge-${variant}`;
  return (
    <span className={`badge ${variantClass} ${className}`}>
      {children}
    </span>
  );
}
