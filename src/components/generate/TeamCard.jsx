'use client';

import { Edit, User, Award, Shield } from 'lucide-react';
import Badge from '../ui/Badge';

export default function TeamCard({ team, onEdit = null }) {
  const sy = team.secondYearStudent || {};
  const fy1 = team.firstYearStudents?.[0] || {};
  const fy2 = team.firstYearStudents?.[1] || {};
  const mentor = team.mentor || {};

  return (
    <div className="team-card">
      <div className="team-card-header">
        <div>
          <span className="team-number">Team #{team.teamNumber}</span>
          <h3 className="team-name">{team.teamName}</h3>
        </div>
        {onEdit && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit(team)}
            title="Edit team composition"
          >
            <Edit size={14} />
            <span>Edit</span>
          </button>
        )}
      </div>

      <div className="team-card-body">
        {/* Second-Year Member (Leader/Anchor) */}
        <div
          className="team-member-row"
          style={{ borderLeft: '3px solid #7C3AED' }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: '#F3E8FF',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Award size={18} />
          </div>
          <div className="team-member-info">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span className="member-name">{sy.fullName || 'Unassigned'}</span>
              <Badge variant="second-year">2nd Year</Badge>
            </div>
            <div className="member-detail">
              ID: {sy.studentId || 'N/A'} {sy.department ? `• ${sy.department}` : ''}
            </div>
          </div>
        </div>

        {/* First-Year Member 1 */}
        <div
          className="team-member-row"
          style={{ borderLeft: '3px solid #0284C7' }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: '#E0F2FE',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <User size={18} />
          </div>
          <div className="team-member-info">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span className="member-name">{fy1.fullName || 'Unassigned'}</span>
              <Badge variant="first-year">1st Year</Badge>
            </div>
            <div className="member-detail">
              ID: {fy1.studentId || 'N/A'} {fy1.department ? `• ${fy1.department}` : ''}
            </div>
          </div>
        </div>

        {/* First-Year Member 2 */}
        <div
          className="team-member-row"
          style={{ borderLeft: '3px solid #0284C7' }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: '#E0F2FE',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <User size={18} />
          </div>
          <div className="team-member-info">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span className="member-name">{fy2.fullName || 'Unassigned'}</span>
              <Badge variant="first-year">1st Year</Badge>
            </div>
            <div className="member-detail">
              ID: {fy2.studentId || 'N/A'} {fy2.department ? `• ${fy2.department}` : ''}
            </div>
          </div>
        </div>

        {/* Mentor */}
        <div
          className="team-member-row"
          style={{ borderLeft: '3px solid #D97706', background: '#FFFBEB' }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Shield size={18} />
          </div>
          <div className="team-member-info">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span className="member-name" style={{ color: '#92400E' }}>{mentor.fullName || 'Unassigned Mentor'}</span>
              <Badge variant="mentor">Mentor</Badge>
            </div>
            <div className="member-detail" style={{ color: '#78350F' }}>
              ID: {mentor.mentorId || 'N/A'} {mentor.expertise?.length ? `• ${mentor.expertise.join(', ')}` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
