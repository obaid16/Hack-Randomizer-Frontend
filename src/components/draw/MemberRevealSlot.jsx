'use client';

import { Sparkles, Shield, User, GraduationCap, Lock, Check } from 'lucide-react';
import NameReveal from './NameReveal';

/**
 * Single Member Slot inside a Team Card.
 */
export default function MemberRevealSlot({
  slotIndex,
  member,
  isTarget = false,
  isAnimating = false,
  onSlotClick = null,
  onAnimationComplete = null,
  isPresentation = false
}) {
  const isMentor = member.role === 'MENTOR';
  const isLeader = member.role === 'SECOND_YEAR';

  // Role metadata
  const roleIcons = {
    SECOND_YEAR: <Shield size={12} className="text-accent" />,
    FIRST_YEAR_1: <User size={12} className="text-secondaryText" />,
    FIRST_YEAR_2: <User size={12} className="text-secondaryText" />,
    MENTOR: <GraduationCap size={12} className="text-mentor-DEFAULT" />
  };

  const roleTags = {
    SECOND_YEAR: { label: 'Leader · 2nd Year', color: 'bg-accent-subtle text-accent border-accent-border' },
    FIRST_YEAR_1: { label: 'Core · 1st Year', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    FIRST_YEAR_2: { label: 'Core · 1st Year', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    MENTOR: { label: 'Mentor · Assigned', color: 'bg-mentor-bg text-mentor-DEFAULT border-mentor-border' }
  };

  const tag = roleTags[member.role] || roleTags.FIRST_YEAR_1;

  return (
    <div
      onClick={onSlotClick}
      className={`slot-container px-3.5 py-2.5 transition-all duration-200 ${
        isMentor ? 'mentor-slot bg-amber-50/20' : ''
      } ${member.revealed ? 'revealed-slot' : ''} ${
        isTarget ? 'active-target ring-2 ring-accent/30' : ''
      } ${isTarget && !isAnimating ? 'hover:border-accent hover:shadow-sm' : ''}`}
      role="button"
      tabIndex={isTarget ? 0 : -1}
      aria-label={`${member.roleLabel}: ${member.revealed ? member.name : 'Concealed'}`}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && isTarget && onSlotClick) {
          e.preventDefault();
          onSlotClick();
        }
      }}
    >
      {/* Slot Header: Role label & tag */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-secondaryText">
          {roleIcons[member.role]}
          <span className="font-semibold">{member.roleLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-[10px] font-sans font-medium px-1.5 py-0.5 rounded border ${tag.color}`}>
            {tag.label}
          </span>
          {member.revealed && (
            <span className="text-success inline-flex items-center">
              <Check size={12} strokeWidth={2.5} />
            </span>
          )}
        </div>
      </div>

      {/* Signature Mechanical Reveal Window */}
      <NameReveal
        name={member.name}
        revealed={member.revealed}
        isTarget={isTarget}
        isMentor={isMentor}
        onAnimationComplete={onAnimationComplete}
        isPresentation={isPresentation}
      />
    </div>
  );
}
