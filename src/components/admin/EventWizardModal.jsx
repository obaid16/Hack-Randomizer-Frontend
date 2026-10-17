'use client';

import { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Sparkles,
  Users,
  Sliders,
  Check,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Layers
} from 'lucide-react';
import { eventsApi } from '@/lib/api';

const EVENT_TYPES = [
  'Hackathon',
  'Coding Competition',
  'Workshop',
  'College Technical Event',
  'Student Activity',
  'Custom Event'
];

export default function EventWizardModal({ isOpen, onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    description: '',
    eventType: 'Hackathon',
    startDate: '',
    endDate: '',
    venue: 'Online / Campus',
    timezone: 'Asia/Kolkata'
  });

  const [categories, setCategories] = useState([
    { id: 'cat_leader', name: 'Second-Year Student', roleTag: 'Team Leader', countPerTeam: 1, isUniqueMentor: false },
    { id: 'cat_builder', name: 'First-Year Student', roleTag: 'Core Builder', countPerTeam: 2, isUniqueMentor: false },
    { id: 'cat_mentor', name: 'Technical Mentor', roleTag: 'Technical Guide', countPerTeam: 1, isUniqueMentor: true }
  ]);

  const [participantChoice, setParticipantChoice] = useState('manual_after'); // 'manual_after' | 'csv_after' | 'empty'

  const [teamRules, setTeamRules] = useState({
    requestedTeams: 10,
    teamSize: 4,
    uniqueMentor: true,
    allowParticipantReuse: false
  });

  if (!isOpen) return null;

  // Category helpers
  const handleAddCategory = () => {
    const id = `cat_custom_${Date.now().toString(36)}`;
    setCategories([
      ...categories,
      { id, name: 'New Category', roleTag: 'Member', countPerTeam: 1, isUniqueMentor: false }
    ]);
  };

  const handleUpdateCategory = (idx, field, value) => {
    const updated = [...categories];
    updated[idx] = { ...updated[idx], [field]: value };
    setCategories(updated);
  };

  const handleRemoveCategory = (idx) => {
    if (categories.length <= 1) return;
    setCategories(categories.filter((_, i) => i !== idx));
  };

  // Validation
  const validateStep = (step) => {
    setError(null);
    if (step === 1) {
      if (!basicInfo.name.trim()) {
        setError('Event name is required.');
        return false;
      }
      if (basicInfo.startDate && basicInfo.endDate && basicInfo.startDate > basicInfo.endDate) {
        setError('End date must be on or after start date.');
        return false;
      }
    }
    if (step === 2) {
      if (categories.length === 0) {
        setError('At least one category is required.');
        return false;
      }
      for (const cat of categories) {
        if (!cat.name.trim()) {
          setError('All categories must have a name.');
          return false;
        }
      }
    }
    if (step === 4) {
      if (teamRules.requestedTeams < 1) {
        setError('Desired number of teams must be at least 1.');
        return false;
      }
      if (teamRules.teamSize < 1) {
        setError('Team size must be at least 1.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Final Submission
  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(4)) return;

    setSubmitting(true);
    setError(null);

    const composition = categories.map((c) => ({
      categoryId: c.id,
      count: c.countPerTeam || 1,
      roleTag: c.roleTag || 'Member'
    }));

    const calculatedTeamSize = composition.reduce((acc, c) => acc + c.count, 0) || teamRules.teamSize;

    const payload = {
      name: basicInfo.name.trim(),
      description: basicInfo.description.trim(),
      eventType: basicInfo.eventType,
      venue: basicInfo.venue.trim(),
      timezone: basicInfo.timezone,
      startDate: basicInfo.startDate,
      endDate: basicInfo.endDate,
      status: 'ACTIVE',
      categories,
      rules: {
        teamSize: calculatedTeamSize,
        requestedTeams: Number(teamRules.requestedTeams),
        uniqueMentor: Boolean(teamRules.uniqueMentor),
        allowParticipantReuse: Boolean(teamRules.allowParticipantReuse),
        composition
      }
    };

    try {
      const res = await eventsApi.create(payload);
      if (res.success) {
        onSuccess(res.event);
        onClose();
      } else {
        setError(res.message || 'Failed to create event.');
      }
    } catch (err) {
      setError(err.message || 'Error saving event. Please check your network connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-border max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/80 flex items-center justify-between bg-canvas/60">
          <div>
            <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider block">
              STEP {currentStep} OF 5
            </span>
            <h2 className="font-display font-bold text-base text-primaryText">
              {currentStep === 1 && 'Basic Event Information'}
              {currentStep === 2 && 'Define Categories & Roles'}
              {currentStep === 3 && 'Participant Roster Setup'}
              {currentStep === 4 && 'Team Formation Rules'}
              {currentStep === 5 && 'Review & Finalize Event'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-secondaryText hover:text-primaryText hover:bg-slate-100 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="h-1 bg-slate-100 flex">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-full flex-1 transition-all duration-300 ${
                s <= currentStep ? 'bg-accent' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-6 mb-0 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-primaryText block mb-1">
                  Event Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI Innovation Sprint 2027"
                  value={basicInfo.name}
                  onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-canvas text-xs focus:ring-1 focus:ring-accent focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-primaryText block mb-1">Event Type</label>
                <select
                  value={basicInfo.eventType}
                  onChange={(e) => setBasicInfo({ ...basicInfo, eventType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-canvas text-xs focus:ring-1 focus:ring-accent focus:outline-hidden cursor-pointer"
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-primaryText block mb-1">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Summarize event purpose, targets, and collaboration format..."
                  value={basicInfo.description}
                  onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-canvas text-xs focus:ring-1 focus:ring-accent focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-primaryText block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={basicInfo.startDate}
                    onChange={(e) => setBasicInfo({ ...basicInfo, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-canvas text-xs focus:ring-1 focus:ring-accent focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-primaryText block mb-1">End Date</label>
                  <input
                    type="date"
                    value={basicInfo.endDate}
                    onChange={(e) => setBasicInfo({ ...basicInfo, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-canvas text-xs focus:ring-1 focus:ring-accent focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-primaryText block mb-1">Venue / Format</label>
                <input
                  type="text"
                  placeholder="e.g. Main Auditorium / Virtual Campus"
                  value={basicInfo.venue}
                  onChange={(e) => setBasicInfo({ ...basicInfo, venue: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-canvas text-xs focus:ring-1 focus:ring-accent focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Categories & Roles */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-secondaryText leading-relaxed">
                Define the participant pools and the designated roles they will fulfill on formed teams.
              </p>

              <div className="space-y-3">
                {categories.map((cat, idx) => (
                  <div
                    key={cat.id || idx}
                    className="p-3 rounded-xl bg-canvas border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 w-full">
                      <div>
                        <label className="text-[10px] font-mono text-secondaryText block">Category Name</label>
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) => handleUpdateCategory(idx, 'name', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs font-semibold focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-secondaryText block">Role Label</label>
                        <input
                          type="text"
                          value={cat.roleTag}
                          onChange={(e) => handleUpdateCategory(idx, 'roleTag', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-secondaryText block">Quota / Team</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={cat.countPerTeam}
                          onChange={(e) => handleUpdateCategory(idx, 'countPerTeam', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs font-mono font-bold focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <label className="flex items-center gap-1.5 text-[11px] text-secondaryText cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cat.isUniqueMentor}
                          onChange={(e) => handleUpdateCategory(idx, 'isUniqueMentor', e.target.checked)}
                          className="rounded text-accent focus:ring-0"
                        />
                        <span>Unique 1:1</span>
                      </label>

                      {categories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(idx)}
                          className="p-1.5 text-secondaryText hover:text-rose-600 rounded-md hover:bg-rose-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddCategory}
                className="w-full py-2 border border-dashed border-border text-xs font-bold text-accent hover:bg-accent-subtle/40 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Another Category</span>
              </button>
            </div>
          )}

          {/* STEP 3: Participant Setup */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-secondaryText leading-relaxed">
                Choose how you want to populate your participant roster. You can always add or import more participants later.
              </p>

              <div className="space-y-3">
                <label
                  onClick={() => setParticipantChoice('manual_after')}
                  className={`p-4 rounded-xl border block cursor-pointer transition-colors ${
                    participantChoice === 'manual_after'
                      ? 'border-accent bg-accent-subtle/20'
                      : 'border-border bg-canvas hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-primaryText block">Add participants manually after creation</span>
                      <span className="text-[11px] text-secondaryText">
                        Start with an empty roster and add participants individually or via spreadsheet in the dashboard.
                      </span>
                    </div>
                    {participantChoice === 'manual_after' && <CheckCircle2 size={16} className="text-accent" />}
                  </div>
                </label>

                <label
                  onClick={() => setParticipantChoice('csv_after')}
                  className={`p-4 rounded-xl border block cursor-pointer transition-colors ${
                    participantChoice === 'csv_after'
                      ? 'border-accent bg-accent-subtle/20'
                      : 'border-border bg-canvas hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-primaryText block">Import participants via CSV after creation</span>
                      <span className="text-[11px] text-secondaryText">
                        Use the built-in CSV template to bulk upload students and mentors with validation.
                      </span>
                    </div>
                    {participantChoice === 'csv_after' && <CheckCircle2 size={16} className="text-accent" />}
                  </div>
                </label>

                <label
                  onClick={() => setParticipantChoice('empty')}
                  className={`p-4 rounded-xl border block cursor-pointer transition-colors ${
                    participantChoice === 'empty'
                      ? 'border-accent bg-accent-subtle/20'
                      : 'border-border bg-canvas hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-primaryText block">Start with completely empty configuration</span>
                      <span className="text-[11px] text-secondaryText">
                        Configure rules first and keep the event in DRAFT status until ready.
                      </span>
                    </div>
                    {participantChoice === 'empty' && <CheckCircle2 size={16} className="text-accent" />}
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Team Formation Rules */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-primaryText block mb-1">Desired Number of Teams</label>
                  <input
                    type="number"
                    min={1}
                    value={teamRules.requestedTeams}
                    onChange={(e) => setTeamRules({ ...teamRules, requestedTeams: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-canvas text-xs font-mono font-bold focus:ring-1 focus:ring-accent focus:outline-hidden"
                  />
                  <span className="text-[10px] text-secondaryText mt-0.5 block">
                    Target complete units to generate
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-primaryText block mb-1">Members Per Team</label>
                  <input
                    type="number"
                    min={1}
                    value={categories.reduce((acc, c) => acc + (c.countPerTeam || 1), 0)}
                    readOnly
                    className="w-full px-3 py-2 rounded-xl border border-border bg-slate-100 text-xs font-mono font-bold text-secondaryText cursor-not-allowed"
                  />
                  <span className="text-[10px] text-secondaryText mt-0.5 block">
                    Automatically calculated from category quotas
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-canvas border border-border/80 space-y-2">
                <span className="text-xs font-bold text-primaryText block">Composition Formula Preview:</span>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <span
                      key={c.id}
                      className="px-2.5 py-1 rounded-lg bg-white border border-border text-[11px] font-semibold text-primaryText shadow-2xs"
                    >
                      {c.countPerTeam}× {c.name} ({c.roleTag})
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-xs text-primaryText font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={teamRules.uniqueMentor}
                    onChange={(e) => setTeamRules({ ...teamRules, uniqueMentor: e.target.checked })}
                    className="rounded text-accent focus:ring-0"
                  />
                  <span>Enforce unique mentors (strictly one team per mentor, non-shared)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-primaryText font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={teamRules.allowParticipantReuse}
                    onChange={(e) => setTeamRules({ ...teamRules, allowParticipantReuse: e.target.checked })}
                    className="rounded text-accent focus:ring-0"
                  />
                  <span>Allow participant reuse across multiple teams (default: disabled)</span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-border space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/80">
                  <span className="text-xs font-bold text-secondaryText">Event Name:</span>
                  <span className="text-xs font-bold text-primaryText">{basicInfo.name}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border/80">
                  <span className="text-xs font-bold text-secondaryText">Event Type:</span>
                  <span className="text-xs font-semibold text-primaryText">{basicInfo.eventType}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border/80">
                  <span className="text-xs font-bold text-secondaryText">Dates & Venue:</span>
                  <span className="text-xs text-primaryText">
                    {basicInfo.startDate || 'TBD'} to {basicInfo.endDate || 'TBD'} · {basicInfo.venue}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border/80">
                  <span className="text-xs font-bold text-secondaryText">Target Teams:</span>
                  <span className="text-xs font-mono font-bold text-primaryText">
                    {teamRules.requestedTeams} teams ({categories.reduce((acc, c) => acc + (c.countPerTeam || 1), 0)} members each)
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-secondaryText block mb-1">Defined Categories:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((c) => (
                      <span key={c.id} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-border">
                        {c.countPerTeam}× {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-xs text-secondaryText leading-relaxed">
                Clicking <strong>&quot;Create & Launch Event&quot;</strong> will persist this configuration to MongoDB Atlas and make it immediately active in your administrative workspace.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border/80 flex items-center justify-between bg-canvas/40">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-secondaryText hover:text-primaryText hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <span>Continue</span>
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span>Creating Event...</span>
              ) : (
                <>
                  <Check size={14} />
                  <span>Create & Launch Event</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
