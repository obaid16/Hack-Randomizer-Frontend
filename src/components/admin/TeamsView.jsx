'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Download,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  UserX,
  Printer,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { exportTeamsToPDF } from '@/lib/exportPdf';
import { useToast } from '@/context/ToastContext';

export default function TeamsView({ currentEvent, onNavigate }) {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [showUnassignedDrawer, setShowUnassignedDrawer] = useState(false);

  if (!currentEvent) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200/80 p-12 text-center shadow-sm">
        <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-neutral-900">No Event Selected</h3>
        <p className="text-sm text-neutral-500 mt-1">Please select an event to view formed teams.</p>
      </div>
    );
  }

  const generatedTeams = currentEvent.generatedTeams || [];
  const unassigned = currentEvent.unassigned || [];
  const drawVersion = currentEvent.drawVersion || 1;

  // Search filter
  const filteredTeams = generatedTeams.filter((team) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchesName = team.teamName?.toLowerCase().includes(q) || `team ${team.teamNumber}`.includes(q);
    const matchesMember = team.members?.some(
      (m) => m.name?.toLowerCase().includes(q) || m.role?.toLowerCase().includes(q)
    );
    return matchesName || matchesMember;
  });

  const handleExportPDF = () => {
    if (generatedTeams.length === 0) {
      showToast('No teams to export', 'error');
      return;
    }
    exportTeamsToPDF(generatedTeams, {
      eventName: currentEvent.name,
      drawVersion: drawVersion,
      unassignedCount: unassigned.length
    });
    showToast('Teams PDF exported successfully', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Formed Teams Roster
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-neutral-100 text-neutral-700 rounded-md">
              Version {drawVersion}
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            {generatedTeams.length} teams formed • {unassigned.length} unassigned participants in {currentEvent.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unassigned.length > 0 && (
            <button
              onClick={() => setShowUnassignedDrawer(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg transition-colors"
            >
              <UserX className="w-3.5 h-3.5" />
              Unassigned ({unassigned.length})
            </button>
          )}

          <button
            onClick={handleExportPDF}
            disabled={generatedTeams.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 disabled:opacity-40 text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export PDF
          </button>

          <Link
            href={`/team-draw?eventId=${currentEvent.eventId}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Live Reveal
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teams or members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-sm"
          />
        </div>
        <span className="text-xs text-neutral-500">
          Showing {filteredTeams.length} of {generatedTeams.length} teams
        </span>
      </div>

      {/* Empty State */}
      {generatedTeams.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200/80 p-12 text-center shadow-sm">
          <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900">No Teams Formed Yet</h3>
          <p className="text-sm text-neutral-500 mt-1 mb-4">
            Run the team formation engine to randomize balanced teams according to your category rules.
          </p>
          <button
            onClick={() => onNavigate && onNavigate('formation')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Go to Team Formation
          </button>
        </div>
      ) : (
        /* Teams Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team, idx) => (
            <div
              key={team.teamNumber || idx}
              className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm hover:border-neutral-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-100">
                      #{team.teamNumber || idx + 1}
                    </span>
                    <h4 className="font-bold text-neutral-900 text-sm">{team.teamName || `Team ${team.teamNumber}`}</h4>
                  </div>
                  <span className="text-[11px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                    {team.members?.length || 0} members
                  </span>
                </div>

                {/* Member Roster */}
                <div className="space-y-2">
                  {team.members?.map((member, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-2 rounded-lg bg-neutral-50/70 border border-neutral-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-neutral-900 block">{member.name}</span>
                        {member.categoryName && (
                          <span className="text-[10px] text-neutral-400 block">{member.categoryName}</span>
                        )}
                      </div>
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                        {member.role || 'Member'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                <span>Draw v{drawVersion}</span>
                <span>Balanced</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unassigned Drawer Modal */}
      {showUnassignedDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-base flex items-center gap-2">
                  <UserX className="w-4 h-4 text-amber-600" />
                  Unassigned Participants ({unassigned.length})
                </h3>
                <p className="text-xs text-neutral-500">Participants not placed into teams in Draw v{drawVersion}</p>
              </div>
              <button
                onClick={() => setShowUnassignedDrawer(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2">
              {unassigned.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-4">No unassigned participants.</p>
              ) : (
                unassigned.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-neutral-900 block">{p.name}</span>
                      <span className="text-[11px] text-neutral-400">{p.email || 'No email provided'}</span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-200/70 text-neutral-700 rounded">
                      {p.categoryName || 'General'}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100 flex justify-end">
              <button
                onClick={() => setShowUnassignedDrawer(false)}
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
