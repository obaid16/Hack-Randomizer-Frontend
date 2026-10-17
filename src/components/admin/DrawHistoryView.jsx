'use client';

import { useState } from 'react';
import {
  History,
  Eye,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { exportTeamsToPDF } from '@/lib/exportPdf';
import { useToast } from '@/context/ToastContext';

export default function DrawHistoryView({ currentEvent }) {
  const { showToast } = useToast();
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);

  if (!currentEvent) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200/80 p-12 text-center shadow-sm">
        <History className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-neutral-900">No Event Selected</h3>
        <p className="text-sm text-neutral-500 mt-1">Please select an event to view historical team draws.</p>
      </div>
    );
  }

  const history = currentEvent.history || [];

  const handleExportSnapshotPDF = (snap) => {
    if (!snap.teams || snap.teams.length === 0) {
      showToast('No teams in this draw version', 'error');
      return;
    }
    exportTeamsToPDF(snap.teams, {
      eventName: currentEvent.name,
      drawVersion: snap.versionNumber,
      unassignedCount: snap.unassigned?.length || 0
    });
    showToast(`Exported Draw v${snap.versionNumber} to PDF`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            Immutable Draw History
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Historical snapshots of team draws for {currentEvent.name}. Records are permanent and immutable.
          </p>
        </div>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200/80 p-12 text-center shadow-sm">
          <History className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900">No Draws Saved Yet</h3>
          <p className="text-sm text-neutral-500 mt-1">
            When you run team formation, immutable snapshots will be recorded here automatically.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200/80 bg-neutral-50/70 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Teams Formed</th>
                  <th className="py-3 px-4">Assigned Members</th>
                  <th className="py-3 px-4">Unassigned</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {history.map((snap) => {
                  const assignedCount = (snap.teams || []).reduce(
                    (sum, t) => sum + (t.members ? t.members.length : 0),
                    0
                  );
                  const unassignedCount = snap.unassigned ? snap.unassigned.length : 0;
                  const dateStr = snap.createdAt ? new Date(snap.createdAt).toLocaleString() : 'N/A';

                  return (
                    <tr key={snap.versionNumber} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                          v{snap.versionNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        {dateStr}
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-900">{snap.teams?.length || 0} teams</td>
                      <td className="py-3 px-4 text-neutral-700">{assignedCount} participants</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            unassignedCount > 0 ? 'bg-amber-50 text-amber-800' : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {unassignedCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedSnapshot(snap)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          <button
                            onClick={() => handleExportSnapshotPDF(snap)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-medium rounded-lg transition-colors shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" />
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Snapshot Details Modal */}
      {selectedSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Draw Snapshot — Version {selectedSnapshot.versionNumber}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Generated on {new Date(selectedSnapshot.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedSnapshot(null)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(selectedSnapshot.teams || []).map((t, idx) => (
                  <div key={idx} className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-2">
                    <div className="flex items-center justify-between font-bold text-neutral-900 text-xs pb-1.5 border-b border-neutral-200">
                      <span>{t.teamName || `Team ${t.teamNumber || idx + 1}`}</span>
                      <span className="text-[10px] text-neutral-500 font-normal">
                        {t.members?.length || 0} members
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {t.members?.map((m, mIdx) => (
                        <div key={mIdx} className="flex items-center justify-between text-xs">
                          <span className="text-neutral-800 font-medium">{m.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-white text-neutral-600 rounded border border-neutral-200">
                            {m.role || 'Member'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-2">
              <button
                onClick={() => handleExportSnapshotPDF(selectedSnapshot)}
                className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-100 transition-colors inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export PDF
              </button>
              <button
                onClick={() => setSelectedSnapshot(null)}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
