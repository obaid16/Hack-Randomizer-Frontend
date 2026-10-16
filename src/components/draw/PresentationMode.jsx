'use client';

import { useEffect, useRef } from 'react';
import { Minimize2, Eye, ChevronRight, CheckCircle2, Shield, User, GraduationCap, Sparkles } from 'lucide-react';
import MemberRevealSlot from './MemberRevealSlot';

/**
 * Fullscreen Projector / Presentation View.
 * 
 * Completely isolates the scroll context by locking the background body scroll.
 * Features a dedicated scrollable stage with pinned header and bottom controls
 * so it works seamlessly on phones, tablets, and large projector screens.
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
  const scrollContainerRef = useRef(null);

  // 1. Lock background body scrolling while presentation mode is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    document.body.style.overflow = 'hidden';

    // Keyboard listener: Escape to exit
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Scroll to top of card when team changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentTeamIndex]);

  if (!currentTeam) return null;

  const revealedCount = currentTeam.members.filter((m) => m.revealed).length;
  const isTeamComplete = revealedCount === 4;

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#F7F7F4] flex flex-col h-[100dvh] w-screen overflow-hidden overscroll-contain select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Presentation Mode"
    >
      {/* 1. Pinned Top Navigation Bar */}
      <header className="shrink-0 bg-white/95 backdrop-blur-md border-b border-border px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 z-10 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="px-2.5 py-1 rounded-full bg-accent-subtle text-accent font-mono text-[10px] sm:text-xs font-bold border border-accent/20 truncate">
            PROJECTOR MODE
          </div>
          <span className="text-[11px] text-secondaryText hidden md:inline">
            Press Esc to exit
          </span>
        </div>

        {/* Team Selector Carousel Pills */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-[50vw] sm:max-w-md py-1 px-1 scrollbar-none">
          {teams.map((t, idx) => {
            const isDone = t.members.every((m) => m.revealed);
            const isSel = idx === currentTeamIndex;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTeam(idx)}
                className={`px-2 py-1 rounded text-[11px] sm:text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                  isSel
                    ? 'bg-accent text-white shadow-xs scale-105'
                    : isDone
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-secondaryText border border-border/60 hover:bg-slate-200'
                }`}
                title={t.name}
              >
                #{t.number}
              </button>
            );
          })}
        </div>

        {/* Exit Button */}
        <button
          type="button"
          onClick={onClose}
          className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-border text-primaryText text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
          aria-label="Exit Presentation Mode"
        >
          <Minimize2 size={14} />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </header>

      {/* 2. Scrollable Center Stage (Dedicated scroll container for mobile/tablet) */}
      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-6 sm:py-8 flex flex-col justify-start sm:justify-center items-center min-h-0 w-full"
      >
        <div className="max-w-2xl w-full mx-auto my-auto py-2">
          <div className="bg-white rounded-2xl border-2 border-accent/40 shadow-elevated p-4 sm:p-7 md:p-8 transition-all">
            {/* Header: Title and Status */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-border">
              <div>
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-accent">
                  CURRENT SPOTLIGHT
                </span>
                <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-primaryText mt-0.5 sm:mt-1">
                  {currentTeam.name}
                </h2>
              </div>
              <div className="shrink-0">
                {isTeamComplete ? (
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-bold text-success bg-success-subtle px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-success/30">
                    <CheckCircle2 size={15} />
                    <span>Roster Set</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-bold text-accent bg-accent-subtle px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-accent/30">
                    <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                    <span>Drawing ({revealedCount}/4)</span>
                  </span>
                )}
              </div>
            </div>

            {/* 4 Member Slots with Large Typography */}
            <div className="space-y-2.5 sm:space-y-3.5">
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
      </main>

      {/* 3. Pinned Bottom Floating Control Bar */}
      <footer className="shrink-0 bg-white/95 backdrop-blur-md border-t border-border px-4 py-3 sm:py-4 z-10 shadow-lg">
        <div className="max-w-xl w-full mx-auto flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
          {!isAllRevealed ? (
            <>
              <button
                type="button"
                onClick={onRevealNext}
                disabled={isAnimating}
                className="w-full sm:w-auto flex-1 px-6 sm:px-8 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-sm sm:text-base shadow-md inline-flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer active:scale-[0.99]"
              >
                <Eye size={18} />
                <span className="truncate">{nextActionLabel}</span>
              </button>

              {!isTeamComplete && onRevealTeam && (
                <button
                  type="button"
                  onClick={() => onRevealTeam(currentTeamIndex)}
                  disabled={isAnimating}
                  className="w-full sm:w-auto px-4 sm:px-5 py-3.5 rounded-xl bg-slate-100 border border-border text-primaryText font-semibold text-xs sm:text-sm hover:bg-slate-200 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>Reveal Full Team</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </>
          ) : (
            <div className="text-center font-display font-bold text-base sm:text-xl text-success inline-flex items-center gap-2">
              <CheckCircle2 size={20} />
              <span>All Teams Have Been Successfully Drawn!</span>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
