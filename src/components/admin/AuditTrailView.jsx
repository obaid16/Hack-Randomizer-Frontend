'use client';

import { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Clock,
  Shield,
  Layers,
  Users,
  Sparkles,
  Settings
} from 'lucide-react';

export default function AuditTrailView({ currentEvent }) {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  if (!currentEvent) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200/80 p-12 text-center shadow-sm">
        <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-neutral-900">No Event Selected</h3>
        <p className="text-sm text-neutral-500 mt-1">Please select an event to view its immutable audit logs.</p>
      </div>
    );
  }

  const logs = currentEvent.auditLogs || [];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !search.trim() ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      JSON.stringify(log.details || '').toLowerCase().includes(search.toLowerCase()) ||
      log.performedBy?.toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action).filter(Boolean)));

  const getActionBadge = (action) => {
    if (action.includes('GENERATE') || action.includes('DRAW')) {
      return 'bg-purple-50 text-purple-700 border-purple-100';
    }
    if (action.includes('PARTICIPANT')) {
      return 'bg-blue-50 text-blue-700 border-blue-100';
    }
    if (action.includes('CATEGORY')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    }
    if (action.includes('CREATE')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
    return 'bg-neutral-100 text-neutral-700 border-neutral-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Event Audit Trail
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Complete immutable log of all administrative actions, rule modifications, and team draws for {currentEvent.name}.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs bg-white border border-neutral-200 rounded-lg px-2.5 py-2 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-sm"
          >
            <option value="ALL">All Actions ({logs.length})</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      {logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200/80 p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900">No Activity Logged</h3>
          <p className="text-sm text-neutral-500 mt-1">Actions taken within this event will be logged here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200/80 bg-neutral-50/70 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Details / Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded border ${getActionBadge(
                          log.action || ''
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-medium text-neutral-800">
                      {log.performedBy || 'Admin System'}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 max-w-md font-mono text-[11px] truncate">
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
