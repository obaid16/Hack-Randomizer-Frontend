'use client';

import { Minimize2, Eye, ChevronRight, CheckCircle2, Shield, User, GraduationCap, Sparkles } from 'lucide-react';
import MemberRevealSlot from './MemberRevealSlot';

/**
 * Fullscreen Projector / Presentation View.
 * Centers the active team with extra-large typography for projection screens.
 */
export default function PresentationMode({
  teams = [],
  currentTeamIndex = 0,
  nextTarget = null,
  isAnimating = false,
  isAllRevealed = false,
  nextActionLabel = 'Reveal Next Member',
  onRevealNext,
  onRevealTeam,
  onClose,
  onSelectTeam
}) {
  const currentTeam = teams[currentTeamIndex] || teams[0];
  if (!currentTeam) return null;

  const revealedCount = currentTeam.members.filter((m) => m.revealed).length;
  const isTeamComplete = revealedCount === 4;

  return (
    <div className="fixed inset-0 z-50 bg-[#F7F7F4] flex flex-col justify-between p-4 sm:p-8 overflow-y-auto">
      {/* Top Bar: Event Badge, Mini Carousel & Close Button */}
      <div className="flex items-center justify-between pb-4 border-b border-border/80">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-accent-subtle text-accent font-mono text-xs font-semibold border border-accent/20">
            PROJECTOR MODE · HACKATHON 2027
          </div>
          <span className="text-xs text-secondaryText hidden sm:inline">
            Press Escape or click Minimize to exit
          </span>
        </div>

        {/* Team Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-md py-1">
          {teams.map((t, idx) => {
            const isDone = t.members.every((m) => m.revealed);
            const isSel = idx === currentTeamIndex;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTeam(idx)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                  isSel
                    ? 'bg-accent text-white shadow-xs'
                    : isDone
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-white text-secondaryText border border-border'
                }`}
              >
                #{t.number}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg bg-white border border-border text-secondaryText hover:text-primaryText text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Minimize2 size={14} />
          <span>Exit Presentation</span>
        </button>
      </div>

      {/* Main Center Stage: Spotlight Active Team Card with Large Typography */}
      <div className="max-w-2xl w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-2xl border-2 border-accent/40 shadow-elevated p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent">
                CURRENT DRAW SPOTLIGHT
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-primaryText mt-1">
                {currentTeam.name}
              </h2>
            </div>
            <div>
              {isTeamComplete ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success bg-success-subtle px-3 py-1.5 rounded-full border border-success/30">
                  <CheckCircle2 size={16} />
                  <span>Team Complete</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent bg-accent-subtle px-3 py-1.5 rounded-full border border-accent/30">
                  <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                  <span>Drawing ({revealedCount}/4)</span>
                </span>
              )}
            </div>
          </div>

          {/* Large Reveal Slots */}
          <div className="space-y-3.5">
            {currentTeam.members.map((member, slotIdx) => {
              const isThisTarget =
                nextTarget &&
                nextTarget.teamIndex === currentTeamIndex &&
                nextTarget.slotIndex === slotIdx;

              return (
                <MemberRevealSlot
                  key={member.id}
                  slotIndex={slotIdx}
                  member={member}
                  isTarget={isThisTarget}
                  isAnimating={isAnimating}
                  onSlotClick={() => {
                    if (isThisTarget && onRevealNext) onRevealNext();
                  }}
                  isPresentation={true}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="max-w-xl w-full mx-auto flex items-center justify-center gap-3 pt-4 border-t border-border/80">
        {!isAllRevealed ? (
          <>
            <button
              type="button"
              onClick={onRevealNext}
              disabled={isAnimating}
              className="px-8 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-base shadow-md inline-flex items-center gap-2.5 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Eye size={18} />
              <span>{nextActionLabel}</span>
            </button>

            {!isTeamComplete && onRevealTeam && (
              <button
                type="button"
                onClick={() => onRevealTeam(currentTeamIndex)}
                disabled={isAnimating}
                className="px-5 py-3.5 rounded-xl bg-white border border-border text-primaryText font-semibold text-sm hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>Reveal This Team</span>
                <ChevronRight size={16} />
              </button>
            )}
          </>
        ) : (
          <div className="text-center font-display font-bold text-xl text-success inline-flex items-center gap-2">
            <CheckCircle2 size={22} />
            <span>All Teams Have Been Successfully Drawn!</span>
          </div>
        )}
      </div>
    </div>
  );
}
