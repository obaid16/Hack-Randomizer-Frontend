'use client';

import { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Upload,
  Download,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
  X,
  Check,
  Tag,
  CheckSquare,
  Square,
  MinusSquare,
  UserCheck,
  UserX
} from 'lucide-react';
import { eventsApi } from '@/lib/api';

export default function ParticipantsView({
  currentEvent,
  onRefresh,
  showToast
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selection state for Bulk Operations
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    email: '',
    participantId: '',
    categoryId: currentEvent?.categories?.[0]?.id || '',
    skills: '',
    institution: '',
    phone: '',
    status: 'ACTIVE',
    notes: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // CSV Import State
  const [csvText, setCsvText] = useState('');
  const [importPreview, setImportPreview] = useState(null);
  const [importing, setImporting] = useState(false);

  const participants = currentEvent?.participants || [];
  const categories = currentEvent?.categories || [];

  // Summary counts
  const counts = useMemo(() => {
    const total = participants.length;
    const active = participants.filter((p) => p.status === 'ACTIVE').length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [participants]);

  // Filtered participants
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.participantId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.institution || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === 'ALL' || p.categoryId === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [participants, searchTerm, categoryFilter, statusFilter]);

  // Selection Handlers
  const isAllFilteredSelected =
    filteredParticipants.length > 0 &&
    filteredParticipants.every((p) => selectedIds.has(p.id));

  const isSomeFilteredSelected =
    filteredParticipants.some((p) => selectedIds.has(p.id)) && !isAllFilteredSelected;

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      const newSet = new Set(selectedIds);
      filteredParticipants.forEach((p) => newSet.add(p.id));
      setSelectedIds(newSet);
    }
  };

  const handleToggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Bulk Delete Execution
  const handleExecuteBulkDelete = async () => {
    if (!currentEvent || selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      const res = await eventsApi.bulkDeleteParticipants(
        currentEvent.eventId,
        Array.from(selectedIds)
      );
      if (res.success) {
        if (showToast) showToast(`Deleted ${res.count || selectedIds.size} participants`, 'success');
        setSelectedIds(new Set());
        setShowBulkDeleteModal(false);
        onRefresh();
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to bulk delete participants', 'error');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Bulk Status Update Execution
  const handleExecuteBulkStatus = async (newStatus) => {
    if (!currentEvent || selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      const res = await eventsApi.bulkUpdateParticipantsStatus(
        currentEvent.eventId,
        Array.from(selectedIds),
        newStatus
      );
      if (res.success) {
        if (showToast) {
          showToast(
            `Updated ${res.count || selectedIds.size} participants to ${newStatus}`,
            'success'
          );
        }
        setSelectedIds(new Set());
        onRefresh();
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to update participants', 'error');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      categoryId: categories[0]?.id || ''
    });
    setFormError(null);
    setEditingParticipant(null);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (p) => {
    setEditingParticipant(p);
    setFormData({
      name: p.name || '',
      email: p.email || '',
      participantId: p.participantId || '',
      categoryId: p.categoryId || categories[0]?.id || '',
      skills: Array.isArray(p.skills) ? p.skills.join(', ') : p.skills || '',
      institution: p.institution || '',
      phone: p.phone || '',
      status: p.status || 'ACTIVE',
      notes: p.notes || ''
    });
    setFormError(null);
    setShowAddModal(true);
  };

  // Save Participant (Add or Edit)
  const handleSaveParticipant = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Full name is required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);

    const payload = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      participantId: formData.participantId.trim(),
      institution: formData.institution.trim(),
      phone: formData.phone.trim(),
      notes: formData.notes.trim()
    };

    try {
      if (editingParticipant) {
        const res = await eventsApi.updateParticipant(
          currentEvent.eventId,
          editingParticipant.id,
          payload
        );
        if (res.success) {
          if (showToast) showToast(`Updated ${payload.name}`, 'success');
          setShowAddModal(false);
          onRefresh();
        }
      } else {
        const res = await eventsApi.addParticipant(currentEvent.eventId, payload);
        if (res.success) {
          if (showToast) showToast(`Added ${payload.name}`, 'success');
          setShowAddModal(false);
          onRefresh();
        }
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save participant.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Single Status (Active / Inactive)
  const handleToggleStatus = async (p) => {
    const newStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await eventsApi.updateParticipant(currentEvent.eventId, p.id, {
        status: newStatus
      });
      if (res.success) {
        if (showToast) showToast(`${p.name} marked ${newStatus}`, 'success');
        onRefresh();
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Status update failed', 'error');
    }
  };

  // Single Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await eventsApi.deleteParticipant(currentEvent.eventId, deletingId);
      if (res.success) {
        if (showToast) showToast('Participant removed', 'success');
        setDeletingId(null);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(deletingId);
          return next;
        });
        onRefresh();
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Delete failed', 'error');
    }
  };

  // Parse CSV Input
  const handleParseCsv = (text) => {
    setCsvText(text);
    if (!text.trim()) {
      setImportPreview(null);
      return;
    }

    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const valid = [];
    const invalid = [];

    const catLookup = new Map();
    categories.forEach((c) => {
      catLookup.set(c.id.toLowerCase(), c.id);
      catLookup.set(c.name.toLowerCase().trim(), c.id);
    });
    const defaultCatId = categories[0]?.id || 'cat_general';

    lines.forEach((line, idx) => {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length < 1 || !parts[0]) {
        invalid.push({ line: idx + 1, raw: line, reason: 'Missing name' });
        return;
      }

      const name = parts[0];
      const categoryRaw = parts[1] || '';
      const email = parts[2] || '';
      const participantId = parts[3] || '';
      const institution = parts[4] || '';

      const matchedCatId = catLookup.get(categoryRaw.toLowerCase()) || defaultCatId;

      valid.push({
        name,
        categoryId: matchedCatId,
        category: categoryRaw || categories[0]?.name || 'Participant',
        email,
        participantId,
        institution
      });
    });

    setImportPreview({ valid, invalid });
  };

  // Execute CSV Import
  const handleExecuteImport = async () => {
    if (!importPreview || importPreview.valid.length === 0) return;
    setImporting(true);
    try {
      const res = await eventsApi.bulkImport(currentEvent.eventId, importPreview.valid);
      if (res.success) {
        if (showToast) {
          showToast(
            `Imported ${res.count} participants (${res.skipped || 0} duplicates skipped)`,
            'success'
          );
        }
        setShowImportModal(false);
        setCsvText('');
        setImportPreview(null);
        onRefresh();
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Import failed', 'error');
    } finally {
      setImporting(false);
    }
  };

  // Export Roster as CSV
  const handleExportCsv = () => {
    const headers = ['Full Name', 'Participant ID', 'Category', 'Email', 'Institution', 'Status'];
    const rows = participants.map((p) => [
      `"${p.name || ''}"`,
      `"${p.participantId || ''}"`,
      `"${p.categoryName || ''}"`,
      `"${p.email || ''}"`,
      `"${p.institution || ''}"`,
      p.status || 'ACTIVE'
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentEvent.name.replace(/[^a-z0-9]/gi, '_')}_participants.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-[#5557D9] uppercase tracking-wider">
              {currentEvent?.name}
            </span>
          </div>
          <h1 className="font-bold text-2xl text-neutral-900">Participant Management</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage candidates, verify eligibility, and assign role categories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={participants.length === 0}
            className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 shadow-xs"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Upload size={14} />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#5557D9] hover:bg-indigo-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Participant</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            Total Roster
          </span>
          <p className="font-bold text-2xl text-neutral-900 mt-0.5">{counts.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            Active Eligible
          </span>
          <p className="font-bold text-2xl text-emerald-600 mt-0.5">{counts.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            Inactive / Excluded
          </span>
          <p className="font-bold text-2xl text-neutral-500 mt-0.5">{counts.inactive}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, email, ID, college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 focus:ring-2 focus:ring-[#5557D9]/20 focus:border-[#5557D9] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 cursor-pointer focus:outline-none w-1/2 sm:w-auto"
          >
            <option value="ALL">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 cursor-pointer focus:outline-none w-1/2 sm:w-auto"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-neutral-900 text-white rounded-xl p-3 px-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold">{selectedIds.size} participant{selectedIds.size === 1 ? '' : 's'} selected</span>
            <span className="text-neutral-400 hidden sm:inline">•</span>
            <span className="text-neutral-300 hidden sm:inline">Bulk actions will apply to selected records</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExecuteBulkStatus('ACTIVE')}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors"
            >
              <UserCheck size={13} />
              <span>Activate</span>
            </button>

            <button
              type="button"
              onClick={() => handleExecuteBulkStatus('INACTIVE')}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors"
            >
              <UserX size={13} />
              <span>Deactivate</span>
            </button>

            <button
              type="button"
              onClick={() => setShowBulkDeleteModal(true)}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors shadow-sm"
            >
              <Trash2 size={13} />
              <span>Bulk Delete ({selectedIds.size})</span>
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

      {/* Participant Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {filteredParticipants.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={32} className="mx-auto text-neutral-300 mb-3" />
            <p className="text-sm font-bold text-neutral-900 mb-1">No participants found</p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
              {searchTerm || categoryFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Try broadening your search or filter settings.'
                : 'Get started by adding participants manually or importing a CSV file.'}
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-[#5557D9] text-white text-xs font-bold hover:bg-indigo-700 inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <Plus size={14} />
              <span>Add First Participant</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 uppercase text-[10px] tracking-wider font-semibold">
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
                  <th className="py-3 px-3 font-bold">Participant Name</th>
                  <th className="py-3 px-3 font-bold">ID / Roll No</th>
                  <th className="py-3 px-3 font-bold">Category</th>
                  <th className="py-3 px-3 font-bold">Email</th>
                  <th className="py-3 px-3 font-bold text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredParticipants.map((p) => {
                  const isSelected = selectedIds.has(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-neutral-50/80 transition-colors ${
                        isSelected ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(p.id)}
                          className="cursor-pointer text-neutral-400 hover:text-neutral-900"
                        >
                          {isSelected ? (
                            <CheckSquare size={15} className="text-[#5557D9]" />
                          ) : (
                            <Square size={15} />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3 font-semibold text-neutral-900">
                        <span className="block">{p.name}</span>
                        {p.institution && (
                          <span className="text-[10px] text-neutral-500 font-normal block truncate max-w-[200px]">
                            {p.institution}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-neutral-600">
                        {p.participantId ? (
                          <span className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-[10px] font-bold text-neutral-800">
                            {p.participantId}
                          </span>
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[#5557D9] text-[10px] font-bold">
                          <Tag size={10} />
                          <span>{p.categoryName || 'General'}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-neutral-600 truncate max-w-[180px]">
                        {p.email || '—'}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                          }`}
                          title="Click to toggle status"
                        >
                          {p.status === 'ACTIVE' ? (
                            <>
                              <CheckCircle2 size={11} className="text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={11} className="text-neutral-400" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-[#5557D9] hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Edit Participant"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(p.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Participant"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Participant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <h3 className="font-bold text-base text-neutral-900">
                {editingParticipant ? 'Edit Participant Details' : 'Add New Participant'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveParticipant} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-900 focus:ring-2 focus:ring-[#5557D9]/20 focus:border-[#5557D9] focus:outline-none"
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 focus:ring-2 focus:ring-[#5557D9]/20 focus:border-[#5557D9] focus:outline-none cursor-pointer"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">Participant ID / Roll No</label>
                  <input
                    type="text"
                    placeholder="e.g. STU-2027-01"
                    value={formData.participantId}
                    onChange={(e) => setFormData({ ...formData, participantId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 focus:ring-2 focus:ring-[#5557D9]/20 focus:border-[#5557D9] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. alex@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 focus:ring-2 focus:ring-[#5557D9]/20 focus:border-[#5557D9] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">Institution / College</label>
                  <input
                    type="text"
                    placeholder="e.g. Tech University"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 focus:ring-2 focus:ring-[#5557D9]/20 focus:border-[#5557D9] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 focus:ring-2 focus:ring-[#5557D9]/20 focus:border-[#5557D9] focus:outline-none cursor-pointer"
                  >
                    <option value="ACTIVE">Active (Eligible for draw)</option>
                    <option value="INACTIVE">Inactive (Excluded from draw)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#5557D9] hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Saving...' : editingParticipant ? 'Update Participant' : 'Add to Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-xl w-full p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <div>
                <h3 className="font-bold text-base text-neutral-900">Bulk Import Participants</h3>
                <p className="text-[11px] text-neutral-500">Upload or paste CSV lines to populate the roster</p>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-neutral-500">
                  Format: Full Name, Category, Email, ID, Institution
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const sample = `Alex Morgan,${categories[0]?.name || 'Participant'},alex@edu.com,STU-01,Tech Univ\nJordan Lee,${categories[1]?.name || categories[0]?.name || 'Participant'},jordan@edu.com,STU-02,City College`;
                    handleParseCsv(sample);
                  }}
                  className="text-xs font-semibold text-[#5557D9] hover:underline cursor-pointer"
                >
                  Load Sample
                </button>
              </div>

              <textarea
                rows={5}
                placeholder="Paste CSV lines here or click 'Load Sample'..."
                value={csvText}
                onChange={(e) => handleParseCsv(e.target.value)}
                className="w-full p-3 rounded-xl border border-neutral-200 bg-neutral-50 font-mono text-xs text-neutral-800 focus:ring-2 focus:ring-[#5557D9]/20 focus:border-[#5557D9] focus:outline-none"
              />

              {/* Preview Box */}
              {importPreview && (
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-2">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>{importPreview.valid.length} valid rows ready to import</span>
                    </span>
                    {importPreview.invalid.length > 0 && (
                      <span className="text-red-600 text-[11px]">
                        {importPreview.invalid.length} skipped rows
                      </span>
                    )}
                  </div>

                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importPreview.valid.slice(0, 5).map((r, i) => (
                      <div key={i} className="text-[11px] text-neutral-800 font-mono truncate">
                        • {r.name} · {r.category} {r.email ? `(${r.email})` : ''}
                      </div>
                    ))}
                    {importPreview.valid.length > 5 && (
                      <p className="text-[10px] text-neutral-400 italic">
                        ...and {importPreview.valid.length - 5} more participants.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  disabled={importing}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={importing || !importPreview || importPreview.valid.length === 0}
                  className="px-5 py-2 rounded-xl bg-[#5557D9] hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-40 transition-colors"
                >
                  {importing ? 'Importing...' : `Import ${importPreview?.valid?.length || 0} Participants`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-sm w-full p-6 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={20} />
            </div>
            <h3 className="font-bold text-base text-neutral-900 mb-1">Delete Participant?</h3>
            <p className="text-xs text-neutral-500 leading-relaxed mb-5">
              This participant will be permanently removed from this event. Historical snapshots in saved draws will remain intact.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3 border border-red-100">
              <Trash2 size={20} />
            </div>
            <h3 className="font-bold text-base text-neutral-900 mb-1">
              Delete {selectedIds.size} Selected Participants?
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed mb-5">
              You are about to permanently delete <strong className="text-neutral-900">{selectedIds.size} participants</strong> from this event. This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={bulkActionLoading}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkDelete}
                disabled={bulkActionLoading}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm disabled:opacity-50"
              >
                {bulkActionLoading ? 'Deleting...' : `Yes, Delete All (${selectedIds.size})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
