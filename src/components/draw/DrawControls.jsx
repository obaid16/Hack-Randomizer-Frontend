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
 * Highly optimized for mobile phones, tablets, and desktop displays.
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
    <div className="bg-white rounded-xl border border-border p-3 sm:p-4 shadow-clean mb-6 no-print">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        {/* Primary Reveal Triggers */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
          {!isAllRevealed ? (
            <button
              type="button"
              onClick={onRevealNext}
              disabled={isAnimating || !isDrawActive}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-xs sm:text-sm shadow-sm transition-all duration-150 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40 active:scale-[0.99] min-h-[44px]"
            >
              <Eye size={17} className="shrink-0" />
              <span className="truncate">{nextActionLabel}</span>
            </button>
          ) : (
            <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-success-subtle border border-success/30 text-success rounded-xl font-bold text-xs sm:text-sm min-h-[44px]">
              <CheckCircle2 size={16} />
              <span>Full Hackathon Team Draw Complete</span>
            </div>
          )}

          {!isAllRevealed && onRevealTeam && (
            <button
              type="button"
              onClick={onRevealTeam}
              disabled={isAnimating || !isDrawActive}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-primaryText font-semibold text-xs sm:text-sm border border-border transition-colors duration-150 inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
            >
              <span>Reveal Current Team</span>
              <ChevronRight size={15} />
            </button>
          )}
        </div>

        {/* Utility Toolbar: Projector View, Export, Print, Reset */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-2 pt-2.5 lg:pt-0 border-t lg:border-t-0 border-border/60 w-full lg:w-auto">
          <button
            type="button"
            onClick={onTogglePresentation}
            className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-primaryText text-xs font-semibold border border-border transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px]"
            title="Open high-contrast fullscreen presentation mode for projectors"
          >
            <Maximize2 size={14} className="text-secondaryText shrink-0" />
            <span className="truncate">Projector View</span>
          </button>

          <button
            type="button"
            onClick={onOpenExport}
            className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-primaryText text-xs font-semibold border border-border transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px]"
            title="Export team rosters to CSV"
          >
            <Download size={14} className="text-secondaryText shrink-0" />
            <span className="truncate">Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-primaryText text-xs font-semibold border border-border transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px]"
            title="Print-friendly roster layout"
          >
            <Printer size={14} className="text-secondaryText shrink-0" />
            <span className="truncate">Print</span>
          </button>

          <button
            type="button"
            onClick={onResetDraw}
            disabled={isAnimating}
            className="px-3 py-2 rounded-lg text-rose-700 bg-rose-50/50 hover:bg-rose-50 border border-rose-200 text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer min-h-[38px]"
            title="Reset draw and reshuffle"
          >
            <RotateCcw size={14} className="shrink-0" />
            <span className="truncate">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
