'use client';

import { useState } from 'react';
import {
  FileText,
  Download,
  Users,
  Layers,
  Sparkles,
  Calendar,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { exportTeamsToPDF } from '@/lib/exportPdf';
import { useToast } from '@/context/ToastContext';

export default function ReportsView({ currentEvent }) {
  const { showToast } = useToast();

  if (!currentEvent) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200/80 p-12 text-center shadow-sm">
        <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-neutral-900">No Event Selected</h3>
        <p className="text-sm text-neutral-500 mt-1">Please select an event to generate reports and exports.</p>
      </div>
    );
  }

  const participants = currentEvent.participants || [];
  const teams = currentEvent.generatedTeams || [];
  const unassigned = currentEvent.unassigned || [];
  const drawVersion = currentEvent.drawVersion || 1;

  // Export Participants CSV
  const handleExportParticipantsCSV = () => {
    if (participants.length === 0) {
      showToast('No participants to export', 'error');
      return;
    }
    const headers = ['Participant ID', 'Full Name', 'Email', 'Category', 'Status', 'Date Added'];
    const rows = participants.map((p) => {
      const cat = currentEvent.categories?.find((c) => c.id === p.categoryId);
      return [
        `"${p.participantId || ''}"`,
        `"${p.name || ''}"`,
        `"${p.email || ''}"`,
        `"${cat?.name || p.categoryId || ''}"`,
        `"${p.status || 'ACTIVE'}"`,
        `"${p.createdAt ? new Date(p.createdAt).toISOString() : ''}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentEvent.name.replace(/\s+/g, '_')}_participants.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Participant roster exported as CSV', 'success');
  };

  // Export Teams PDF
  const handleExportTeamsPDF = () => {
    if (teams.length === 0) {
      showToast('No teams generated to export', 'error');
      return;
    }
    exportTeamsToPDF(teams, {
      eventName: currentEvent.name,
      drawVersion: drawVersion,
      unassignedCount: unassigned.length
    });
    showToast(`Teams roster exported to PDF (Version ${drawVersion})`, 'success');
  };

  // Export Unassigned CSV
  const handleExportUnassignedCSV = () => {
    if (unassigned.length === 0) {
      showToast('No unassigned participants to export', 'error');
      return;
    }
    const headers = ['Full Name', 'Email', 'Category'];
    const rows = unassigned.map((p) => [
      `"${p.name || ''}"`,
      `"${p.email || ''}"`,
      `"${p.categoryName || p.categoryId || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentEvent.name.replace(/\s+/g, '_')}_unassigned.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Unassigned participants exported as CSV', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Reports & Export Center
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Download certified audit documents, rosters, and draw reports for {currentEvent.name}.
          </p>
        </div>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Teams PDF */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm flex flex-col justify-between hover:border-neutral-300 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900">Official Teams Roster (PDF)</h4>
              <p className="text-xs text-neutral-500 mt-1">
                Print-ready A4 PDF format showing all formed teams, member names, and assigned roles for Draw v{drawVersion}.
              </p>
            </div>
            <div className="pt-2 text-xs text-neutral-600 font-mono">
              <span>{teams.length} teams available</span>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 mt-4">
            <button
              onClick={handleExportTeamsPDF}
              disabled={teams.length === 0}
              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download Teams PDF
            </button>
          </div>
        </div>

        {/* Participants CSV */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm flex flex-col justify-between hover:border-neutral-300 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900">Participant Roster (CSV)</h4>
              <p className="text-xs text-neutral-500 mt-1">
                Complete database export of all registered participants, including categories, status, and IDs.
              </p>
            </div>
            <div className="pt-2 text-xs text-neutral-600 font-mono">
              <span>{participants.length} registered</span>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 mt-4">
            <button
              onClick={handleExportParticipantsCSV}
              disabled={participants.length === 0}
              className="w-full py-2 px-3 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 disabled:opacity-40 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV Roster
            </button>
          </div>
        </div>

        {/* Unassigned CSV */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm flex flex-col justify-between hover:border-neutral-300 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900">Unassigned Report (CSV)</h4>
              <p className="text-xs text-neutral-500 mt-1">
                Export participants who were not assigned to teams due to category quotas or constraints in Draw v{drawVersion}.
              </p>
            </div>
            <div className="pt-2 text-xs text-neutral-600 font-mono">
              <span>{unassigned.length} unassigned</span>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 mt-4">
            <button
              onClick={handleExportUnassignedCSV}
              disabled={unassigned.length === 0}
              className="w-full py-2 px-3 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 disabled:opacity-40 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download Unassigned CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
