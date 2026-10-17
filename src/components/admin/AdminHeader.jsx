'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  ChevronDown,
  Plus,
  Sparkles,
  Users,
  LogOut,
  Shield,
  Layers,
  Calendar,
  ExternalLink
} from 'lucide-react';

export default function AdminHeader({
  activeView,
  events = [],
  currentEvent,
  onSelectEvent,
  onOpenCreateEvent,
  onOpenAddParticipant,
  onOpenGenerateTeams,
  admin,
  onLogout,
  setMobileOpen
}) {
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'events':
        return 'All Events';
      case 'templates':
        return 'Event Templates';
      case 'overview':
        return 'Event Overview';
      case 'participants':
        return 'Participant Roster';
      case 'categories':
        return 'Categories & Roles';
      case 'rules':
        return 'Team Rules & Feasibility';
      case 'teams':
        return 'Formed Teams';
      case 'generate':
        return 'Team Formation';
      case 'history':
        return 'Draw History';
      case 'reports':
        return 'Reports & Exports';
      case 'audit':
        return 'Audit Trail';
      case 'settings':
        return 'Event Settings';
      default:
        return 'Dashboard';
    }
  };

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
    <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-secondaryText hover:text-primaryText hover:bg-slate-100 cursor-pointer"
          aria-label="Open navigation drawer"
        >
          <Menu size={18} />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-secondaryText truncate">
          <span className="font-semibold text-secondaryText/80">Workspace</span>
          <span className="text-secondaryText/40">/</span>
          {currentEvent && activeView !== 'dashboard' && activeView !== 'events' && activeView !== 'templates' ? (
            <>
              <span className="truncate max-w-[120px] sm:max-w-[180px] font-medium text-secondaryText">
                {currentEvent.name}
              </span>
              <span className="text-secondaryText/40">/</span>
            </>
          ) : null}
          <span className="font-bold text-primaryText truncate">{getViewTitle()}</span>
        </nav>
      </div>

      {/* Right: Event Selector, Quick Action & Account Menu */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Event Selector Dropdown */}
        {events.length > 0 && (
          <div className="hidden sm:flex items-center gap-2">
            <div className="relative">
              <select
                value={currentEvent?.eventId || ''}
                onChange={(e) => onSelectEvent(e.target.value)}
                className="appearance-none bg-canvas hover:bg-slate-100 border border-border text-primaryText text-xs font-semibold rounded-lg pl-3 pr-8 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-accent cursor-pointer max-w-[200px] truncate"
                aria-label="Select active event"
              >
                {events.map((evt) => (
                  <option key={evt.eventId} value={evt.eventId}>
                    {evt.name} ({evt.status})
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondaryText pointer-events-none"
              />
            </div>

            {currentEvent && (
              <span
                className={`hidden md:inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getStatusBadge(
                  currentEvent.status
                )}`}
              >
                {currentEvent.status}
              </span>
            )}
          </div>
        )}

        {/* Primary Action Button Contextual to View */}
        {activeView === 'participants' ? (
          <button
            onClick={onOpenAddParticipant}
            className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Add Participant</span>
            <span className="sm:hidden">Add</span>
          </button>
        ) : activeView === 'rules' || activeView === 'teams' ? (
          <button
            onClick={onOpenGenerateTeams}
            className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Sparkles size={14} />
            <span className="hidden sm:inline">Form Teams</span>
            <span className="sm:hidden">Draw</span>
          </button>
        ) : (
          <button
            onClick={onOpenCreateEvent}
            className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New Event</span>
            <span className="sm:hidden">New</span>
          </button>
        )}

        {/* Account Menu */}
        <div className="relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-lg hover:bg-slate-100 border border-transparent hover:border-border transition-colors cursor-pointer"
            aria-expanded={showAccountMenu}
            aria-label="Admin user account options"
          >
            <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-bold text-primaryText block leading-tight">
                {admin?.name || 'Admin'}
              </span>
              <span className="text-[10px] font-mono text-secondaryText block leading-tight">
                {admin?.role || 'ADMIN'}
              </span>
            </div>
            <ChevronDown size={12} className="hidden md:block text-secondaryText" />
          </button>

          {showAccountMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-border shadow-lg p-2 z-50">
              <div className="px-3 py-2 border-b border-border/80 mb-1">
                <p className="text-xs font-bold text-primaryText">{admin?.name || 'Administrator'}</p>
                <p className="text-[11px] font-mono text-secondaryText truncate" title={admin?.email}>
                  {admin?.email}
                </p>
                <span className="inline-block mt-1 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-accent-subtle text-accent border border-accent/20">
                  {admin?.role || 'SUPER_ADMIN'}
                </span>
              </div>

              <Link
                href="/team-draw"
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-secondaryText hover:text-primaryText hover:bg-slate-50 rounded-lg transition-colors"
                target="_blank"
                onClick={() => setShowAccountMenu(false)}
              >
                <ExternalLink size={13} />
                <span>Open Public Portal</span>
              </Link>

              <button
                onClick={() => {
                  setShowAccountMenu(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold transition-colors mt-1 cursor-pointer"
              >
                <LogOut size={13} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
