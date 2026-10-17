'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Users,
  Tags,
  Sliders,
  Sparkles,
  History,
  FileBarChart,
  ScrollText,
  Settings,
  LogOut,
  Plus,
  X,
  ExternalLink
} from 'lucide-react';

export default function AdminSidebar({
  activeTab,
  activeView,
  onNavigate,
  setActiveView,
  currentEvent,
  events = [],
  onOpenCreateEvent,
  onCreateEvent,
  admin,
  onLogout,
  mobileOpen,
  setMobileOpen,
  onCloseMobile
}) {
  const currentKey = activeTab || activeView || 'dashboard';

  const handleNavClick = (viewKey) => {
    if (onNavigate) onNavigate(viewKey);
    if (setActiveView) setActiveView(viewKey);
    if (setMobileOpen) setMobileOpen(false);
    if (onCloseMobile) onCloseMobile();
  };

  const handleCreate = () => {
    if (onOpenCreateEvent) onOpenCreateEvent();
    if (onCreateEvent) onCreateEvent();
    if (setMobileOpen) setMobileOpen(false);
    if (onCloseMobile) onCloseMobile();
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

  const isItemActive = (key) => {
    if (currentKey === key) return true;
    if ((key === 'formation' || key === 'generate') && (currentKey === 'formation' || currentKey === 'generate')) {
      return true;
    }
    return false;
  };

  const navItemClass = (viewKey) => {
    const active = isItemActive(viewKey);
    return `w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
      active
        ? 'bg-[#5557D9] text-white shadow-sm'
        : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
    }`;
  };

  const historyCount = currentEvent?.history?.length || currentEvent?.drawVersions?.length || 0;
  const participantCount = currentEvent?.participants?.length || 0;
  const categoryCount = currentEvent?.categories?.length || 0;

  const content = (
    <div className="h-full flex flex-col justify-between bg-white border-r border-neutral-200 select-none shadow-sm">
      {/* Top Branding */}
      <div>
        <div className="p-4 sm:p-5 border-b border-neutral-200/80 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5557D9] animate-pulse" />
            <div>
              <span className="font-bold text-sm tracking-tight text-neutral-900 group-hover:text-[#5557D9] transition-colors block">
                EVENT GOVERNANCE
              </span>
              <span className="text-[10px] font-mono font-medium text-neutral-500 tracking-wider block">
                MULTI-EVENT PORTAL
              </span>
            </div>
          </Link>

          {(setMobileOpen || onCloseMobile) && (
            <button
              onClick={() => {
                if (setMobileOpen) setMobileOpen(false);
                if (onCloseMobile) onCloseMobile();
              }}
              className="lg:hidden p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-180px)]">
          {/* Group 1: Workspace */}
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 block mb-1.5">
              Workspace
            </span>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => handleNavClick('dashboard')}
                className={navItemClass('dashboard')}
              >
                <span className="flex items-center gap-2.5">
                  <LayoutDashboard size={15} />
                  <span>Dashboard</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('events')}
                className={navItemClass('events')}
              >
                <span className="flex items-center gap-2.5">
                  <Calendar size={15} />
                  <span>All Events</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200">
                  {events.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('templates')}
                className={navItemClass('templates')}
              >
                <span className="flex items-center gap-2.5">
                  <Layers size={15} />
                  <span>Event Templates</span>
                </span>
              </button>
            </div>
          </div>

          {/* Group 2: Current Event */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Current Event
              </span>
              {currentEvent && (
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${getStatusBadge(
                    currentEvent.status
                  )}`}
                >
                  {currentEvent.status}
                </span>
              )}
            </div>

            {currentEvent ? (
              <>
                <div className="px-3 py-2 mb-2 rounded-lg bg-neutral-50 border border-neutral-200">
                  <p className="text-xs font-bold text-neutral-900 truncate mb-0.5" title={currentEvent.name}>
                    {currentEvent.name}
                  </p>
                  <p className="text-[10px] text-neutral-500 truncate">
                    {participantCount} participants · {categoryCount} categories
                  </p>
                </div>

                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => handleNavClick('overview')}
                    className={navItemClass('overview')}
                  >
                    <span className="flex items-center gap-2.5">
                      <LayoutDashboard size={15} />
                      <span>Overview</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('participants')}
                    className={navItemClass('participants')}
                  >
                    <span className="flex items-center gap-2.5">
                      <Users size={15} />
                      <span>Participants</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200">
                      {participantCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('categories')}
                    className={navItemClass('categories')}
                  >
                    <span className="flex items-center gap-2.5">
                      <Tags size={15} />
                      <span>Categories & Roles</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('rules')}
                    className={navItemClass('rules')}
                  >
                    <span className="flex items-center gap-2.5">
                      <Sliders size={15} />
                      <span>Team Rules</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('teams')}
                    className={navItemClass('teams')}
                  >
                    <span className="flex items-center gap-2.5">
                      <Users size={15} />
                      <span>Teams</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('formation')}
                    className={navItemClass('formation')}
                  >
                    <span className="flex items-center gap-2.5">
                      <Sparkles size={15} />
                      <span>Team Formation</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('history')}
                    className={navItemClass('history')}
                  >
                    <span className="flex items-center gap-2.5">
                      <History size={15} />
                      <span>Draw History</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200">
                      {historyCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('reports')}
                    className={navItemClass('reports')}
                  >
                    <span className="flex items-center gap-2.5">
                      <FileBarChart size={15} />
                      <span>Reports & Exports</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('audit')}
                    className={navItemClass('audit')}
                  >
                    <span className="flex items-center gap-2.5">
                      <ScrollText size={15} />
                      <span>Audit Trail</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('settings')}
                    className={navItemClass('settings')}
                  >
                    <span className="flex items-center gap-2.5">
                      <Settings size={15} />
                      <span>Event Settings</span>
                    </span>
                  </button>
                </div>
              </>
            ) : (
              <div className="p-3 rounded-xl bg-neutral-50 border border-dashed border-neutral-200 text-center">
                <p className="text-xs text-neutral-500 mb-2">No event selected</p>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="w-full py-1.5 px-3 rounded-lg bg-[#5557D9] hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <Plus size={13} />
                  <span>Create Event</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Account & Footer */}
      <div className="p-3 border-t border-neutral-200 bg-white space-y-2">
        <Link
          href={`/team-draw${currentEvent ? `?eventId=${currentEvent.eventId}` : ''}`}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#5557D9] bg-indigo-50 hover:bg-indigo-100 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="flex items-center gap-2">
            <Sparkles size={14} />
            <span>Open Live Draw Portal</span>
          </span>
          <ExternalLink size={12} />
        </Link>

        <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 border border-neutral-200">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-[#5557D9] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {admin?.name?.charAt(0) || admin?.email?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-neutral-900 truncate">
                {admin?.name || 'Obaid Shaikh (Admin)'}
              </p>
              <p className="text-[10px] text-neutral-500 truncate" title={admin?.email}>
                {admin?.email || 'obaidullahshaikh07@gmail.com'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 rounded-md text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed 260px) */}
      <aside className="hidden lg:block w-[260px] h-screen fixed left-0 top-0 shrink-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => {
              if (setMobileOpen) setMobileOpen(false);
              if (onCloseMobile) onCloseMobile();
            }}
          />
          <div className="relative w-[280px] max-w-[85vw] h-full z-10 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
