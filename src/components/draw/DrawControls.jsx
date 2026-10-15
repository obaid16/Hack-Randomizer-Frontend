'use client';

import {
  Play,
  RotateCcw,
  Sparkles,
  Maximize2,
  Download,
  Printer,
  ChevronRight,
  Eye,
  CheckCircle2
} from 'lucide-react';

/**
 * Main Interactive Control Bar for the live draw.
 */
export default function DrawControls({
  isDrawActive = false,
  isAllRevealed = false,
  isAnimating = false,
  nextActionLabel = 'Reveal Next Member',
  onRevealNext = null,
  onRevealTeam = null,
  onResetDraw = null,
  onOpenExport = null,
  onTogglePresentation = null,
  onPrint = null
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-3.5 sm:p-4 shadow-clean mb-6 no-print">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Primary Reveal Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {!isAllRevealed ? (
            <button
              type="button"
              onClick={onRevealNext}
              disabled={isAnimating || !isDrawActive}
              className="px-5 py-3 rounded-lg bg-accent hover:bg-accent-hover text-white font-semibold text-sm shadow-sm transition-all duration-150 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40 active:scale-[0.99]"
            >
              <Eye size={16} />
              <span>{nextActionLabel}</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-success-subtle border border-success/30 text-success rounded-lg font-semibold text-sm">
              <CheckCircle2 size={16} />
              <span>Full Hackathon Team Draw Complete</span>
            </div>
          )}

          {!isAllRevealed && onRevealTeam && (
            <button
              type="button"
              onClick={onRevealTeam}
              disabled={isAnimating || !isDrawActive}
              className="px-4 py-3 rounded-lg bg-canvas hover:bg-slate-100 text-primaryText font-semibold text-xs sm:text-sm border border-border transition-colors duration-150 inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Reveal Current Team</span>
              <ChevronRight size={15} />
            </button>
          )}
        </div>

        {/* Utility Toolbar: Presentation Mode, Export, Print, Reset */}
        <div className="flex items-center gap-2 flex-wrap border-t md:border-t-0 pt-2.5 md:pt-0 border-border/60">
          <button
            type="button"
            onClick={onTogglePresentation}
            className="px-3 py-2 rounded-lg bg-canvas hover:bg-slate-100 text-primaryText text-xs font-semibold border border-border transition-colors inline-flex items-center gap-1.5"
            title="Open high-contrast fullscreen presentation mode for projectors"
          >
            <Maximize2 size={14} className="text-secondaryText" />
            <span className="hidden sm:inline">Projector View</span>
          </button>

          <button
            type="button"
            onClick={onOpenExport}
            className="px-3 py-2 rounded-lg bg-canvas hover:bg-slate-100 text-primaryText text-xs font-semibold border border-border transition-colors inline-flex items-center gap-1.5"
            title="Export team rosters to CSV"
          >
            <Download size={14} className="text-secondaryText" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="px-3 py-2 rounded-lg bg-canvas hover:bg-slate-100 text-primaryText text-xs font-semibold border border-border transition-colors inline-flex items-center gap-1.5"
            title="Print-friendly roster layout"
          >
            <Printer size={14} className="text-secondaryText" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            type="button"
            onClick={onResetDraw}
            disabled={isAnimating}
            className="px-3 py-2 rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
            title="Reset draw and reshuffle"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
