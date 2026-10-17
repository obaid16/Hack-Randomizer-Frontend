'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  Layers,
  Sliders,
  Sparkles,
  History,
  FileText,
  Settings,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  ExternalLink
} from 'lucide-react';

export default function EventOverviewView({ currentEvent, onNavigate, onCreateParticipant }) {
  if (!currentEvent) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200/80 p-12 text-center shadow-sm">
        <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-neutral-900">No Event Selected</h3>
        <p className="text-sm text-neutral-500 mt-1">Please select an event from the top header or create a new one.</p>
      </div>
    );
  }

  const participants = currentEvent.participants || [];
  const activeParticipants = participants.filter((p) => p.status !== 'INACTIVE');
  const categories = currentEvent.categories || [];
  const rules = currentEvent.rules || { totalTeams: 1, teamSize: 4, composition: [] };
  const teams = currentEvent.generatedTeams || [];
  const history = currentEvent.history || [];

  // Feasibility calculation
  const countsPerCategory = activeParticipants.reduce((acc, p) => {
    acc[p.categoryId] = (acc[p.categoryId] || 0) + 1;
    return acc;
  }, {});

  let maxFeasible = Infinity;
  for (const comp of rules.composition || []) {
    const available = countsPerCategory[comp.categoryId] || 0;
    const countReq = Number(comp.count) || 0;
    const possible = countReq > 0 ? Math.floor(available / countReq) : Infinity;
    if (possible < maxFeasible) maxFeasible = possible;
  }
  if (maxFeasible === Infinity) maxFeasible = 0;

  const isFeasible = (rules.totalTeams || 1) > 0 && (rules.totalTeams || 1) <= maxFeasible;

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
      {/* Event Hero Card */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">{currentEvent.name}</h2>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getStatusBadge(
                  currentEvent.status
                )}`}
              >
                {currentEvent.status}
              </span>
            </div>
            {currentEvent.description && (
              <p className="text-sm text-neutral-500 mt-1">{currentEvent.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/team-draw?eventId=${currentEvent.eventId}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Open Live Reveal
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Event Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-neutral-600 pt-1">
          <div>
            <span className="text-neutral-400 block text-[11px]">Event Type</span>
            <span className="font-semibold text-neutral-800 mt-0.5 block">{currentEvent.eventType || 'Hackathon'}</span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px]">Dates</span>
            <span className="font-semibold text-neutral-800 mt-0.5 block">
              {currentEvent.startDate ? new Date(currentEvent.startDate).toLocaleDateString() : 'TBD'} —{' '}
              {currentEvent.endDate ? new Date(currentEvent.endDate).toLocaleDateString() : 'TBD'}
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px]">Venue / Mode</span>
            <span className="font-semibold text-neutral-800 mt-0.5 block truncate">
              {currentEvent.venue || 'Online / Hybrid'}
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px]">Current Draw Version</span>
            <span className="font-semibold text-indigo-600 mt-0.5 block font-mono">
              v{currentEvent.drawVersion || 1} ({history.length} snapshot{history.length === 1 ? '' : 's'})
            </span>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Participants */}
        <div
          onClick={() => onNavigate('participants')}
          className="bg-white rounded-xl border border-neutral-200/80 p-4 shadow-sm hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Active Roster</span>
            <Users className="w-4 h-4 text-neutral-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">{activeParticipants.length}</div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            {participants.length - activeParticipants.length} inactive
          </span>
        </div>

        {/* Categories */}
        <div
          onClick={() => onNavigate('categories')}
          className="bg-white rounded-xl border border-neutral-200/80 p-4 shadow-sm hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Categories</span>
            <Layers className="w-4 h-4 text-neutral-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">{categories.length}</div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Configured roles</span>
        </div>

        {/* Formed Teams */}
        <div
          onClick={() => onNavigate('teams')}
          className="bg-white rounded-xl border border-neutral-200/80 p-4 shadow-sm hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Teams Formed</span>
            <Sparkles className="w-4 h-4 text-neutral-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">{teams.length}</div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Target: {rules.totalTeams || 1} teams
          </span>
        </div>

        {/* Feasibility */}
        <div
          onClick={() => onNavigate('rules')}
          className="bg-white rounded-xl border border-neutral-200/80 p-4 shadow-sm hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Formation Feasibility</span>
            {isFeasible ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div className={`text-2xl font-bold ${isFeasible ? 'text-emerald-600' : 'text-amber-600'}`}>
            {maxFeasible} Teams
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            {isFeasible ? 'Target reachable' : 'Adjust rules or roster'}
          </span>
        </div>
      </div>

      {/* Action Shortcut Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('participants')}
          className="p-5 bg-white rounded-xl border border-neutral-200/80 shadow-sm hover:border-neutral-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-neutral-900">Manage Participants</h4>
            <p className="text-xs text-neutral-500 mt-1">
              Add individual participants, import rosters via CSV, or edit categories.
            </p>
          </div>
          <div className="pt-4 flex items-center text-xs font-semibold text-indigo-600 gap-1">
            Open Participants
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('rules')}
          className="p-5 bg-white rounded-xl border border-neutral-200/80 shadow-sm hover:border-neutral-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Sliders className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-neutral-900">Configure Team Rules</h4>
            <p className="text-xs text-neutral-500 mt-1">
              Set team count, quotas per category, unique mentor constraints, and check math.
            </p>
          </div>
          <div className="pt-4 flex items-center text-xs font-semibold text-indigo-600 gap-1">
            Configure Rules
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('formation')}
          className="p-5 bg-white rounded-xl border border-neutral-200/80 shadow-sm hover:border-neutral-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-neutral-900">Run Team Formation</h4>
            <p className="text-xs text-neutral-500 mt-1">
              Execute verified balanced team draws, view results, and generate immutable snapshots.
            </p>
          </div>
          <div className="pt-4 flex items-center text-xs font-semibold text-indigo-600 gap-1">
            Start Draw
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
