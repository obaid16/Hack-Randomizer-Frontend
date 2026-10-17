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
  activeTab,
  activeView,
  events = [],
  currentEvent,
  selectedEventId,
  onSelectEvent,
  onOpenCreateEvent,
  onCreateEvent,
  onOpenAddParticipant,
  onOpenGenerateTeams,
  onHeaderAction,
  admin,
  onLogout,
  onOpenProfile,
  mobileOpen,
  setMobileOpen,
  onOpenMobileNav
}) {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const currentKey = activeTab || activeView || 'dashboard';

  const getViewTitle = () => {
    switch (currentKey) {
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
      case 'formation':
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
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
      case 'DRAFT':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const handleOpenDrawer = () => {
    if (setMobileOpen) setMobileOpen(true);
    if (onOpenMobileNav) onOpenMobileNav();
  };

  const handlePrimaryAction = () => {
    if (currentKey === 'participants' && onOpenAddParticipant) {
      onOpenAddParticipant();
    } else if ((currentKey === 'rules' || currentKey === 'teams') && onOpenGenerateTeams) {
      onOpenGenerateTeams();
    } else if (onHeaderAction) {
      onHeaderAction();
    } else if (onOpenCreateEvent) {
      onOpenCreateEvent();
    } else if (onCreateEvent) {
      onCreateEvent();
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-2xs">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          type="button"
          onClick={handleOpenDrawer}
          className="lg:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
          aria-label="Open navigation drawer"
        >
          <Menu size={18} />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500 truncate">
          <span className="font-semibold text-neutral-600">Workspace</span>
          <span className="text-neutral-300">/</span>
          {currentEvent && currentKey !== 'dashboard' && currentKey !== 'events' && currentKey !== 'templates' ? (
            <>
              <span className="truncate max-w-[120px] sm:max-w-[180px] font-medium text-neutral-600">
                {currentEvent.name}
              </span>
              <span className="text-neutral-300">/</span>
            </>
          ) : null}
          <span className="font-bold text-neutral-900 truncate">{getViewTitle()}</span>
        </nav>
      </div>

      {/* Right: Event Selector, Quick Action & Account Menu */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Event Selector Dropdown */}
        {events.length > 0 && (
          <div className="hidden sm:flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedEventId || currentEvent?.eventId || ''}
                onChange={(e) => onSelectEvent && onSelectEvent(e.target.value)}
                className="appearance-none bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#5557D9]/20 focus:border-[#5557D9] cursor-pointer max-w-[210px] truncate shadow-2xs"
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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
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
        <button
          type="button"
          onClick={handlePrimaryAction}
          className="px-3 py-1.5 rounded-lg bg-[#5557D9] hover:bg-indigo-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          {currentKey === 'participants' ? (
            <>
              <Plus size={14} />
              <span className="hidden sm:inline">Add Participant</span>
              <span className="sm:hidden">Add</span>
            </>
          ) : currentKey === 'rules' || currentKey === 'teams' ? (
            <>
              <Sparkles size={14} />
              <span className="hidden sm:inline">Form Teams</span>
              <span className="sm:hidden">Draw</span>
            </>
          ) : (
            <>
              <Plus size={14} />
              <span className="hidden sm:inline">New Event</span>
              <span className="sm:hidden">New</span>
            </>
          )}
        </button>

        {/* Account Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-lg hover:bg-neutral-100 border border-transparent hover:border-neutral-200 transition-colors cursor-pointer"
            aria-expanded={showAccountMenu}
            aria-label="Admin user account options"
          >
            <div className="w-7 h-7 rounded-full bg-[#5557D9] text-white flex items-center justify-center font-bold text-xs">
              {admin?.name?.charAt(0) || admin?.email?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-bold text-neutral-900 block leading-tight">
                {admin?.name || 'Obaid Shaikh (Admin)'}
              </span>
              <span className="text-[10px] font-mono text-neutral-500 block leading-tight">
                {admin?.role || 'ADMIN'}
              </span>
            </div>
            <ChevronDown size={12} className="hidden md:block text-neutral-400" />
          </button>

          {showAccountMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-neutral-200 shadow-xl p-2 z-50 animate-in fade-in duration-100">
              <div className="px-3 py-2 border-b border-neutral-100 mb-1">
                <p className="text-xs font-bold text-neutral-900">{admin?.name || 'Super Administrator'}</p>
                <p className="text-[11px] font-mono text-neutral-500 truncate" title={admin?.email}>
                  {admin?.email || 'obaidullahshaikh07@gmail.com'}
                </p>
                <span className="inline-block mt-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {admin?.role || 'SUPER_ADMIN'}
                </span>
              </div>

              {onOpenProfile && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAccountMenu(false);
                    onOpenProfile();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors text-left"
                >
                  <Shield size={13} />
                  <span>Admin Profile</span>
                </button>
              )}

              <Link
                href="/team-draw"
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
                target="_blank"
                onClick={() => setShowAccountMenu(false)}
              >
                <ExternalLink size={13} />
                <span>Open Public Portal</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setShowAccountMenu(false);
                  if (onLogout) onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors mt-1 cursor-pointer"
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
