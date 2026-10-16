'use client';

import { useState } from 'react';
import { FileText, X, Download, ShieldCheck, Eye } from 'lucide-react';
import { exportTeamsToPDF } from '@/lib/exportPdf';

/**
 * PDF-Only Export Modal.
 * Exports official hackathon team allocations in clean PDF format only.
 */
export default function ExportModal({
  isOpen = false,
  teams = [],
  unassigned = {},
  onClose
}) {
  const [exportMode, setExportMode] = useState('full-roster');

  if (!isOpen) return null;

  const handleExport = () => {
    exportTeamsToPDF(teams, unassigned, exportMode);
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
            <FileText size={18} className="text-accent" />
            <h3 className="font-display font-bold text-base">
              Export Hackathon Team Roster (PDF)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-secondaryText hover:text-primaryText p-1 rounded cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-secondaryText mb-5 leading-relaxed">
          Generates an official, publication-ready PDF document formatted for college event administration and screen presentation.
        </p>

        {/* Option 1: Full Master Roster (Default) */}
        <label
          onClick={() => setExportMode('full-roster')}
          className={`flex items-start gap-3 p-3.5 rounded-lg border mb-3 cursor-pointer transition-all ${
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
                Complete Master Roster (Official PDF)
              </span>
              <span className="text-[10px] font-mono uppercase bg-accent-subtle text-accent px-1.5 py-0.2 rounded font-semibold">
                Recommended
              </span>
            </div>
            <p className="text-[11px] text-secondaryText mt-0.5">
              Includes all {teams.length} generated teams with leaders, core members, assigned mentors, and unassigned participants.
            </p>
          </div>
        </label>

        {/* Option 2: Revealed Only */}
        <label
          onClick={() => setExportMode('revealed-only')}
          className={`flex items-start gap-3 p-3.5 rounded-lg border mb-6 cursor-pointer transition-all ${
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
                Revealed Members Only (Broadcast PDF)
              </span>
              <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                Public Safe
              </span>
            </div>
            <p className="text-[11px] text-secondaryText mt-0.5">
              Only names revealed so far appear. Unrevealed slots remain masked as <code>[Concealed]</code> so no unannounced names leak.
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
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
