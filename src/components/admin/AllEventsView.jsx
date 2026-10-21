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
  ArrowRight,
  CheckSquare,
  Square,
  MinusSquare,
  X
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

  // Bulk selection state
  const [selectedEventIds, setSelectedEventIds] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      !search.trim() ||
      evt.name?.toLowerCase().includes(search.toLowerCase()) ||
      evt.description?.toLowerCase().includes(search.toLowerCase()) ||
      evt.eventType?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || evt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Bulk Selection Handlers
  const isAllFilteredSelected =
    filteredEvents.length > 0 &&
    filteredEvents.every((e) => selectedEventIds.has(e.eventId));

  const isSomeFilteredSelected =
    filteredEvents.some((e) => selectedEventIds.has(e.eventId)) && !isAllFilteredSelected;

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedEventIds(new Set());
    } else {
      const newSet = new Set(selectedEventIds);
      filteredEvents.forEach((e) => newSet.add(e.eventId));
      setSelectedEventIds(newSet);
    }
  };

  const handleToggleSelect = (evtId) => {
    const newSet = new Set(selectedEventIds);
    if (newSet.has(evtId)) {
      newSet.delete(evtId);
    } else {
      newSet.add(evtId);
    }
    setSelectedEventIds(newSet);
  };

  const handleClearSelection = () => {
    setSelectedEventIds(new Set());
  };

  // Bulk Delete Execution
  const handleExecuteBulkDelete = async () => {
    if (selectedEventIds.size === 0) return;
    setBulkDeleting(true);

    try {
      const idsToDelete = Array.from(selectedEventIds);
      const res = await eventsApi.bulkDelete(idsToDelete);
      if (res.success) {
        showToast(res.message || `Deleted ${res.count || idsToDelete.length} events`, 'success');
        setSelectedEventIds(new Set());
        setShowBulkDeleteModal(false);
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to bulk delete events', 'error');
    } finally {
      setBulkDeleting(false);
    }
  };

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

  const handleDelete = async (evtId, name) => {
    if (evtId === 'evt_hackathon_2027') {
      showToast('The primary default event cannot be deleted.', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to delete event "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await eventsApi.delete(evtId);
      if (res.success) {
        showToast(`Event "${name}" deleted`, 'success');
        setSelectedEventIds((prev) => {
          const next = new Set(prev);
          next.delete(evtId);
          return next;
        });
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
            <Calendar className="w-5 h-5 text-[#5557D9]" />
            All Events Management
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Organize, monitor, duplicate, and archive events across your organization.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateEvent}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5557D9] hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events by name, type, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5557D9]/20 focus:border-[#5557D9] shadow-xs text-neutral-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-neutral-200 rounded-lg px-2.5 py-2 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#5557D9]/20 focus:border-[#5557D9] shadow-xs cursor-pointer font-semibold"
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

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedEventIds.size > 0 && (
        <div className="bg-neutral-900 text-white rounded-xl p-3 px-4 shadow-xl flex items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold">
              {selectedEventIds.size} event{selectedEventIds.size === 1 ? '' : 's'} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBulkDeleteModal(true)}
              disabled={bulkDeleting}
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors shadow-sm"
            >
              <Trash2 size={13} />
              <span>Bulk Delete ({selectedEventIds.size})</span>
            </button>

            <button
              type="button"
              onClick={handleClearSelection}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs transition-colors cursor-pointer"
              title="Clear selection"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Events Table */}
      {events.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200/80 p-12 text-center shadow-sm">
          <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900">No Events Found</h3>
          <p className="text-sm text-neutral-500 mt-1 mb-4">Create your first event to get started.</p>
          <button
            type="button"
            onClick={onCreateEvent}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5557D9] hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
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
                  <th className="py-3 px-3 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="cursor-pointer text-neutral-500 hover:text-neutral-900"
                      title={isAllFilteredSelected ? 'Deselect all' : 'Select all'}
                    >
                      {isAllFilteredSelected ? (
                        <CheckSquare size={16} className="text-[#5557D9]" />
                      ) : isSomeFilteredSelected ? (
                        <MinusSquare size={16} className="text-[#5557D9]" />
                      ) : (
                        <Square size={16} className="text-neutral-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3">Event Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Participants</th>
                  <th className="py-3 px-3">Teams (Req / Gen)</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredEvents.map((evt) => {
                  const isCurrent = evt.eventId === selectedEventId;
                  const isSelected = selectedEventIds.has(evt.eventId);
                  const isProtected = evt.eventId === 'evt_hackathon_2027';

                  const dateStr = evt.updatedAt
                    ? new Date(evt.updatedAt).toLocaleDateString()
                    : evt.createdAt
                    ? new Date(evt.createdAt).toLocaleDateString()
                    : 'N/A';

                  return (
                    <tr
                      key={evt.eventId}
                      className={`hover:bg-neutral-50/60 transition-colors ${
                        isSelected ? 'bg-indigo-50/30' : isCurrent ? 'bg-indigo-50/15' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(evt.eventId)}
                          className="cursor-pointer text-neutral-400 hover:text-neutral-900"
                        >
                          {isSelected ? (
                            <CheckSquare size={15} className="text-[#5557D9]" />
                          ) : (
                            <Square size={15} />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                onSelectEvent(evt.eventId);
                                onNavigate('overview');
                              }}
                              className="font-bold text-neutral-900 hover:text-[#5557D9] text-left block cursor-pointer transition-colors"
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

                      <td className="py-3.5 px-3 text-neutral-600 font-medium">{evt.eventType || 'Hackathon'}</td>
                      <td className="py-3.5 px-3 font-semibold text-neutral-900">
                        {evt.participants?.length || 0}
                      </td>
                      <td className="py-3.5 px-3 text-neutral-700 font-mono">
                        {evt.rules?.requestedTeams || evt.rules?.totalTeams || 1} / {evt.generatedTeams?.length || 0}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md border ${getStatusBadge(
                            evt.status
                          )}`}
                        >
                          {evt.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-neutral-500 whitespace-nowrap font-mono text-[11px]">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectEvent(evt.eventId);
                              onNavigate('overview');
                            }}
                            className="p-1.5 text-neutral-600 hover:text-[#5557D9] hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                            title="Open Event"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(evt.eventId)}
                            className="p-1.5 text-neutral-600 hover:text-[#5557D9] hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                            title="Duplicate Event"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          {!isProtected && (
                            <button
                              type="button"
                              onClick={() => handleDelete(evt.eventId, evt.name)}
                              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Bulk Delete Events Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3 border border-red-100">
              <Trash2 size={20} />
            </div>
            <h3 className="font-bold text-base text-neutral-900 mb-1">
              Delete {selectedEventIds.size} Selected Events?
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed mb-5">
              You are about to permanently delete <strong className="text-neutral-900">{selectedEventIds.size} events</strong> and their associated draw snapshots.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={bulkDeleting}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkDelete}
                disabled={bulkDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm disabled:opacity-50"
              >
                {bulkDeleting ? 'Deleting...' : `Yes, Delete All (${selectedEventIds.size})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
