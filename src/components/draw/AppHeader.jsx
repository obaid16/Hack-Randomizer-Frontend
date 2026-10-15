'use client';

import { Sparkles, RotateCcw, Layers } from 'lucide-react';

/**
 * Minimal Editorial Header for the Team Draw Experience.
 * Zero login, profile, account, or admin distractions.
 */
export default function AppHeader({
  status = 'Ready',
  isDrawActive = false,
  isAllRevealed = false,
  onReset = null
}) {
  return (
    <header className="border-b border-border/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 no-print">
      <div className="app-container h-16 flex items-center justify-between">
        {/* Custom Typographic Logo & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white shadow-xs">
            <Layers size={17} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-base tracking-tight text-primaryText">
                TEAM DRAW
              </span>
              <span className="text-[10px] font-mono uppercase bg-slate-100 text-secondaryText px-1.5 py-0.5 rounded border border-border">
                2027
              </span>
            </div>
            <p className="text-[11px] text-secondaryText -mt-0.5">
              Hackathon Team Generator
            </p>
          </div>
        </div>

        {/* Compact Status Label & Context Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-canvas text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isAllRevealed
                  ? 'bg-success'
                  : isDrawActive
                  ? 'bg-accent animate-pulse'
                  : 'bg-slate-400'
              }`}
            />
            <span className="text-secondaryText font-medium">
              {isAllRevealed
                ? 'Draw Complete'
                : isDrawActive
                ? 'Draw In Progress'
                : 'Ready for Generation'}
            </span>
          </div>

          {isDrawActive && onReset && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-medium text-secondaryText hover:text-rose-600 px-2.5 py-1 rounded hover:bg-rose-50 transition-colors inline-flex items-center gap-1"
              title="Reset current draw"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
