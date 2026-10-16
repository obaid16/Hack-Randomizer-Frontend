'use client';

import { useState } from 'react';
import { Sparkles, RotateCcw, Layers, Volume2, VolumeX } from 'lucide-react';
import { toggleMute, getMuteState } from '@/lib/soundFx';

/**
 * Minimal Editorial Header for the Team Draw Experience.
 * Beautifully responsive on mobile, tablet, and desktop screens with sound fx toggle.
 */
export default function AppHeader({
  status = 'Ready',
  isDrawActive = false,
  isAllRevealed = false,
  onReset = null
}) {
  const [muted, setMuted] = useState(false);

  const handleToggleSound = () => {
    const newState = toggleMute();
    setMuted(newState);
  };

  return (
    <header className="border-b border-border/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 no-print">
      <div className="app-container h-14 sm:h-16 flex items-center justify-between">
        {/* Custom Typographic Logo & Subtitle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-accent flex items-center justify-center text-white shadow-xs shrink-0">
            <Layers size={16} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-display font-extrabold text-sm sm:text-base text-primaryText">
                TEAM DRAW
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono uppercase bg-slate-100 text-secondaryText px-1.5 py-0.2 rounded border border-border">
                2027
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-secondaryText -mt-0.5 hidden xs:block">
              Hackathon Team Generator
            </p>
          </div>
        </div>

        {/* Compact Status Label & Context Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio FX Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className="p-1.5 rounded-lg border border-border bg-canvas text-secondaryText hover:text-primaryText hover:bg-slate-100 transition-colors cursor-pointer"
            title={muted ? 'Unmute Mechanical Sound Effects' : 'Mute Mechanical Sound Effects'}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX size={15} className="text-rose-500" /> : <Volume2 size={15} className="text-accent" />}
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-border bg-canvas text-[10px] sm:text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isAllRevealed
                  ? 'bg-success'
                  : isDrawActive
                  ? 'bg-accent animate-pulse'
                  : 'bg-slate-400'
              }`}
            />
            <span className="text-secondaryText font-medium">
              {isAllRevealed
                ? 'Complete'
                : isDrawActive
                ? 'Drawing'
                : 'Ready'}
            </span>
          </div>

          {isDrawActive && onReset && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-medium text-secondaryText hover:text-rose-600 px-2 sm:px-2.5 py-1 rounded hover:bg-rose-50 transition-colors inline-flex items-center gap-1 cursor-pointer"
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
