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
  Layers,
  MapPin,
  Clock,
  Zap
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

export default function EventWizardModal({ isOpen, onClose, onSuccess, onCreated }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Form State
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    description: '',
    eventType: 'Hackathon',
    startDate: todayStr,
    endDate: todayStr,
    venue: 'Main Campus / Hybrid',
    timezone: 'Asia/Kolkata'
  });

  const [categories, setCategories] = useState([
    { id: 'cat_leader', name: 'Second-Year Student', roleTag: 'Team Leader', countPerTeam: 1, isUniqueMentor: false },
    { id: 'cat_builder', name: 'First-Year Student', roleTag: 'Core Builder', countPerTeam: 2, isUniqueMentor: false },
    { id: 'cat_mentor', name: 'Technical Mentor', roleTag: 'Technical Guide', countPerTeam: 1, isUniqueMentor: true }
  ]);

  const [participantChoice, setParticipantChoice] = useState('manual_after');

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

  const buildPayload = () => {
    const composition = categories.map((c) => ({
      categoryId: c.id,
      count: c.countPerTeam || 1,
      roleTag: c.roleTag || 'Member'
    }));

    const calculatedTeamSize = composition.reduce((acc, c) => acc + c.count, 0) || teamRules.teamSize;

    return {
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
  };

  // Quick Create (Direct from Step 1)
  const handleQuickCreate = async () => {
    if (!validateStep(1)) return;
    setSubmitting(true);
    setError(null);

    try {
      const payload = buildPayload();
      const res = await eventsApi.create(payload);
      if (res.success && res.event) {
        if (onCreated) onCreated(res.event);
        if (onSuccess) onSuccess(res.event);
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

  // Final Wizard Submission
  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(4)) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = buildPayload();
      const res = await eventsApi.create(payload);
      if (res.success && res.event) {
        if (onCreated) onCreated(res.event);
        if (onSuccess) onSuccess(res.event);
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

  const stepsList = [
    { num: 1, label: 'Basic Info' },
    { num: 2, label: 'Categories' },
    { num: 3, label: 'Participants' },
    { num: 4, label: 'Rules' },
    { num: 5, label: 'Review' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-neutral-200 max-w-2xl w-full shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5557D9]" />
              <span className="text-[10px] font-mono font-bold text-[#5557D9] uppercase tracking-wider block">
                STEP {currentStep} OF 5 · {stepsList[currentStep - 1]?.label}
              </span>
            </div>
            <h2 className="font-bold text-base text-neutral-900 mt-0.5">
              {currentStep === 1 && 'Basic Event Information'}
              {currentStep === 2 && 'Define Categories & Roles'}
              {currentStep === 3 && 'Participant Roster Setup'}
              {currentStep === 4 && 'Team Formation Rules'}
              {currentStep === 5 && 'Review & Finalize Event'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Indicator Bar */}
        <div className="bg-neutral-100 flex h-1">
          {stepsList.map((s) => (
            <div
              key={s.num}
              className={`h-full flex-1 transition-all duration-300 ${
                s.num <= currentStep ? 'bg-[#5557D9]' : 'bg-neutral-200'
              }`}
            />
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-red-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between gap-3 text-xs text-indigo-900">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-[#5557D9] shrink-0" />
                  <span>
                    Need to launch quickly? Fill in the event name and click <strong>Quick Create</strong> to use recommended defaults.
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hackathon 2027 · Code & Conquer"
                  value={basicInfo.name}
                  onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-900 focus:ring-2 focus:ring-[#5557D9]/20 focus:border-[#5557D9] focus:outline-none"
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">Event Type</label>
                  <select
                    value={basicInfo.eventType}
                    onChange={(e) => setBasicInfo({ ...basicInfo, eventType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 focus:ring-2 focus:ring-[#5557D9]/20 focus:border-[#5557D9] focus:outline-none cursor-pointer"
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">Venue / Format</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Auditorium / Campus / Virtual"
                    value={basicInfo.venue}
                    onChange={(e) => setBasicInfo({ ...basicInfo, venue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 focus:ring-2 focus:ring-[#5557D9]/20 focus:border-[#5557D9] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Summarize event theme, goals, and team formation requirements..."
                  value={basicInfo.description}
                  onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 focus:ring-2 focus:ring-[#5557D9]/20 focus:border-[#5557D9] focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={basicInfo.startDate}
                    onChange={(e) => setBasicInfo({ ...basicInfo, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 focus:ring-2 focus:ring-[#5557D9]/20 focus:border-[#5557D9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={basicInfo.endDate}
                    onChange={(e) => setBasicInfo({ ...basicInfo, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 focus:ring-2 focus:ring-[#5557D9]/20 focus:border-[#5557D9] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Categories & Roles */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500">
                  Define participant classifications and quota per team for balanced team generation.
                </p>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus size={13} />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="space-y-3">
                {categories.map((cat, idx) => (
                  <div
                    key={cat.id || idx}
                    className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 w-full">
                      <div>
                        <label className="text-[10px] font-semibold text-neutral-500 block mb-0.5">Category Name</label>
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) => handleUpdateCategory(idx, 'name', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-semibold text-neutral-900 focus:outline-none focus:border-[#5557D9]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-neutral-500 block mb-0.5">Role Label</label>
                        <input
                          type="text"
                          value={cat.roleTag}
                          onChange={(e) => handleUpdateCategory(idx, 'roleTag', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 focus:outline-none focus:border-[#5557D9]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-neutral-500 block mb-0.5">Quota / Team</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={cat.countPerTeam}
                          onChange={(e) => handleUpdateCategory(idx, 'countPerTeam', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-[#5557D9]"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(idx)}
                      disabled={categories.length <= 1}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 cursor-pointer self-end sm:self-center transition-colors"
                      title="Remove Category"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Participant Setup Choice */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-500">
                Choose how you want to populate participants into this event after creation.
              </p>

              <div className="space-y-3">
                {[
                  {
                    id: 'manual_after',
                    title: 'Add Participants Manually in Admin Workspace',
                    desc: 'Add individual participant names, emails, and student IDs directly via dashboard modals.'
                  },
                  {
                    id: 'csv_after',
                    title: 'Bulk Import from CSV File',
                    desc: 'Upload a CSV roster with Name, Category, Email, and College ID with automated column validation.'
                  },
                  {
                    id: 'empty',
                    title: 'Start with an Empty Roster',
                    desc: 'Initialize event with categories only; participants can be invited or registered later.'
                  }
                ].map((choice) => (
                  <label
                    key={choice.id}
                    onClick={() => setParticipantChoice(choice.id)}
                    className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      participantChoice === choice.id
                        ? 'border-[#5557D9] bg-indigo-50/50 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="participantChoice"
                      value={choice.id}
                      checked={participantChoice === choice.id}
                      onChange={() => setParticipantChoice(choice.id)}
                      className="mt-0.5 text-[#5557D9] focus:ring-[#5557D9]"
                    />
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">{choice.title}</span>
                      <span className="text-xs text-neutral-500 mt-0.5 block leading-relaxed">{choice.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Team Formation Rules */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-500">
                Specify formation targets and balancing constraints for the automated engine.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <label className="text-xs font-bold text-neutral-900 block mb-1">Target Number of Teams</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={teamRules.requestedTeams}
                    onChange={(e) => setTeamRules({ ...teamRules, requestedTeams: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-base font-bold text-neutral-900 focus:outline-none focus:border-[#5557D9]"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">Default target teams to form.</p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <label className="text-xs font-bold text-neutral-900 block mb-1">Team Size (Calculated)</label>
                  <p className="text-xl font-bold text-[#5557D9] py-1 font-mono">
                    {categories.reduce((acc, c) => acc + (c.countPerTeam || 1), 0)} members / team
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1">Sum of category quotas defined in Step 2.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700">
                  <input
                    type="checkbox"
                    checked={teamRules.uniqueMentor}
                    onChange={(e) => setTeamRules({ ...teamRules, uniqueMentor: e.target.checked })}
                    className="rounded border-neutral-300 text-[#5557D9] focus:ring-[#5557D9]"
                  />
                  <span>
                    <strong className="text-neutral-900">Enforce Unique Mentor Constraint:</strong> Never allow the same mentor to be assigned to multiple teams.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: Review & Finalize */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <span className="text-xs font-bold text-neutral-500">Event Name:</span>
                  <span className="text-sm font-bold text-neutral-900">{basicInfo.name}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <span className="text-xs font-bold text-neutral-500">Event Type:</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-[#5557D9] border border-indigo-100">
                    {basicInfo.eventType}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <span className="text-xs font-bold text-neutral-500">Schedule:</span>
                  <span className="text-xs text-neutral-700 font-mono">
                    {basicInfo.startDate || 'TBD'} to {basicInfo.endDate || 'TBD'}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <span className="text-xs font-bold text-neutral-500">Target Teams:</span>
                  <span className="text-xs font-mono font-bold text-neutral-900">
                    {teamRules.requestedTeams} teams ({categories.reduce((acc, c) => acc + (c.countPerTeam || 1), 0)} members each)
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-neutral-500 block mb-1">Defined Categories:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((c) => (
                      <span key={c.id} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-800">
                        {c.countPerTeam}× {c.name} ({c.roleTag})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-xs text-neutral-500 leading-relaxed">
                Clicking <strong>&quot;Create & Launch Event&quot;</strong> will persist this configuration to MongoDB Atlas and make it immediately active in your administrative workspace.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleQuickCreate}
                disabled={submitting || !basicInfo.name.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-40 transition-colors"
              >
                <Sparkles size={14} />
                <span>Quick Create</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-[#5557D9] hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
              >
                <span>Continue</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 transition-colors"
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
    </div>
  );
}
