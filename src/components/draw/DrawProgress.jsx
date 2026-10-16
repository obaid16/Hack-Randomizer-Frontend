'use client';

import { Users, Award, Clock, Sparkles, CheckCircle2 } from 'lucide-react';

/**
 * Draw Progress Banner displaying real-time calculation of teams and members.
 */
export default function DrawProgress({ progress }) {
  if (!progress || progress.totalTeams === 0) return null;

  const {
    totalTeams,
    teamsCompleted,
    currentTeamName,
    currentTeamRevealedCount,
    revealedMembersCount,
    totalMembersCount,
    remainingMembersCount,
    percentage,
    isAllRevealed
  } = progress;

  return (
    <div className="bg-white rounded-xl border border-border p-4 sm:p-5 shadow-clean mb-6 transition-all">
      {/* Top Header: Current status and percentage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-secondaryText font-semibold">
              Live Draw Progress
            </span>
            {isAllRevealed && (
              <span className="text-[11px] font-semibold text-success bg-success-subtle px-2 py-0.5 rounded border border-success/30 flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>All Rosters Complete</span>
              </span>
            )}
          </div>
          <h4 className="font-display font-bold text-lg text-primaryText mt-0.5">
            {isAllRevealed
              ? `${totalTeams} Teams Successfully Formed`
              : `Drawing: ${currentTeamName || 'Team'} (${currentTeamRevealedCount}/4 Members Revealed)`}
          </h4>
        </div>

        <div className="text-right sm:self-auto self-start">
          <span className="font-mono text-2xl font-bold text-primaryText">
            {percentage}%
          </span>
          <span className="text-xs text-secondaryText block">
            {revealedMembersCount} of {totalMembersCount} names revealed
          </span>
        </div>
      </div>

      {/* Restrained Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-4 border border-border/40">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isAllRevealed ? 'bg-success' : 'shimmer-bar'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* 4 Real Metric Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/50 text-xs">
        <div className="p-2.5 rounded-lg bg-canvas border border-border/60">
          <span className="text-secondaryText font-mono text-[10px] uppercase block mb-0.5">
            Total Teams
          </span>
          <span className="font-bold text-primaryText text-sm sm:text-base">
            {totalTeams} Teams
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-canvas border border-border/60">
          <span className="text-secondaryText font-mono text-[10px] uppercase block mb-0.5">
            Completed Rosters
          </span>
          <span className="font-bold text-success text-sm sm:text-base">
            {teamsCompleted} / {totalTeams}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-canvas border border-border/60">
          <span className="text-secondaryText font-mono text-[10px] uppercase block mb-0.5">
            Active Spotlight
          </span>
          <span className="font-bold text-accent text-sm sm:text-base truncate block">
            {isAllRevealed ? 'All Teams' : currentTeamName || 'None'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-canvas border border-border/60">
          <span className="text-secondaryText font-mono text-[10px] uppercase block mb-0.5">
            Names Remaining
          </span>
          <span className="font-bold text-primaryText text-sm sm:text-base">
            {remainingMembersCount} Left
          </span>
        </div>
      </div>
    </div>
  );
}
