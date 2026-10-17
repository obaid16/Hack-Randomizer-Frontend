'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Trash2,
  AlertTriangle,
  Calendar,
  Layers,
  MapPin,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { eventsApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function EventSettingsView({ currentEvent, onRefresh, onNavigate }) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventType: 'Hackathon',
    startDate: '',
    endDate: '',
    venue: '',
    timezone: 'Asia/Kolkata',
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (currentEvent) {
      setFormData({
        name: currentEvent.name || '',
        description: currentEvent.description || '',
        eventType: currentEvent.eventType || 'Hackathon',
        startDate: currentEvent.startDate ? currentEvent.startDate.split('T')[0] : '',
        endDate: currentEvent.endDate ? currentEvent.endDate.split('T')[0] : '',
        venue: currentEvent.venue || '',
        timezone: currentEvent.timezone || 'Asia/Kolkata',
        status: currentEvent.status || 'ACTIVE'
      });
    }
  }, [currentEvent]);

  if (!currentEvent) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200/80 p-12 text-center shadow-sm">
        <Settings className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-neutral-900">No Event Selected</h3>
        <p className="text-sm text-neutral-500 mt-1">Please select an event to edit its settings.</p>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Event name cannot be empty', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await eventsApi.update(currentEvent.eventId, formData);
      if (res.success) {
        showToast('Event settings updated successfully', 'success');
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update event settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to permanently delete event "${currentEvent.name}"? All participants and draw history will be deleted.`
      )
    ) {
      return;
    }

    try {
      const res = await eventsApi.delete(currentEvent.eventId);
      if (res.success) {
        showToast(`Event "${currentEvent.name}" deleted`, 'success');
        onRefresh();
        onNavigate('dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete event', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Event Settings & Configuration
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Update identity, lifecycle status, scheduling, and venue details for {currentEvent.name}.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Configuration */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900">General Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Event Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Event Type</label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="Hackathon">Hackathon</option>
                <option value="Coding Competition">Coding Competition</option>
                <option value="Workshop">Workshop</option>
                <option value="College Event">College Event</option>
                <option value="Student Activity">Student Activity</option>
                <option value="Custom Event">Custom Event</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
            />
          </div>
        </div>

        {/* Schedule & Venue */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900">Schedule & Location</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Venue or Online Link</label>
              <input
                type="text"
                placeholder="e.g. Campus Auditorium or Zoom Link"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Timezone</label>
              <input
                type="text"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Lifecycle Status */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900">Event Lifecycle Status</h3>
          <p className="text-xs text-neutral-500">
            Control the state of this event. Setting to Completed or Archived preserves records and disables accidental edits.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {['DRAFT', 'READY', 'ACTIVE', 'COMPLETED', 'ARCHIVED'].map((status) => (
              <label
                key={status}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer text-center transition-all ${
                  formData.status === status
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={formData.status === status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="sr-only"
                />
                <span className="text-xs">{status}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-red-50/50 rounded-xl border border-red-200 p-5 shadow-sm mt-8 space-y-3">
        <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          Danger Zone
        </div>
        <p className="text-xs text-red-700">
          Permanently delete this event and all associated participants, category configurations, and draw versions.
        </p>
        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Event Permanently
        </button>
      </div>
    </div>
  );
}
