'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Users,
  Shield,
  Layers,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Sliders,
  Check
} from 'lucide-react';
import { eventsApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function TeamFormationView({ currentEvent, onRefresh, onNavigate }) {
  const { showToast } = useToast();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lastGeneratedDraw, setLastGeneratedDraw] = useState(null);

  if (!currentEvent) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200/80 p-12 text-center shadow-sm">
        <Sparkles className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-neutral-900">No Event Selected</h3>
        <p className="text-sm text-neutral-500 mt-1">Please select an event to run team formation.</p>
      </div>
    );
  }

  const participants = currentEvent.participants || [];
  const activeParticipants = participants.filter((p) => p.status !== 'INACTIVE');
  const inactiveCount = participants.length - activeParticipants.length;
  const categories = currentEvent.categories || [];
  const rules = currentEvent.rules || { totalTeams: 1, teamSize: 4, composition: [] };
  const requestedTeams = rules.totalTeams || 1;

  // Feasibility calculation
  const countsPerCategory = activeParticipants.reduce((acc, p) => {
    acc[p.categoryId] = (acc[p.categoryId] || 0) + 1;
    return acc;
  }, {});

  let maxFeasible = Infinity;
  let bottleneck = null;
  const compositionBreakdown = (rules.composition || []).map((comp) => {
    const cat = categories.find((c) => c.id === comp.categoryId);
    const available = countsPerCategory[comp.categoryId] || 0;
    const requiredTotal = comp.count * requestedTeams;
    const possible = comp.count > 0 ? Math.floor(available / comp.count) : Infinity;

    if (possible < maxFeasible) {
      maxFeasible = possible;
      bottleneck = cat?.name || comp.categoryId;
    }

    return {
      name: cat?.name || comp.categoryId,
      roleTag: comp.roleTag,
      countPerTeam: comp.count,
      available,
      requiredTotal,
      possible
    };
  });

  if (maxFeasible === Infinity) maxFeasible = 0;
  const isFeasible = requestedTeams > 0 && requestedTeams <= maxFeasible;
  const totalAssigned = (rules.teamSize || 4) * requestedTeams;
  const unassignedEst = Math.max(0, activeParticipants.length - totalAssigned);

  const handleGenerate = async () => {
    setGenerating(true);
    setShowConfirmModal(false);

    try {
      const res = await eventsApi.generate(currentEvent.eventId);
      if (res.success) {
        setLastGeneratedDraw(res.draw);
        showToast(
          `Successfully generated ${res.draw.teams?.length || 0} teams for version ${res.draw.versionNumber}!`,
          'success'
        );
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Team generation failed', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Team Formation Workflow
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Validate roster eligibility, verify composition rules, and generate balanced teams for {currentEvent.name}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/team-draw?eventId=${currentEvent.eventId}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            Mechanical Reveal Screen
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Success Notification if generated */}
      {lastGeneratedDraw && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  Draw Version {lastGeneratedDraw.versionNumber} Created Successfully
                </h4>
                <p className="text-xs text-emerald-800">
                  Formed {lastGeneratedDraw.teams?.length} teams ({lastGeneratedDraw.unassigned?.length || 0} unassigned).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate && onNavigate('teams')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                View Teams Roster
              </button>
              <Link
                href={`/team-draw?eventId=${currentEvent.eventId}`}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
              >
                Start Split-Flap Reveal
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 8-Step Pre-flight Verification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1 & 2: Event & Participants */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Step 1 & 2 • Roster Check</span>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 rounded-md">
              {currentEvent.status}
            </span>
          </div>
          <h4 className="text-base font-bold text-neutral-900">{currentEvent.name}</h4>
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-2.5 bg-neutral-50 rounded-lg">
              <span className="text-neutral-500 block text-[11px]">Active Participants</span>
              <span className="text-base font-bold text-neutral-900">{activeParticipants.length}</span>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded-lg">
              <span className="text-neutral-500 block text-[11px]">Inactive / Excluded</span>
              <span className="text-base font-bold text-neutral-500">{inactiveCount}</span>
            </div>
          </div>
        </div>

        {/* Step 3 & 4: Rules & Feasibility */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Step 3 & 4 • Rules & Math</span>
            {isFeasible ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Feasible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700">
                <AlertTriangle className="w-3.5 h-3.5" />
                Deficit
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 text-xs text-center">
            <div className="p-2 bg-neutral-50 rounded-lg">
              <span className="text-neutral-400 block text-[10px]">Target Teams</span>
              <span className="text-sm font-bold text-neutral-900">{requestedTeams}</span>
            </div>
            <div className="p-2 bg-neutral-50 rounded-lg">
              <span className="text-neutral-400 block text-[10px]">Team Size</span>
              <span className="text-sm font-bold text-neutral-900">{rules.teamSize || 4}</span>
            </div>
            <div className="p-2 bg-neutral-50 rounded-lg">
              <span className="text-neutral-400 block text-[10px]">Max Feasible</span>
              <span className={`text-sm font-bold ${isFeasible ? 'text-emerald-600' : 'text-red-600'}`}>
                {maxFeasible}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 5: Quota & Demand Review */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Step 5 • Composition Preview</span>
            <h4 className="text-sm font-bold text-neutral-900 mt-0.5">Required Category Allocation per Team</h4>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('rules')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
          >
            <Sliders className="w-3.5 h-3.5" />
            Adjust Rules
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {compositionBreakdown.map((c, i) => (
            <div key={i} className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-neutral-900">{c.name}</span>
                <span className="text-[11px] px-1.5 py-0.2 bg-neutral-200/70 text-neutral-700 rounded">
                  {c.roleTag}
                </span>
              </div>
              <div className="flex justify-between text-neutral-500 text-[11px]">
                <span>Quota / Team:</span>
                <span className="font-semibold text-neutral-800">{c.countPerTeam}</span>
              </div>
              <div className="flex justify-between text-neutral-500 text-[11px]">
                <span>Available / Needed:</span>
                <span className={c.available >= c.requiredTotal ? 'font-semibold text-emerald-700' : 'font-semibold text-red-600'}>
                  {c.available} / {c.requiredTotal}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Expected Assignment Impact */}
        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-semibold text-neutral-900">Total Participants to Assign: </span>
            <span className="font-bold text-indigo-600">{totalAssigned}</span>
            <span className="text-neutral-400 mx-2">•</span>
            <span className="font-semibold text-neutral-900">Remaining Unassigned: </span>
            <span className="font-bold text-neutral-700">{unassignedEst}</span>
          </div>

          {!isFeasible && (
            <p className="text-red-600 font-semibold text-xs flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Deficit in &quot;{bottleneck}&quot;. Cannot form {requestedTeams} complete teams.
            </p>
          )}
        </div>
      </div>

      {/* Step 6, 7 & 8: Confirm & Trigger Button */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-neutral-900">Step 6 & 7 • Authorization & Generation</h4>
          <p className="text-xs text-neutral-500 mt-0.5">
            Generating teams will run the server-side balanced randomizer, create a new draw version, and persist all assignments to MongoDB Atlas.
          </p>
        </div>

        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={!isFeasible || generating}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-md flex items-center gap-2 flex-shrink-0"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating & Persisting...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Teams Now
            </>
          )}
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Sparkles className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-neutral-900">Confirm Team Formation</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  You are about to form <strong className="text-neutral-900">{requestedTeams} teams</strong> for{' '}
                  <strong className="text-neutral-900">{currentEvent.name}</strong>.
                </p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs space-y-1.5 text-neutral-600">
                <div className="flex justify-between">
                  <span>Assigned Members:</span>
                  <span className="font-semibold text-neutral-900">{totalAssigned} participants</span>
                </div>
                <div className="flex justify-between">
                  <span>Unassigned Roster:</span>
                  <span className="font-semibold text-neutral-900">{unassignedEst} participants</span>
                </div>
                <div className="flex justify-between">
                  <span>Persistence:</span>
                  <span className="font-semibold text-emerald-600">MongoDB Atlas (Immutable Snapshot)</span>
                </div>
              </div>

              <p className="text-[11px] text-neutral-400">
                A new Draw Version will be created. Previous versions are retained in the Draw History for auditing.
              </p>
            </div>

            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              >
                Confirm & Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
