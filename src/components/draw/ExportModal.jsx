'use client';

import { useState } from 'react';
import { Download, X, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { exportTeamsToCSV } from '@/lib/exportTeams';

/**
 * Modal to select between safe revealed export or full organizer export.
 */
export default function ExportModal({
  isOpen = false,
  teams = [],
  unassigned = {},
  onClose
}) {
  const [exportMode, setExportMode] = useState('revealed-only');

  if (!isOpen) return null;

  const handleExport = () => {
    exportTeamsToCSV(teams, unassigned, exportMode);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl border border-border shadow-elevated p-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
          <div className="flex items-center gap-2 text-primaryText">
            <Download size={18} className="text-accent" />
            <h3 className="font-display font-bold text-base">
              Export Hackathon Team Roster
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-secondaryText hover:text-primaryText p-1 rounded"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-secondaryText mb-5 leading-relaxed">
          Select an export format depending on whether you want to preserve suspense for participants or need the complete master roster for event administration.
        </p>

        {/* Option 1: Revealed Only */}
        <label
          onClick={() => setExportMode('revealed-only')}
          className={`flex items-start gap-3 p-3.5 rounded-lg border mb-3 cursor-pointer transition-all ${
            exportMode === 'revealed-only'
              ? 'bg-accent-subtle/50 border-accent ring-1 ring-accent/30'
              : 'bg-canvas border-border hover:border-slate-300'
          }`}
        >
          <input
            type="radio"
            name="exportMode"
            checked={exportMode === 'revealed-only'}
            onChange={() => setExportMode('revealed-only')}
            className="mt-1 text-accent focus:ring-accent"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-primaryText">
                Export Revealed Members Only (Public Safe)
              </span>
              <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                Recommended for Screen
              </span>
            </div>
            <p className="text-[11px] text-secondaryText mt-0.5">
              Only names revealed so far will be included. Unrevealed slots are marked as <code>[Concealed]</code> so no unannounced names leak.
            </p>
          </div>
        </label>

        {/* Option 2: Full Master Roster */}
        <label
          onClick={() => setExportMode('full-roster')}
          className={`flex items-start gap-3 p-3.5 rounded-lg border mb-6 cursor-pointer transition-all ${
            exportMode === 'full-roster'
              ? 'bg-accent-subtle/50 border-accent ring-1 ring-accent/30'
              : 'bg-canvas border-border hover:border-slate-300'
          }`}
        >
          <input
            type="radio"
            name="exportMode"
            checked={exportMode === 'full-roster'}
            onChange={() => setExportMode('full-roster')}
            className="mt-1 text-accent focus:ring-accent"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-primaryText">
                Export Complete Master Roster (Organizer View)
              </span>
              <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                Internal Only
              </span>
            </div>
            <p className="text-[11px] text-secondaryText mt-0.5">
              Exports all {teams.length} generated teams with all members, including names that haven&apos;t been revealed yet.
            </p>
          </div>
        </label>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-canvas hover:bg-slate-100 text-primaryText text-xs font-semibold border border-border transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <Download size={14} />
            <span>Download CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
