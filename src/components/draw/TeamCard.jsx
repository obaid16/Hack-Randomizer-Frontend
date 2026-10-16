'use client';

import { Users, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import MemberRevealSlot from './MemberRevealSlot';

/**
 * Team Card Component displaying 4 member slots in strict order.
 * Highly refined for mobile phones, tablets, and desktop displays.
 */
export default function TeamCard({
  team,
  teamIndex,
  currentTeamIndex = 0,
  nextTarget = null,
  isAnimating = false,
  onSlotClick = null,
  onRevealTeam = null,
  isPresentation = false
}) {
  const isCurrent = teamIndex === currentTeamIndex;
  const revealedCount = team.members.filter((m) => m.revealed).length;
  const isComplete = revealedCount === 4;

  return (
    <div
      className={`team-card-base p-3.5 sm:p-5 transition-all duration-300 relative flex flex-col justify-between ${
        isCurrent ? 'active-team ring-2 ring-accent/40 bg-white shadow-md' : ''
      } ${isComplete ? 'completed-team bg-white/95' : ''}`}
    >
      <div>
        {/* Card Header: Team Title & Status Badge */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 mb-3 border-b border-border/80">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="font-mono text-[11px] sm:text-xs font-bold text-secondaryText/60 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded">
              #{team.number < 10 ? `0${team.number}` : team.number}
            </span>
            <h3 className="font-display font-bold text-sm sm:text-base text-primaryText">
              {team.name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            {isComplete ? (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-success bg-success-subtle px-2 py-0.5 rounded-full border border-success/20">
                <CheckCircle2 size={12} />
                <span>Roster Ready</span>
              </span>
            ) : isCurrent ? (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-accent bg-accent-subtle px-2 py-0.5 rounded-full border border-accent/20">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                <span>Drawing ({revealedCount}/4)</span>
              </span>
            ) : (
              <span className="text-[10px] sm:text-[11px] font-mono text-secondaryText/60 bg-slate-50 px-2 py-0.5 rounded border border-border">
                {revealedCount > 0 ? `${revealedCount}/4` : 'Waiting'}
              </span>
            )}
          </div>
        </div>

        {/* 4 Member Slots in strict 1 SY + 2 FY + 1 Mentor order */}
        <div className="space-y-2 sm:space-y-2.5">
          {team.members.map((member, slotIdx) => {
            const isThisTarget =
              nextTarget &&
              nextTarget.teamIndex === teamIndex &&
              nextTarget.slotIndex === slotIdx;

            return (
              <MemberRevealSlot
                key={member.id}
                slotIndex={slotIdx}
                member={member}
                isTarget={isThisTarget}
                isAnimating={isAnimating}
                onSlotClick={() => onSlotClick && onSlotClick(teamIndex, slotIdx)}
                isPresentation={isPresentation}
              />
            );
          })}
        </div>
      </div>

      {/* Card Footer: Quick "Reveal This Team" action when active & incomplete */}
      {isCurrent && !isComplete && onRevealTeam && (
        <div className="mt-3.5 pt-2.5 sm:mt-4 sm:pt-3 border-t border-border/60 flex items-center justify-between no-print">
          <span className="text-[11px] sm:text-xs text-secondaryText">
            {4 - revealedCount} {4 - revealedCount === 1 ? 'member' : 'members'} remaining
          </span>
          <button
            type="button"
            onClick={() => onRevealTeam(teamIndex)}
            disabled={isAnimating}
            className="text-[11px] sm:text-xs font-semibold text-accent hover:text-accent-hover inline-flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer p-1"
          >
            <span>Reveal Entire Team</span>
            <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
