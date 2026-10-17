'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Layers,
  Users,
  Sparkles,
  History,
  Settings,
  Plus,
  RefreshCw,
  Copy,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Calendar,
  Eye,
  Download,
  Clock,
  ArrowRight,
  Filter,
  Check,
  X,
  FileText
} from 'lucide-react';
import { authApi, eventsApi } from '@/lib/api';
import { exportTeamsToPDF } from '@/lib/exportPdf';
import { useToast } from '@/context/ToastContext';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();

  // Authentication state
  const [admin, setAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Multi-Event State
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'categories' | 'participants' | 'rules' | 'generate' | 'history' | 'audit'

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddPartModal, setShowAddPartModal] = useState(false);
  const [showBulkPartModal, setShowBulkPartModal] = useState(false);
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showConfirmAction, setShowConfirmAction] = useState(null);

  // Forms state
  const [newEventForm, setNewEventForm] = useState({ name: '', description: '', startDate: '', endDate: '' });
  const [newPartForm, setNewPartForm] = useState({ name: '', email: '', categoryId: '' });
  const [bulkPartText, setBulkPartText] = useState('');
  const [newCatForm, setNewCatForm] = useState({ name: '', roleTag: 'Member', countPerTeam: 1, isUniqueMentor: false });

  // Feasibility state
  const [feasibility, setFeasibility] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generatedDraw, setGeneratedDraw] = useState(null);

  // Filter state for participants
  const [partSearch, setPartSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');

  // 1. Authenticate admin
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await authApi.getMe();
        if (res.success && res.admin) {
          setAdmin(res.admin);
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  // 2. Fetch Events
  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const res = await eventsApi.getAll();
      if (res.success) {
        setEvents(res.events || []);
        if (!selectedEventId && res.events?.length > 0) {
          setSelectedEventId(res.events[0].eventId);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to load events', 'error');
    } finally {
      setEventsLoading(false);
    }
  }, [selectedEventId, showToast]);

  useEffect(() => {
    if (admin) {
      loadEvents();
    }
  }, [admin, loadEvents]);

  // 3. Fetch Single Event Details
  const loadCurrentEvent = useCallback(async (evtId) => {
    if (!evtId) return;
    try {
      const res = await eventsApi.getById(evtId);
      if (res.success) {
        setCurrentEvent(res.event);
        // Also fetch feasibility preview
        try {
          const feasRes = await eventsApi.getFeasibility(evtId);
          if (feasRes.success) setFeasibility(feasRes.feasibility);
        } catch {
          // ignore
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to load event details', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    if (selectedEventId) {
      loadCurrentEvent(selectedEventId);
    }
  }, [selectedEventId, loadCurrentEvent]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await authApi.logout();
      showToast('Logged out successfully', 'success');
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  // Create Event
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEventForm.name.trim()) return;
    try {
      const res = await eventsApi.create(newEventForm);
      if (res.success) {
        showToast(`Created event "${newEventForm.name}"`, 'success');
        setShowCreateModal(false);
        setNewEventForm({ name: '', description: '', startDate: '', endDate: '' });
        await loadEvents();
        setSelectedEventId(res.event.eventId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to create event', 'error');
    }
  };

  // Duplicate Event Template
  const handleDuplicateTemplate = async (evtId) => {
    try {
      const res = await eventsApi.duplicate(evtId, { copyParticipants: false });
      if (res.success) {
        showToast('Duplicated event configuration as template', 'success');
        await loadEvents();
        setSelectedEventId(res.event.eventId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to duplicate event', 'error');
    }
  };

  // Status Change
  const handleStatusChange = async (newStatus) => {
    if (!currentEvent) return;
    try {
      const res = await eventsApi.update(currentEvent.eventId, { status: newStatus });
      if (res.success) {
        showToast(`Event status updated to ${newStatus}`, 'success');
        loadCurrentEvent(currentEvent.eventId);
        loadEvents();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Add Participant
  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!newPartForm.name.trim() || !newPartForm.categoryId) return;
    try {
      const res = await eventsApi.addParticipant(currentEvent.eventId, newPartForm);
      if (res.success) {
        showToast(`Added ${newPartForm.name}`, 'success');
        setShowAddPartModal(false);
        setNewPartForm({ name: '', email: '', categoryId: '' });
        loadCurrentEvent(currentEvent.eventId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to add participant', 'error');
    }
  };

  // Bulk Import
  const handleBulkImport = async () => {
    if (!bulkPartText.trim()) return;
    const lines = bulkPartText.split('\n').filter((l) => l.trim().length > 0);
    const parsed = lines.map((line) => {
      const parts = line.split(',').map((p) => p.trim());
      return {
        name: parts[0],
        categoryId: parts[1] || currentEvent?.categories[0]?.id,
        email: parts[2] || ''
      };
    });

    try {
      const res = await eventsApi.bulkImport(currentEvent.eventId, parsed);
      if (res.success) {
        showToast(`Imported ${res.count} participants`, 'success');
        setShowBulkPartModal(false);
        setBulkPartText('');
        loadCurrentEvent(currentEvent.eventId);
      }
    } catch (err) {
      showToast(err.message || 'Bulk import failed', 'error');
    }
  };

  // Delete Participant
  const handleDeleteParticipant = async (partId) => {
    try {
      const res = await eventsApi.deleteParticipant(currentEvent.eventId, partId);
      if (res.success) {
        showToast('Participant deleted', 'success');
        loadCurrentEvent(currentEvent.eventId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  // Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatForm.name.trim()) return;
    const newCatId = `cat_${newCatForm.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;
    const updatedCategories = [
      ...(currentEvent.categories || []),
      {
        id: newCatId,
        name: newCatForm.name.trim(),
        roleTag: newCatForm.roleTag || 'Member',
        countPerTeam: Number(newCatForm.countPerTeam) || 1,
        isUniqueMentor: Boolean(newCatForm.isUniqueMentor)
      }
    ];

    const updatedComposition = [
      ...(currentEvent.rules?.composition || []),
      {
        categoryId: newCatId,
        count: Number(newCatForm.countPerTeam) || 1,
        roleTag: newCatForm.roleTag || 'Member'
      }
    ];

    try {
      const res = await eventsApi.update(currentEvent.eventId, {
        categories: updatedCategories,
        rules: {
          ...currentEvent.rules,
          teamSize: updatedComposition.reduce((a, b) => a + b.count, 0),
          composition: updatedComposition
        }
      });
      if (res.success) {
        showToast(`Category "${newCatForm.name}" created`, 'success');
        setShowAddCatModal(false);
        setNewCatForm({ name: '', roleTag: 'Member', countPerTeam: 1, isUniqueMentor: false });
        loadCurrentEvent(currentEvent.eventId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to add category', 'error');
    }
  };

  // Server-Verified Team Generation (Admin-Only Trigger)
  const handleGenerateTeams = async () => {
    if (!currentEvent) return;
    setGenerating(true);
    try {
      const res = await eventsApi.generate(currentEvent.eventId, {
        requestedTeamCount: currentEvent.rules?.requestedTeams
      });
      if (res.success) {
        showToast(`Generated ${res.draw.totalTeams} teams for ${res.draw.title}`, 'success');
        setGeneratedDraw(res.draw);
        loadCurrentEvent(currentEvent.eventId);
        loadEvents();
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate teams', 'error');
    } finally {
      setGenerating(false);
      setShowConfirmAction(null);
    }
  };

  // Download PDF
  const handleExportPDF = (draw) => {
    try {
      exportTeamsToPDF(draw.teams, draw.unassigned, 'full-roster');
      showToast('PDF exported successfully', 'success');
    } catch (err) {
      showToast(err.message || 'PDF export failed', 'error');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs font-mono text-secondaryText">Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  const filteredParticipants = (currentEvent?.participants || []).filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(partSearch.toLowerCase()) || p.email?.toLowerCase().includes(partSearch.toLowerCase());
    const matchesCat = catFilter === 'ALL' || p.categoryId === catFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-canvas text-primaryText flex flex-col justify-between selection:bg-accent/20">
      <div>
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-border px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center shadow-xs">
              <Shield size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-sm sm:text-base text-primaryText">
                  Event Governance Portal
                </span>
                <span className="text-[10px] font-mono uppercase bg-accent-subtle text-accent px-1.5 py-0.2 rounded font-bold border border-accent/20">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-secondaryText -mt-0.5">
                Multi-Event Control & Team Formation Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/team-draw"
              className="text-xs font-semibold text-secondaryText hover:text-primaryText px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors hidden sm:inline-flex items-center gap-1.5"
            >
              <Sparkles size={13} className="text-accent" />
              <span>Live Team Draw</span>
            </Link>

            <Link
              href="/"
              className="text-xs font-semibold text-secondaryText hover:text-primaryText px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors hidden sm:inline"
            >
              Public Home
            </Link>

            <div className="h-4 w-px bg-border hidden sm:block" />

            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-secondaryText hidden md:inline">
                {admin?.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-lg border border-border bg-slate-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-secondaryText text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                title="Log out of administrator session"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Sub-Header: Event Selector Banner */}
        <section className="bg-slate-50 border-b border-border/80 px-4 sm:px-8 py-3.5">
          <div className="app-container flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-secondaryText uppercase">
                Active Event:
              </span>
              <select
                value={selectedEventId || ''}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white border border-border text-xs font-bold text-primaryText focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer shadow-xs max-w-xs truncate"
              >
                {events.map((evt) => (
                  <option key={evt.eventId} value={evt.eventId}>
                    {evt.name} [{evt.status}]
                  </option>
                ))}
              </select>

              {currentEvent && (
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                    currentEvent.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : currentEvent.status === 'READY'
                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                      : currentEvent.status === 'COMPLETED'
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : currentEvent.status === 'ARCHIVED'
                      ? 'bg-slate-100 text-slate-600 border-slate-300'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {currentEvent.status}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>New Event</span>
              </button>

              <button
                type="button"
                onClick={() => handleDuplicateTemplate(selectedEventId)}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-primaryText border border-border text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                title="Duplicate this event configuration as a template"
              >
                <Copy size={13} className="text-secondaryText" />
                <span>Duplicate Template</span>
              </button>
            </div>
          </div>
        </section>

        {/* Main App Area */}
        <main className="app-container py-6 sm:py-8">
          {/* Workspace Tabs Navigation */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 border-b border-border/80 mb-6 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Overview & Status', icon: Layers },
              { id: 'categories', label: `Categories (${currentEvent?.categories?.length || 0})`, icon: Settings },
              { id: 'participants', label: `Participants (${currentEvent?.participants?.length || 0})`, icon: Users },
              { id: 'rules', label: 'Team Rules & Feasibility', icon: Filter },
              { id: 'generate', label: 'Team Formation (Admin)', icon: Sparkles },
              { id: 'history', label: `Draw History (${currentEvent?.drawVersions?.length || 0})`, icon: History },
              { id: 'audit', label: `Audit Trail (${currentEvent?.auditLogs?.length || 0})`, icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-accent text-white shadow-xs'
                      : 'text-secondaryText hover:text-primaryText hover:bg-white'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW & STATUS */}
          {activeTab === 'overview' && currentEvent && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-border p-6 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-border/80">
                  <div>
                    <h2 className="font-display font-extrabold text-xl text-primaryText">
                      {currentEvent.name}
                    </h2>
                    <p className="text-xs text-secondaryText mt-1">
                      Event ID: <span className="font-mono">{currentEvent.eventId}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-secondaryText font-medium">Transition Status:</span>
                    <select
                      value={currentEvent.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-canvas border border-border text-xs font-bold text-primaryText focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
                    >
                      <option value="DRAFT">DRAFT (In Preparation)</option>
                      <option value="READY">READY (Validated)</option>
                      <option value="ACTIVE">ACTIVE (Ready for Draw)</option>
                      <option value="COMPLETED">COMPLETED (Finished)</option>
                      <option value="ARCHIVED">ARCHIVED (Read-Only)</option>
                    </select>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-secondaryText leading-relaxed mb-6">
                  {currentEvent.description || 'No description provided for this event.'}
                </p>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-border/70">
                    <span className="text-[10px] font-mono text-secondaryText uppercase block">Active Participants</span>
                    <span className="text-xl font-extrabold text-primaryText mt-1 block">
                      {currentEvent.participants?.filter((p) => p.status === 'ACTIVE').length || 0}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-border/70">
                    <span className="text-[10px] font-mono text-secondaryText uppercase block">Categories</span>
                    <span className="text-xl font-extrabold text-primaryText mt-1 block">
                      {currentEvent.categories?.length || 0}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-border/70">
                    <span className="text-[10px] font-mono text-secondaryText uppercase block">Requested Teams</span>
                    <span className="text-xl font-extrabold text-primaryText mt-1 block">
                      {currentEvent.rules?.requestedTeams || 0}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-border/70">
                    <span className="text-[10px] font-mono text-secondaryText uppercase block">Draw Versions</span>
                    <span className="text-xl font-extrabold text-primaryText mt-1 block">
                      {currentEvent.drawVersions?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CATEGORIES & ROLES */}
          {activeTab === 'categories' && currentEvent && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div>
                  <h3 className="font-display font-bold text-lg text-primaryText">Event Categories & Roles</h3>
                  <p className="text-xs text-secondaryText">Define custom participant categories and team slot role assignments.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-accent text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-accent-hover"
                >
                  <Plus size={14} />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(currentEvent.categories || []).map((cat) => (
                  <div key={cat.id} className="p-5 rounded-2xl bg-white border border-border shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-secondaryText uppercase">Role: {cat.roleTag}</span>
                        {cat.isUniqueMentor && (
                          <span className="text-[10px] font-bold text-mentor-DEFAULT bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Strict 1:1 Unique
                          </span>
                        )}
                      </div>
                      <h4 className="font-display font-bold text-base text-primaryText mb-1">{cat.name}</h4>
                      <p className="text-xs text-secondaryText mb-4">{cat.description || 'No description'}</p>
                    </div>

                    <div className="pt-3 border-t border-border/70 flex items-center justify-between text-xs">
                      <span className="font-mono text-secondaryText">Quota per team:</span>
                      <span className="font-bold text-primaryText px-2 py-0.5 rounded bg-slate-100">
                        {cat.countPerTeam} {cat.countPerTeam === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PARTICIPANTS ROSTER */}
          {activeTab === 'participants' && currentEvent && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    placeholder="Search participants..."
                    value={partSearch}
                    onChange={(e) => setPartSearch(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 w-48"
                  />

                  <select
                    value={catFilter}
                    onChange={(e) => setCatFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-semibold focus:outline-none"
                  >
                    <option value="ALL">All Categories ({currentEvent.participants?.length || 0})</option>
                    {currentEvent.categories?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({(currentEvent.participants || []).filter((p) => p.categoryId === c.id).length})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkPartModal(true)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                  >
                    Bulk Import (CSV/JSON)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddPartModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Participant</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-border text-secondaryText font-mono uppercase text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/70">
                      {filteredParticipants.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-secondaryText">
                            No participants found matching the criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredParticipants.map((part) => (
                          <tr key={part.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 px-4 font-semibold text-primaryText">{part.name}</td>
                            <td className="py-2.5 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-accent-subtle text-accent border border-accent/20">
                                {part.categoryName || part.categoryId}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-mono text-secondaryText">{part.email || '—'}</td>
                            <td className="py-2.5 px-4">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  part.status === 'ACTIVE'
                                    ? 'bg-emerald-50 text-emerald-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {part.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteParticipant(part.id)}
                                className="p-1 rounded text-secondaryText hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                                title="Delete participant"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEAM RULES & FEASIBILITY */}
          {activeTab === 'rules' && currentEvent && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-border p-6 shadow-xs">
                <h3 className="font-display font-bold text-lg text-primaryText mb-1">Configured Team Formula</h3>
                <p className="text-xs text-secondaryText mb-6">
                  Review and preview feasibility before generating randomized team assignments.
                </p>

                {/* Feasibility Alert Card */}
                {feasibility && (
                  <div
                    className={`p-5 rounded-2xl border mb-6 ${
                      feasibility.isFeasible
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50/70 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-display font-bold text-sm mb-2">
                      {feasibility.isFeasible ? (
                        <>
                          <CheckCircle2 size={18} className="text-emerald-600" />
                          <span>Feasible: Configuration can form {currentEvent.rules?.requestedTeams} complete teams</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={18} className="text-amber-600" />
                          <span>Capacity Warning: Requested count ({feasibility.requestedTeams}) exceeds max possible ({feasibility.maxPossibleTeams})</span>
                        </>
                      )}
                    </div>

                    {!feasibility.isFeasible && feasibility.bottleneckCategory && (
                      <p className="text-xs text-amber-800 mb-3">
                        Bottleneck identified: <strong>{feasibility.bottleneckCategory}</strong> limits the generation to a maximum of <strong>{feasibility.maxPossibleTeams}</strong> teams.
                      </p>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-3 pt-3 border-t border-black/10">
                      <div>
                        <span className="text-[10px] font-mono uppercase block opacity-70">Active Roster</span>
                        <span className="font-bold text-sm">{feasibility.activeParticipantsCount} participants</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase block opacity-70">Max Feasible</span>
                        <span className="font-bold text-sm">{feasibility.maxPossibleTeams} teams</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase block opacity-70">Expected Assigned</span>
                        <span className="font-bold text-sm">{feasibility.expectedAssigned} members</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase block opacity-70">Leftover Pool</span>
                        <span className="font-bold text-sm">{feasibility.expectedUnassigned} members</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: TEAM FORMATION (ADMIN TRIGGER) */}
          {activeTab === 'generate' && currentEvent && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-border p-6 shadow-xs text-center max-w-xl mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-accent-subtle text-accent flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={24} />
                </div>
                <h3 className="font-display font-black text-xl text-primaryText mb-1">
                  Server-Verified Team Formation
                </h3>
                <p className="text-xs text-secondaryText leading-relaxed mb-6">
                  Initiating team formation executes Fisher-Yates uniform randomization on the server, verifies all eligibility quotas, and saves an immutable draw version to MongoDB Atlas.
                </p>

                <div className="p-4 rounded-xl bg-slate-50 border border-border/80 text-left mb-6 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-secondaryText">Target Event:</span>
                    <span className="font-bold text-primaryText">{currentEvent.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondaryText">Requested Teams:</span>
                    <span className="font-bold text-primaryText">{currentEvent.rules?.requestedTeams || 10}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondaryText">Team Formula:</span>
                    <span className="font-bold text-primaryText">
                      {currentEvent.rules?.composition?.map((c) => `${c.count} ${c.roleTag}`).join(' + ') || 'Custom'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={generating || currentEvent.status === 'ARCHIVED'}
                  onClick={() => setShowConfirmAction('generate')}
                  className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Forming Teams on Server...</span>
                    </>
                  ) : (
                    <>
                      <span>Form Teams Now</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>

              {/* Show Generated Preview if available */}
              {generatedDraw && (
                <div className="mt-8 pt-8 border-t border-border">
                  <div className="flex items-center justify-between pb-4 mb-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                        VERSION {generatedDraw.version} GENERATED
                      </span>
                      <h4 className="font-display font-extrabold text-xl text-primaryText mt-1">
                        {generatedDraw.title} ({generatedDraw.totalTeams} Teams)
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleExportPDF(generatedDraw)}
                        className="px-3 py-2 rounded-lg bg-white border border-border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-slate-50"
                      >
                        <Download size={13} />
                        <span>Export PDF</span>
                      </button>

                      <Link
                        href={`/team-draw?event=${currentEvent.eventId}`}
                        className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs hover:bg-accent-hover"
                      >
                        <Sparkles size={13} />
                        <span>Open Suspense Reveal Screen</span>
                      </Link>
                    </div>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {generatedDraw.teams.map((t) => (
                      <div key={t.id} className="p-4 rounded-xl bg-white border border-border shadow-xs">
                        <span className="font-display font-bold text-sm text-primaryText block mb-3">{t.name}</span>
                        <div className="space-y-1.5 text-xs">
                          {t.members.map((m, mIdx) => (
                            <div key={mIdx} className="flex justify-between items-center py-1 px-2 rounded bg-slate-50 text-[11px]">
                              <span className="text-secondaryText font-mono">{m.roleTag}:</span>
                              <span className="font-semibold text-primaryText">{m.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: DRAW VERSIONS & HISTORY */}
          {activeTab === 'history' && currentEvent && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div>
                  <h3 className="font-display font-bold text-lg text-primaryText">Historical Draw Versions</h3>
                  <p className="text-xs text-secondaryText">Every team generation creates an immutable snapshot accessible anytime.</p>
                </div>
              </div>

              {(currentEvent.drawVersions || []).length === 0 ? (
                <div className="py-12 text-center bg-white rounded-2xl border border-border">
                  <History size={24} className="text-secondaryText mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-secondaryText">No draws generated yet for this event.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...(currentEvent.drawVersions || [])].reverse().map((draw) => (
                    <div key={draw.drawId} className="p-5 rounded-2xl bg-white border border-border shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/70 text-xs font-mono">
                          <span className="text-accent font-bold">VERSION {draw.version}</span>
                          <span className="text-secondaryText">{new Date(draw.generatedAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-display font-bold text-base text-primaryText mb-1">{draw.title}</h4>
                        <p className="text-xs text-secondaryText mb-4">
                          {draw.totalTeams} complete teams ({draw.totalParticipants} members)
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border/70 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleExportPDF(draw)}
                          className="flex-1 px-3 py-2 rounded-lg bg-accent-subtle hover:bg-accent-subtle/80 text-accent font-semibold text-xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Download size={13} />
                          <span>Official PDF</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: AUDIT TRAIL */}
          {activeTab === 'audit' && currentEvent && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-border p-6 shadow-xs">
                <h3 className="font-display font-bold text-lg text-primaryText mb-1">Administrative Audit Log</h3>
                <p className="text-xs text-secondaryText mb-6">
                  Chronological record of state transitions, participant imports, and team generation operations.
                </p>

                <div className="space-y-3">
                  {[...(currentEvent.auditLogs || [])].reverse().map((log, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-mono text-[10px] font-bold uppercase text-accent mr-2">
                          {log.action}
                        </span>
                        <span className="text-primaryText font-medium">{log.details}</span>
                      </div>
                      <div className="text-[11px] font-mono text-secondaryText shrink-0">
                        <span>{log.userEmail} · {new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CREATE EVENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-md w-full p-6 shadow-lg">
            <h3 className="font-display font-bold text-lg text-primaryText mb-1">Create New Event</h3>
            <p className="text-xs text-secondaryText mb-4">Set up an independent event with its own participants and rules.</p>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Hackathon Winter 2027"
                  value={newEventForm.name}
                  onChange={(e) => setNewEventForm({ ...newEventForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Event purpose, rules, and participant criteria..."
                  value={newEventForm.description}
                  onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newEventForm.startDate}
                    onChange={(e) => setNewEventForm({ ...newEventForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    value={newEventForm.endDate}
                    onChange={(e) => setNewEventForm({ ...newEventForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent-hover cursor-pointer"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PARTICIPANT MODAL */}
      {showAddPartModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-md w-full p-6 shadow-lg">
            <h3 className="font-display font-bold text-lg text-primaryText mb-1">Add Participant</h3>
            <form onSubmit={handleAddParticipant} className="space-y-3 text-xs mt-4">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Participant Name"
                  value={newPartForm.name}
                  onChange={(e) => setNewPartForm({ ...newPartForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  required
                  value={newPartForm.categoryId}
                  onChange={(e) => setNewPartForm({ ...newPartForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none bg-white"
                >
                  <option value="">Select Category...</option>
                  {currentEvent?.categories?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="participant@example.com"
                  value={newPartForm.email}
                  onChange={(e) => setNewPartForm({ ...newPartForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPartModal(false)}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent-hover cursor-pointer"
                >
                  Add Participant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {showBulkPartModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-lg w-full p-6 shadow-lg">
            <h3 className="font-display font-bold text-lg text-primaryText mb-1">Bulk Import Participants</h3>
            <p className="text-xs text-secondaryText mb-3">
              Paste lines in CSV format: <code className="bg-slate-100 px-1 py-0.5 rounded">Name, CategoryId, Email</code>
            </p>

            <textarea
              rows={8}
              placeholder={`Aarav Sharma, cat_second_year, aarav@hackathon.edu\nDiya Patel, cat_first_year, diya@hackathon.edu`}
              value={bulkPartText}
              onChange={(e) => setBulkPartText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkPartModal(false)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent-hover cursor-pointer"
              >
                Import All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-md w-full p-6 shadow-lg">
            <h3 className="font-display font-bold text-lg text-primaryText mb-1">Add Dynamic Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-3 text-xs mt-4">
              <div>
                <label className="block font-semibold mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Developer, UI Designer, Judge"
                  value={newCatForm.name}
                  onChange={(e) => setNewCatForm({ ...newCatForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Assigned Team Role Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Engineer, Visual Designer"
                  value={newCatForm.roleTag}
                  onChange={(e) => setNewCatForm({ ...newCatForm, roleTag: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Quota per Team</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={newCatForm.countPerTeam}
                  onChange={(e) => setNewCatForm({ ...newCatForm, countPerTeam: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="uniqueMentorCheck"
                  checked={newCatForm.isUniqueMentor}
                  onChange={(e) => setNewCatForm({ ...newCatForm, isUniqueMentor: e.target.checked })}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <label htmlFor="uniqueMentorCheck" className="text-xs text-primaryText">
                  Strict 1:1 Unique Rule (Never shared across teams)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent-hover cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM ACTION MODAL */}
      {showConfirmAction === 'generate' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border max-w-md w-full p-6 shadow-lg text-center">
            <div className="w-12 h-12 rounded-2xl bg-accent-subtle text-accent flex items-center justify-center mx-auto mb-3">
              <Sparkles size={24} />
            </div>
            <h3 className="font-display font-bold text-lg text-primaryText mb-1">
              Confirm Server Team Formation
            </h3>
            <p className="text-xs text-secondaryText leading-relaxed mb-6">
              This will execute team generation on the authoritative server and create an immutable draw record in MongoDB Atlas. Previous draw versions will remain safely preserved in history.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmAction(null)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateTeams}
                className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold cursor-pointer"
              >
                Yes, Form Teams
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="py-4 border-t border-border/70 text-center text-xs text-secondaryText">
        <div className="app-container flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Hackathon Event Portal · Multi-Event Control System</span>
          <span className="font-mono text-[11px] text-secondaryText/60">
            Immutable Historical Integrity Enforced
          </span>
        </div>
      </footer>
    </div>
  );
}
