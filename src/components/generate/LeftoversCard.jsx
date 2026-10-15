'use client';

import { Users, Info, CheckCircle2 } from 'lucide-react';
import Badge from '../ui/Badge';

export default function LeftoversCard({ leftovers }) {
  const fyList = leftovers?.firstYears || [];
  const syList = leftovers?.secondYears || [];
  const total = (leftovers?.totalLeftovers ?? (fyList.length + syList.length)) || 0;

  if (total === 0) {
    return (
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          background: '#DCFCE7',
          border: '1px solid #BBF7D0',
          color: '#15803D',
          fontSize: '0.88rem',
          fontWeight: 600
        }}
      >
        <CheckCircle2 size={18} />
        <span>All eligible students have been assigned to teams! Zero leftovers.</span>
      </div>
    );
  }

  return (
    <div className="card" style={{ border: '1px solid #E2E8F0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #E2E8F0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={18} color="#4F46E5" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Unassigned Leftover Students
          </h3>
        </div>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            background: '#FEF3C7',
            color: '#B45309',
            border: '1px solid #FDE68A'
          }}
        >
          {total} Unassigned
        </span>
      </div>

      <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1.25rem' }}>
        These eligible students could not form a complete 1+2 team in this generation and have been preserved in history.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Second-Year Leftovers */}
        <div>
          <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
            Second Years ({syList.length})
          </h4>
          {syList.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>No leftover second-years</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {syList.map((stu, i) => (
                <div
                  key={stu.studentId || i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>{stu.fullName}</span>
                    <span style={{ color: '#64748B', marginLeft: '0.5rem', fontFamily: 'monospace' }}>
                      ({stu.studentId})
                    </span>
                  </div>
                  <Badge variant="second-year">2nd Year</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* First-Year Leftovers */}
        <div>
          <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
            First Years ({fyList.length})
          </h4>
          {fyList.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>No leftover first-years</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {fyList.map((stu, i) => (
                <div
                  key={stu.studentId || i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>{stu.fullName}</span>
                    <span style={{ color: '#64748B', marginLeft: '0.5rem', fontFamily: 'monospace' }}>
                      ({stu.studentId})
                    </span>
                  </div>
                  <Badge variant="first-year">1st Year</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
