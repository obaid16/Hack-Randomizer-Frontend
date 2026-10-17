'use client';

import { useState, useMemo } from 'react';
import {
  Calendar,
  Users,
  Sparkles,
  Layers,
  History,
  Plus,
  ArrowRight,
  Search,
  ExternalLink,
  Copy,
  Archive,
  CheckCircle2,
  Clock,
  Filter,
  Shield,
  Sliders
} from 'lucide-react';

export default function DashboardHomeView({
  events = [],
  currentEvent,
  onSelectEvent,
  onOpenCreateEvent,
  onNavigate,
  onDuplicateTemplate,
  onArchiveEvent,
  admin
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Time-appropriate greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const name = admin?.name ? admin.name.split(' ')[0] : 'Admin';
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  }, [admin]);

  // Aggregate stats from real backend data
  const stats = useMemo(() => {
    const totalEvents = events.length;
    const activeEvents = events.filter((e) => e.status === 'ACTIVE').length;
    const totalParticipants = events.reduce((sum, e) => sum + (e.participants?.length || 0), 0);
    const totalDraws = events.reduce((sum, e) => sum + (e.drawVersions?.length || 0), 0);
    const totalTeams = events.reduce((sum, e) => {
      const latestDraw = e.drawVersions?.[e.drawVersions.length - 1];
      return sum + (latestDraw?.totalTeams || 0);
    }, 0);

    return {
      totalEvents,
      activeEvents,
      totalParticipants,
      totalTeams,
      totalDraws
    };
  }, [events]);

  // Filtered recent events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchSearch =
        evt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (evt.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || evt.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [events, searchTerm, statusFilter]);

  // Aggregate recent audit logs across events
  const recentActivities = useMemo(() => {
    const logs = [];
    events.forEach((evt) => {
      (evt.auditLogs || []).forEach((log) => {
        logs.push({
          ...log,
          eventName: evt.name,
          eventId: evt.eventId,
          parsedDate: new Date(log.timestamp || log.createdAt || Date.now())
        });
      });
    });
    logs.sort((a, b) => b.parsedDate - a.parsedDate);
    return logs.slice(0, 6);
  }, [events]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'READY':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ARCHIVED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'DRAFT':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* A. Page Heading */}
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent-subtle text-accent text-[11px] font-mono font-bold tracking-wider uppercase mb-2 border border-accent/20">
            <Shield size={12} />
            <span>OPERATIONAL CONTROL CONSOLE</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-primaryText tracking-tight">
            {greeting}
          </h1>
          <p className="text-secondaryText text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Manage your events, participants, team formation, and results from one unified governance workspace.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCreateEvent}
            className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* B. Summary Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-border p-4 shadow-2xs">
          <div className="flex items-center justify-between text-secondaryText mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Total Events</span>
            <Calendar size={15} className="text-accent" />
          </div>
          <p className="font-display font-black text-2xl text-primaryText">{stats.totalEvents}</p>
          <span className="text-[10px] text-secondaryText/70 mt-1 block">Configured portals</span>
        </div>

        <div className="bg-white rounded-xl border border-border p-4 shadow-2xs">
          <div className="flex items-center justify-between text-secondaryText mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Active Events</span>
            <CheckCircle2 size={15} className="text-emerald-600" />
          </div>
          <p className="font-display font-black text-2xl text-emerald-600">{stats.activeEvents}</p>
          <span className="text-[10px] text-secondaryText/70 mt-1 block">Live & formation ready</span>
        </div>

        <div className="bg-white rounded-xl border border-border p-4 shadow-2xs">
          <div className="flex items-center justify-between text-secondaryText mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Participants</span>
            <Users size={15} className="text-indigo-600" />
          </div>
          <p className="font-display font-black text-2xl text-primaryText">{stats.totalParticipants}</p>
          <span className="text-[10px] text-secondaryText/70 mt-1 block">Across all rosters</span>
        </div>

        <div className="bg-white rounded-xl border border-border p-4 shadow-2xs">
          <div className="flex items-center justify-between text-secondaryText mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Teams Formed</span>
            <Sparkles size={15} className="text-amber-600" />
          </div>
          <p className="font-display font-black text-2xl text-primaryText">{stats.totalTeams}</p>
          <span className="text-[10px] text-secondaryText/70 mt-1 block">Across finalized draws</span>
        </div>

        <div className="bg-white rounded-xl border border-border p-4 shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-secondaryText mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Draw Versions</span>
            <History size={15} className="text-blue-600" />
          </div>
          <p className="font-display font-black text-2xl text-primaryText">{stats.totalDraws}</p>
          <span className="text-[10px] text-secondaryText/70 mt-1 block">Immutable saved records</span>
        </div>
      </div>

      {/* C & D. Main Two-Column Section: Recent Events & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Recent Events Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="p-5 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-base text-primaryText">Recent Events</h2>
              <p className="text-xs text-secondaryText">Manage and monitor your active and draft events</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondaryText" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 pr-3 py-1.5 rounded-lg border border-border bg-canvas text-xs focus:outline-hidden focus:ring-1 focus:ring-accent w-[150px] sm:w-[180px]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-border bg-canvas text-xs font-semibold text-secondaryText cursor-pointer focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="READY">Ready</option>
                <option value="DRAFT">Draft</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar size={32} className="mx-auto text-secondaryText/40 mb-3" />
              <p className="text-sm font-bold text-primaryText mb-1">No events match your criteria</p>
              <p className="text-xs text-secondaryText max-w-sm mx-auto mb-4">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Try adjusting your search terms or status filter.'
                  : 'Get started by creating your very first event portal.'}
              </p>
              <button
                onClick={onOpenCreateEvent}
                className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-hover inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Create New Event</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-canvas border-b border-border/80 text-secondaryText font-mono uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 font-bold">Event Name</th>
                    <th className="py-3 px-3 font-bold">Status</th>
                    <th className="py-3 px-3 font-bold text-center">Participants</th>
                    <th className="py-3 px-3 font-bold text-center">Teams (Req/Gen)</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredEvents.map((evt) => {
                    const isSelected = currentEvent?.eventId === evt.eventId;
                    const latestDraw = evt.drawVersions?.[evt.drawVersions.length - 1];
                    const generatedCount = latestDraw?.totalTeams || 0;

                    return (
                      <tr
                        key={evt.eventId}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          isSelected ? 'bg-accent-subtle/20' : ''
                        }`}
                        onClick={() => {
                          onSelectEvent(evt.eventId);
                          onNavigate('overview');
                        }}
                      >
                        <td className="py-3 px-4 font-medium text-primaryText">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs truncate max-w-[180px] sm:max-w-[240px]">
                              {evt.name}
                            </span>
                            {isSelected && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-accent text-white font-bold shrink-0">
                                SELECTED
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-secondaryText block truncate max-w-[260px]">
                            {evt.description || 'No description provided'}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getStatusBadge(
                              evt.status
                            )}`}
                          >
                            {evt.status}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-bold">
                          {evt.participants?.length || 0}
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-secondaryText">
                          <span className="text-primaryText font-bold">{evt.rules?.requestedTeams || 0}</span>
                          <span className="mx-1">/</span>
                          <span className={generatedCount > 0 ? 'text-emerald-600 font-bold' : ''}>
                            {generatedCount}
                          </span>
                        </td>

                        <td
                          className="py-3 px-4 text-right space-x-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              onSelectEvent(evt.eventId);
                              onNavigate('overview');
                            }}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold text-accent hover:bg-accent-subtle transition-colors cursor-pointer"
                          >
                            Open
                          </button>

                          <button
                            onClick={() => onDuplicateTemplate(evt.eventId)}
                            className="p-1 rounded-md text-secondaryText hover:text-primaryText hover:bg-slate-100 transition-colors inline-block"
                            title="Duplicate as Template"
                          >
                            <Copy size={13} />
                          </button>

                          {evt.status !== 'ARCHIVED' && (
                            <button
                              onClick={() => onArchiveEvent(evt.eventId)}
                              className="p-1 rounded-md text-secondaryText hover:text-amber-700 hover:bg-amber-50 transition-colors inline-block"
                              title="Archive Event"
                            >
                              <Archive size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Quick Actions & Recent Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-xs">
            <h3 className="font-display font-bold text-sm text-primaryText mb-1">Quick Operational Actions</h3>
            <p className="text-xs text-secondaryText mb-4">Direct shortcuts to event governance tools</p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenCreateEvent}
                className="p-3 rounded-xl bg-canvas hover:bg-slate-100 border border-border text-left transition-colors cursor-pointer group"
              >
                <Plus size={16} className="text-accent mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-primaryText block">Create Event</span>
                <span className="text-[10px] text-secondaryText">New portal</span>
              </button>

              <button
                onClick={() => onNavigate('participants')}
                className="p-3 rounded-xl bg-canvas hover:bg-slate-100 border border-border text-left transition-colors cursor-pointer group"
              >
                <Users size={16} className="text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-primaryText block">Roster</span>
                <span className="text-[10px] text-secondaryText">Add/import</span>
              </button>

              <button
                onClick={() => onNavigate('categories')}
                className="p-3 rounded-xl bg-canvas hover:bg-slate-100 border border-border text-left transition-colors cursor-pointer group"
              >
                <Sliders size={16} className="text-amber-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-primaryText block">Categories</span>
                <span className="text-[10px] text-secondaryText">Roles & rules</span>
              </button>

              <button
                onClick={() => onNavigate('generate')}
                className="p-3 rounded-xl bg-accent-subtle/50 hover:bg-accent-subtle border border-accent/20 text-left transition-colors cursor-pointer group"
              >
                <Sparkles size={16} className="text-accent mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-accent block">Form Teams</span>
                <span className="text-[10px] text-accent/80">Execute draw</span>
              </button>
            </div>
          </div>

          {/* Recent Audit Activity */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display font-bold text-sm text-primaryText">Audit Trail Activity</h3>
                <p className="text-xs text-secondaryText">Verified administrative actions</p>
              </div>
              <button
                onClick={() => onNavigate('audit')}
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <ArrowRight size={11} />
              </button>
            </div>

            {recentActivities.length === 0 ? (
              <p className="text-xs text-secondaryText py-4 text-center">No recorded activity yet.</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs pb-2.5 border-b border-border/40 last:border-0 last:pb-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                    <div className="overflow-hidden flex-1">
                      <p className="font-semibold text-primaryText truncate">{log.details || log.action}</p>
                      <div className="flex items-center gap-2 text-[10px] text-secondaryText/70 mt-0.5 font-mono">
                        <span className="truncate max-w-[120px]">{log.eventName}</span>
                        <span>•</span>
                        <span>{log.userEmail || 'Admin'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
