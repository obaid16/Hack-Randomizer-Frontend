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
  Tag
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
    if (!formData.categoryId) {
      setFormError('Please select a category.');
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
        const res = await eventsApi.updateParticipant(currentEvent.eventId, editingParticipant.id, payload);
        if (res.success) {
          showToast(`Updated ${payload.name}`, 'success');
          setShowAddModal(false);
          onRefresh();
        } else {
          setFormError(res.message || 'Failed to update participant.');
        }
      } else {
        const res = await eventsApi.addParticipant(currentEvent.eventId, payload);
        if (res.success) {
          showToast(`Added ${payload.name}`, 'success');
          setShowAddModal(false);
          onRefresh();
        } else {
          setFormError(res.message || 'Failed to add participant.');
        }
      }
    } catch (err) {
      setFormError(err.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Participant
  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await eventsApi.deleteParticipant(currentEvent.eventId, deletingId);
      if (res.success) {
        showToast('Participant deleted successfully', 'success');
        setDeletingId(null);
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete participant', 'error');
    }
  };

  // Status Toggle
  const handleToggleStatus = async (p) => {
    const nextStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await eventsApi.updateParticipant(currentEvent.eventId, p.id, { status: nextStatus });
      if (res.success) {
        showToast(`Marked ${p.name} as ${nextStatus}`, 'success');
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Parse CSV Input
  const handleParseCsv = (rawText) => {
    setCsvText(rawText);
    if (!rawText.trim()) {
      setImportPreview(null);
      return;
    }

    const lines = rawText.split('\n').filter((l) => l.trim().length > 0);
    const valid = [];
    const invalid = [];

    // Check if first line is header
    const startIndex = lines[0].toLowerCase().includes('name') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      const name = cols[0];
      const category = cols[1] || categories[0]?.name;
      const email = cols[2] || '';
      const participantId = cols[3] || '';
      const institution = cols[4] || '';

      if (name && name.length > 0) {
        valid.push({ name, category, email, participantId, institution });
      } else {
        invalid.push({ line: i + 1, content: lines[i], reason: 'Missing name' });
      }
    }

    setImportPreview({ valid, invalid });
  };

  // Execute Bulk Import
  const handleExecuteImport = async () => {
    if (!importPreview || importPreview.valid.length === 0) return;

    setImporting(true);
    try {
      const res = await eventsApi.bulkImport(currentEvent.eventId, importPreview.valid);
      if (res.success) {
        showToast(`Successfully imported ${res.count} participants!`, 'success');
        setShowImportModal(false);
        setCsvText('');
        setImportPreview(null);
        onRefresh();
      } else {
        showToast(res.message || 'Bulk import failed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Import request failed', 'error');
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
      {/* 5.1 Participant Management Header */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider">
              {currentEvent?.name}
            </span>
          </div>
          <h1 className="font-display font-black text-2xl text-primaryText">Participant Management</h1>
          <p className="text-xs text-secondaryText mt-0.5">
            Manage candidates, verify eligibility, and assign role categories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            disabled={participants.length === 0}
            className="px-3.5 py-2 rounded-xl border border-border bg-canvas hover:bg-slate-100 text-xs font-semibold text-primaryText flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 rounded-xl border border-border bg-canvas hover:bg-slate-100 text-xs font-semibold text-primaryText flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload size={14} />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Participant</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-border p-3.5 shadow-2xs">
          <span className="text-[10px] font-mono text-secondaryText uppercase tracking-wider font-semibold block">
            Total Roster
          </span>
          <p className="font-display font-black text-xl text-primaryText mt-0.5">{counts.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-3.5 shadow-2xs">
          <span className="text-[10px] font-mono text-secondaryText uppercase tracking-wider font-semibold block">
            Active Eligible
          </span>
          <p className="font-display font-black text-xl text-emerald-600 mt-0.5">{counts.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-3.5 shadow-2xs">
          <span className="text-[10px] font-mono text-secondaryText uppercase tracking-wider font-semibold block">
            Inactive / Excluded
          </span>
          <p className="font-display font-black text-xl text-secondaryText mt-0.5">{counts.inactive}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-border p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondaryText" />
          <input
            type="text"
            placeholder="Search by name, email, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-canvas text-xs focus:ring-1 focus:ring-accent focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-canvas text-xs font-semibold text-secondaryText cursor-pointer focus:outline-hidden w-1/2 sm:w-auto"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-canvas text-xs font-semibold text-secondaryText cursor-pointer focus:outline-hidden w-1/2 sm:w-auto"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* 5.4 Participant Table */}
      <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
        {filteredParticipants.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={32} className="mx-auto text-secondaryText/40 mb-3" />
            <p className="text-sm font-bold text-primaryText mb-1">No participants found</p>
            <p className="text-xs text-secondaryText max-w-sm mx-auto mb-4">
              {searchTerm || categoryFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Try broadening your search or filter settings.'
                : 'Get started by adding participants manually or importing a CSV file.'}
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-hover inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add First Participant</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-canvas border-b border-border/80 text-secondaryText font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-bold">Participant Name</th>
                  <th className="py-3 px-3 font-bold">ID / Roll No</th>
                  <th className="py-3 px-3 font-bold">Category</th>
                  <th className="py-3 px-3 font-bold">Email</th>
                  <th className="py-3 px-3 font-bold text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredParticipants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-primaryText">
                      <span className="block">{p.name}</span>
                      {p.institution && (
                        <span className="text-[10px] text-secondaryText font-normal block truncate max-w-[200px]">
                          {p.institution}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-secondaryText">
                      {p.participantId ? (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-border/80 text-[10px] font-bold">
                          {p.participantId}
                        </span>
                      ) : (
                        <span className="text-secondaryText/40">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-subtle/40 border border-accent/20 text-accent text-[10px] font-bold">
                        <Tag size={10} />
                        <span>{p.categoryName || 'General'}</span>
                      </span>
                    </td>

                    <td className="py-3 px-3 text-secondaryText truncate max-w-[180px]">
                      {p.email || '—'}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                          p.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {p.status === 'ACTIVE' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                        <span>{p.status || 'ACTIVE'}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg text-secondaryText hover:text-accent hover:bg-accent-subtle/50 transition-colors inline-block cursor-pointer"
                        title="Edit Participant"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        onClick={() => setDeletingId(p.id)}
                        className="p-1.5 rounded-lg text-secondaryText hover:text-rose-600 hover:bg-rose-50 transition-colors inline-block cursor-pointer"
                        title="Delete Participant"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5.2 Add / Edit Participant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-lg w-full p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-border/80 mb-4">
              <h3 className="font-display font-bold text-base text-primaryText">
                {editingParticipant ? 'Edit Participant' : 'Add New Participant'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-secondaryText hover:text-primaryText hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveParticipant} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-primaryText block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-canvas text-xs focus:ring-1 focus:ring-accent focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-primaryText block mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-canvas text-xs focus:ring-1 focus:ring-accent focus:outline-hidden cursor-pointer"
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
                  <label className="text-xs font-bold text-primaryText block mb-1">Participant ID / Roll No</label>
                  <input
                    type="text"
                    placeholder="e.g. STU-2027-01"
                    value={formData.participantId}
                    onChange={(e) => setFormData({ ...formData, participantId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-canvas text-xs focus:ring-1 focus:ring-accent focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-primaryText block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. alex@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-canvas text-xs focus:ring-1 focus:ring-accent focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-primaryText block mb-1">Institution / College</label>
                  <input
                    type="text"
                    placeholder="e.g. Tech University"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-canvas text-xs focus:ring-1 focus:ring-accent focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-primaryText block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-canvas text-xs focus:ring-1 focus:ring-accent focus:outline-hidden cursor-pointer"
                  >
                    <option value="ACTIVE">Active (Eligible for draw)</option>
                    <option value="INACTIVE">Inactive (Excluded from draw)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-border/80 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingParticipant ? 'Update Participant' : 'Add to Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5.5 CSV Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-xl w-full p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-border/80 mb-4">
              <div>
                <h3 className="font-display font-bold text-base text-primaryText">Bulk Import Participants</h3>
                <p className="text-[11px] text-secondaryText">Upload or paste CSV lines to populate the roster</p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg text-secondaryText hover:text-primaryText hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-secondaryText">
                  Format: Full Name, Category, Email, ID, Institution
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const sample = `Alex Morgan,${categories[0]?.name || 'Participant'},alex@edu.com,STU-01,Tech Univ\nJordan Lee,${categories[1]?.name || categories[0]?.name || 'Participant'},jordan@edu.com,STU-02,City College`;
                    handleParseCsv(sample);
                  }}
                  className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                >
                  Load Sample
                </button>
              </div>

              <textarea
                rows={5}
                placeholder="Paste CSV lines here or click 'Load Sample'..."
                value={csvText}
                onChange={(e) => handleParseCsv(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-canvas font-mono text-xs focus:ring-1 focus:ring-accent focus:outline-hidden"
              />

              {/* Preview Box */}
              {importPreview && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-border text-xs space-y-2">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>{importPreview.valid.length} valid rows ready to import</span>
                    </span>
                    {importPreview.invalid.length > 0 && (
                      <span className="text-rose-600 text-[11px]">
                        {importPreview.invalid.length} skipped rows
                      </span>
                    )}
                  </div>

                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importPreview.valid.slice(0, 5).map((r, i) => (
                      <div key={i} className="text-[11px] text-primaryText font-mono truncate">
                        • {r.name} · {r.category} {r.email ? `(${r.email})` : ''}
                      </div>
                    ))}
                    {importPreview.valid.length > 5 && (
                      <p className="text-[10px] text-secondaryText italic">
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
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={importing || !importPreview || importPreview.valid.length === 0}
                  className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-40"
                >
                  {importing ? 'Importing...' : `Import ${importPreview?.valid?.length || 0} Participants`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-sm w-full p-6 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={20} />
            </div>
            <h3 className="font-display font-bold text-base text-primaryText mb-1">Delete Participant?</h3>
            <p className="text-xs text-secondaryText leading-relaxed mb-5">
              This participant will be permanently removed from this event. Historical snapshots in saved draws will remain intact.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
