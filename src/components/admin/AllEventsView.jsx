'use client';

import { useState } from 'react';
import {
  Calendar,
  Search,
  Filter,
  Plus,
  Copy,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  Sparkles,
  Archive,
  ArrowRight
} from 'lucide-react';
import { eventsApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function AllEventsView({
  events = [],
  selectedEventId,
  onSelectEvent,
  onCreateEvent,
  onRefresh,
  onNavigate
}) {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(false);

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      !search.trim() ||
      evt.name?.toLowerCase().includes(search.toLowerCase()) ||
      evt.description?.toLowerCase().includes(search.toLowerCase()) ||
      evt.eventType?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || evt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDuplicate = async (evtId) => {
    setActionLoading(true);
    try {
      const res = await eventsApi.duplicate(evtId, { copyParticipants: false });
      if (res.success) {
        showToast('Duplicated event as template', 'success');
        onRefresh();
        onSelectEvent(res.event.eventId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to duplicate event', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (evtId, newStatus) => {
    try {
      const res = await eventsApi.update(evtId, { status: newStatus });
      if (res.success) {
        showToast(`Event status updated to ${newStatus}`, 'success');
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (evtId, name) => {
    if (!confirm(`Are you sure you want to delete event "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await eventsApi.delete(evtId);
      if (res.success) {
        showToast(`Event "${name}" deleted`, 'success');
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete event', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'READY':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'COMPLETED':
        return 'bg-purple-50 text-purple-700 border-purple-200/60';
      case 'ARCHIVED':
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            All Events Management
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Organize, monitor, duplicate, and archive events across your organization.
          </p>
        </div>
        <button
          onClick={onCreateEvent}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events by name, type, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-neutral-200 rounded-lg px-2.5 py-2 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-sm"
          >
            <option value="ALL">All Statuses ({events.length})</option>
            <option value="ACTIVE">Active</option>
            <option value="READY">Ready</option>
            <option value="DRAFT">Draft</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      {events.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200/80 p-12 text-center shadow-sm">
          <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900">No Events Found</h3>
          <p className="text-sm text-neutral-500 mt-1 mb-4">Create your first event to get started.</p>
          <button
            onClick={onCreateEvent}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200/80 bg-neutral-50/70 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Event Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Participants</th>
                  <th className="py-3 px-4">Teams (Req / Gen)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredEvents.map((evt) => {
                  const isCurrent = evt.eventId === selectedEventId;
                  const dateStr = evt.updatedAt
                    ? new Date(evt.updatedAt).toLocaleDateString()
                    : evt.createdAt
                    ? new Date(evt.createdAt).toLocaleDateString()
                    : 'N/A';

                  return (
                    <tr
                      key={evt.eventId}
                      className={`hover:bg-neutral-50/60 transition-colors ${
                        isCurrent ? 'bg-indigo-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <button
                              onClick={() => {
                                onSelectEvent(evt.eventId);
                                onNavigate('overview');
                              }}
                              className="font-semibold text-neutral-900 hover:text-indigo-600 text-left block"
                            >
                              {evt.name}
                            </button>
                            {evt.description && (
                              <span className="text-[11px] text-neutral-400 block truncate max-w-xs">
                                {evt.description}
                              </span>
                            )}
                          </div>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-100 text-indigo-700 rounded">
                              CURRENT
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600 font-medium">{evt.eventType || 'Hackathon'}</td>
                      <td className="py-3.5 px-4 font-semibold text-neutral-900">
                        {evt.participants?.length || 0}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-700">
                        {evt.rules?.totalTeams || 1} / {evt.generatedTeams?.length || 0}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md border ${getStatusBadge(
                            evt.status
                          )}`}
                        >
                          {evt.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">{dateStr}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              onSelectEvent(evt.eventId);
                              onNavigate('overview');
                            }}
                            className="p-1.5 text-neutral-600 hover:text-indigo-600 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Open Event"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(evt.eventId)}
                            className="p-1.5 text-neutral-600 hover:text-indigo-600 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Duplicate Template"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(evt.eventId, evt.name)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
