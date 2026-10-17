'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Users,
  Shield,
  Layers,
  Sparkles,
  Info,
  RefreshCw,
  Save,
  ArrowRight
} from 'lucide-react';
import { eventsApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function TeamRulesView({ currentEvent, onRefresh, onNavigate }) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [requestedTeams, setRequestedTeams] = useState(1);
  const [composition, setComposition] = useState([]);

  // Initialize from current event rules
  useEffect(() => {
    if (currentEvent) {
      setRequestedTeams(currentEvent.rules?.totalTeams || 1);
      const existingComp = currentEvent.rules?.composition || [];
      const cats = currentEvent.categories || [];

      // Map categories to composition rows
      const compRows = cats.map((cat) => {
        const found = existingComp.find((c) => c.categoryId === cat.id);
        return {
          categoryId: cat.id,
          name: cat.name,
          roleTag: cat.roleTag || 'Member',
          count: found ? found.count : (cat.countPerTeam || 1),
          isUniqueMentor: Boolean(cat.isUniqueMentor),
          isActive: cat.isActive !== false
        };
      });
      setComposition(compRows);
    }
  }, [currentEvent]);

  if (!currentEvent) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200/80 p-12 text-center shadow-sm">
        <Sliders className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-neutral-900">No Event Selected</h3>
        <p className="text-sm text-neutral-500 mt-1">Please select an event to configure team formation rules.</p>
      </div>
    );
  }

  const participants = currentEvent.participants || [];
  const activeParticipants = participants.filter((p) => p.status !== 'INACTIVE');

  // Participant counts per category
  const countsPerCategory = useMemo(() => {
    const map = {};
    for (const p of activeParticipants) {
      map[p.categoryId] = (map[p.categoryId] || 0) + 1;
    }
    return map;
  }, [activeParticipants]);

  // Compute live feasibility preview
  const feasibility = useMemo(() => {
    let teamSize = 0;
    let maxFeasible = Infinity;
    const categoryBreakdown = [];
    let bottleneckCategory = null;

    for (const item of composition) {
      if (!item.isActive) continue;
      const countReq = Number(item.count) || 0;
      teamSize += countReq;

      const available = countsPerCategory[item.categoryId] || 0;
      const possibleTeamsForCat = countReq > 0 ? Math.floor(available / countReq) : Infinity;

      if (possibleTeamsForCat < maxFeasible) {
        maxFeasible = possibleTeamsForCat;
        bottleneckCategory = item.name;
      }

      const neededForRequested = countReq * requestedTeams;
      const shortage = Math.max(0, neededForRequested - available);

      categoryBreakdown.push({
        ...item,
        available,
        neededForRequested,
        shortage,
        possibleTeamsForCat
      });
    }

    if (maxFeasible === Infinity) maxFeasible = 0;

    const totalAssignedIfGenerated = teamSize * requestedTeams;
    const totalAvailableActive = activeParticipants.length;
    const unassignedCount = Math.max(0, totalAvailableActive - totalAssignedIfGenerated);

    const isFeasible = requestedTeams > 0 && requestedTeams <= maxFeasible && teamSize > 0;

    return {
      teamSize,
      maxFeasible,
      isFeasible,
      bottleneckCategory,
      totalAssignedIfGenerated,
      totalAvailableActive,
      unassignedCount,
      categoryBreakdown
    };
  }, [composition, countsPerCategory, requestedTeams, activeParticipants]);

  const handleCountChange = (catId, newCount) => {
    setComposition((prev) =>
      prev.map((c) => (c.categoryId === catId ? { ...c, count: Math.max(0, Number(newCount)) } : c))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const sanitizedComp = composition
        .filter((c) => c.isActive)
        .map((c) => ({
          categoryId: c.categoryId,
          count: Number(c.count) || 0,
          roleTag: c.roleTag || 'Member'
        }));

      const teamSize = sanitizedComp.reduce((sum, c) => sum + c.count, 0);

      const res = await eventsApi.update(currentEvent.eventId, {
        rules: {
          ...currentEvent.rules,
          totalTeams: Number(requestedTeams),
          teamSize,
          composition: sanitizedComp
        }
      });

      if (res.success) {
        showToast('Team rules saved successfully', 'success');
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to save rules', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            Team Formation Rules & Feasibility
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Configure how many teams to form and the exact member quota per category.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Rules'}
          </button>
        </div>
      </div>

      {/* Grid: Rules Editor Left, Feasibility Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Rules Setup (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Requested Teams Card */}
          <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Team Count Specification
            </h3>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-semibold text-neutral-700">Target Teams to Form</label>
                <span className="text-neutral-500 font-mono">Max feasible: {feasibility.maxFeasible}</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={requestedTeams}
                  onChange={(e) => setRequestedTeams(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-32 text-base font-semibold border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
                <span className="text-xs text-neutral-500">
                  Total participants required: <strong className="text-neutral-900">{feasibility.teamSize * requestedTeams}</strong> ({feasibility.teamSize} per team)
                </span>
              </div>
            </div>
          </div>

          {/* Team Composition Breakdown */}
          <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Category Composition per Team
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Specify how many participants from each category must be in each team.
                </p>
              </div>
              <span className="px-2 py-1 text-xs font-semibold bg-neutral-100 text-neutral-700 rounded-md">
                Team Size: {feasibility.teamSize}
              </span>
            </div>

            {composition.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4 text-center">No categories found in this event.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {composition.map((item) => (
                  <div key={item.categoryId} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-900">{item.name}</span>
                        <span className="text-[11px] px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                          Role: {item.roleTag}
                        </span>
                        {item.isUniqueMentor && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                            Unique
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-400 block mt-0.5">
                        Available in roster: {countsPerCategory[item.categoryId] || 0} active
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500">Per Team:</span>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={item.count}
                        onChange={(e) => handleCountChange(item.categoryId, e.target.value)}
                        className="w-16 text-center text-sm font-semibold border border-neutral-200 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Feasibility Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm space-y-5 sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Feasibility Preview</h3>
              {feasibility.isFeasible ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Feasible
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200/60">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  Infeasible
                </span>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                <span className="text-[11px] font-medium text-neutral-500 block">Requested Teams</span>
                <span className="text-xl font-bold text-neutral-900">{requestedTeams}</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                <span className="text-[11px] font-medium text-neutral-500 block">Max Feasible</span>
                <span
                  className={`text-xl font-bold ${
                    feasibility.maxFeasible >= requestedTeams ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {feasibility.maxFeasible}
                </span>
              </div>
            </div>

            {/* Category Demand vs Supply */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-700 mb-2">Category Demand vs Supply</h4>
              <div className="space-y-2">
                {feasibility.categoryBreakdown.map((row) => (
                  <div key={row.categoryId} className="p-2.5 rounded-lg border border-neutral-100 bg-neutral-50/50 text-xs">
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-neutral-900">{row.name}</span>
                      <span className={row.shortage > 0 ? 'text-red-600 font-semibold' : 'text-emerald-700'}>
                        {row.available} / {row.neededForRequested} needed
                      </span>
                    </div>
                    {row.shortage > 0 && (
                      <p className="text-[11px] text-red-500 mt-1">
                        Shortage of {row.shortage} participant(s) for {requestedTeams} team(s)
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Roster Impact */}
            <div className="border-t border-neutral-100 pt-3 text-xs space-y-1.5 text-neutral-600">
              <div className="flex justify-between">
                <span>Active Roster:</span>
                <span className="font-semibold text-neutral-900">{feasibility.totalAvailableActive}</span>
              </div>
              <div className="flex justify-between">
                <span>Participants to Assign:</span>
                <span className="font-semibold text-neutral-900">{feasibility.totalAssignedIfGenerated}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Unassigned:</span>
                <span className="font-semibold text-neutral-900">{feasibility.unassignedCount}</span>
              </div>
            </div>

            {/* Action suggestion */}
            {!feasibility.isFeasible && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  Bottleneck Detected
                </p>
                <p>
                  Limited by category <strong>{feasibility.bottleneckCategory}</strong>. Either reduce requested teams to{' '}
                  <strong className="underline cursor-pointer" onClick={() => setRequestedTeams(feasibility.maxFeasible)}>
                    {feasibility.maxFeasible}
                  </strong>{' '}
                  or add more participants to that category.
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => onNavigate && onNavigate('formation')}
                disabled={!feasibility.isFeasible}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                Proceed to Team Formation
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
