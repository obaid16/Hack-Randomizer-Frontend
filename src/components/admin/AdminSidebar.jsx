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
  Shield,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function AdminSidebar({
  activeView,
  setActiveView,
  currentEvent,
  events = [],
  onOpenCreateEvent,
  admin,
  onLogout,
  mobileOpen,
  setMobileOpen
}) {
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

  const navItemClass = (viewKey) => {
    const isActive = activeView === viewKey;
    return `w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
      isActive
        ? 'bg-accent text-white font-semibold shadow-xs'
        : 'text-secondaryText hover:text-primaryText hover:bg-slate-100/80'
    }`;
  };

  const handleNavClick = (viewKey) => {
    setActiveView(viewKey);
    if (setMobileOpen) setMobileOpen(false);
  };

  const content = (
    <div className="h-full flex flex-col justify-between bg-white border-r border-border select-none">
      {/* Top Branding */}
      <div>
        <div className="p-4 sm:p-5 border-b border-border/80 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            <div>
              <span className="font-display font-black text-sm tracking-tight text-primaryText group-hover:text-accent transition-colors block">
                EVENT GOVERNANCE
              </span>
              <span className="text-[10px] font-mono text-secondaryText/70 tracking-wide block">
                MULTI-EVENT PORTAL
              </span>
            </div>
          </Link>

          {setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-secondaryText hover:text-primaryText hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)]">
          {/* Group 1: Workspace */}
          <div>
            <span className="text-[10px] font-mono font-bold text-secondaryText/60 uppercase tracking-wider px-2 block mb-1.5">
              Workspace
            </span>
            <div className="space-y-0.5">
              <button
                onClick={() => handleNavClick('dashboard')}
                className={navItemClass('dashboard')}
              >
                <span className="flex items-center gap-2.5">
                  <LayoutDashboard size={15} />
                  <span>Dashboard</span>
                </span>
              </button>

              <button
                onClick={() => handleNavClick('events')}
                className={navItemClass('events')}
              >
                <span className="flex items-center gap-2.5">
                  <Calendar size={15} />
                  <span>All Events</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-secondaryText border border-border/60">
                  {events.length}
                </span>
              </button>

              <button
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
              <span className="text-[10px] font-mono font-bold text-secondaryText/60 uppercase tracking-wider block">
                Current Event
              </span>
              {currentEvent && (
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${getStatusBadge(
                    currentEvent.status
                  )}`}
                >
                  {currentEvent.status}
                </span>
              )}
            </div>

            {currentEvent ? (
              <>
                <div className="px-2.5 py-2 mb-2 rounded-lg bg-canvas border border-border/80">
                  <p className="text-xs font-bold text-primaryText truncate mb-0.5" title={currentEvent.name}>
                    {currentEvent.name}
                  </p>
                  <p className="text-[10px] font-mono text-secondaryText truncate">
                    {currentEvent.participants?.length || 0} participants · {currentEvent.categories?.length || 0} categories
                  </p>
                </div>

                <div className="space-y-0.5">
                  <button
                    onClick={() => handleNavClick('overview')}
                    className={navItemClass('overview')}
                  >
                    <span className="flex items-center gap-2.5">
                      <LayoutDashboard size={15} />
                      <span>Overview</span>
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavClick('participants')}
                    className={navItemClass('participants')}
                  >
                    <span className="flex items-center gap-2.5">
                      <Users size={15} />
                      <span>Participants</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-secondaryText border border-border/60">
                      {currentEvent.participants?.length || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavClick('categories')}
                    className={navItemClass('categories')}
                  >
                    <span className="flex items-center gap-2.5">
                      <Tags size={15} />
                      <span>Categories & Roles</span>
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavClick('rules')}
                    className={navItemClass('rules')}
                  >
                    <span className="flex items-center gap-2.5">
                      <Sliders size={15} />
                      <span>Team Rules</span>
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavClick('teams')}
                    className={navItemClass('teams')}
                  >
                    <span className="flex items-center gap-2.5">
                      <Users size={15} />
                      <span>Teams</span>
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavClick('generate')}
                    className={navItemClass('generate')}
                  >
                    <span className="flex items-center gap-2.5">
                      <Sparkles size={15} />
                      <span>Team Formation</span>
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavClick('history')}
                    className={navItemClass('history')}
                  >
                    <span className="flex items-center gap-2.5">
                      <History size={15} />
                      <span>Draw History</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-secondaryText border border-border/60">
                      {currentEvent.drawVersions?.length || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavClick('reports')}
                    className={navItemClass('reports')}
                  >
                    <span className="flex items-center gap-2.5">
                      <FileBarChart size={15} />
                      <span>Reports & Exports</span>
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavClick('audit')}
                    className={navItemClass('audit')}
                  >
                    <span className="flex items-center gap-2.5">
                      <ScrollText size={15} />
                      <span>Audit Trail</span>
                    </span>
                  </button>

                  <button
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
              <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-border text-center">
                <p className="text-xs text-secondaryText mb-2">No event selected</p>
                <button
                  onClick={onOpenCreateEvent}
                  className="w-full py-1.5 px-3 rounded-lg bg-accent hover:bg-accent-hover text-white text-[11px] font-bold flex items-center justify-center gap-1.5"
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
      <div className="p-3 border-t border-border/80 bg-white space-y-2">
        <Link
          href="/team-draw"
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-accent bg-accent-subtle/50 hover:bg-accent-subtle transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="flex items-center gap-2">
            <Sparkles size={14} />
            <span>Open Live Draw Portal</span>
          </span>
          <ExternalLink size={12} />
        </Link>

        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-border/60">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs shrink-0">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-primaryText truncate">
                {admin?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-secondaryText truncate" title={admin?.email}>
                {admin?.email || 'admin@hackathon.org'}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-md text-secondaryText hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
      <aside className="hidden lg:block w-[260px] h-screen sticky top-0 shrink-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-[280px] max-w-[85vw] h-full z-10 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
