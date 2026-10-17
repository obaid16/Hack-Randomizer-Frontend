'use client';

import { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  Users,
  Shield,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react';
import { eventsApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function CategoriesView({ currentEvent, onRefresh }) {
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    roleTag: 'Member',
    countPerTeam: 1,
    isUniqueMentor: false,
    isActive: true,
    description: ''
  });

  if (!currentEvent) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200/80 p-12 text-center shadow-sm">
        <Layers className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-neutral-900">No Event Selected</h3>
        <p className="text-sm text-neutral-500 mt-1">Please select an event to manage categories and role assignments.</p>
      </div>
    );
  }

  const categories = currentEvent.categories || [];
  const participants = currentEvent.participants || [];

  // Compute participant count per category
  const participantCountMap = participants.reduce((acc, p) => {
    acc[p.categoryId] = (acc[p.categoryId] || 0) + 1;
    return acc;
  }, {});

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      roleTag: 'Member',
      countPerTeam: 1,
      isUniqueMentor: false,
      isActive: true,
      description: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      roleTag: cat.roleTag || 'Member',
      countPerTeam: cat.countPerTeam || 1,
      isUniqueMentor: Boolean(cat.isUniqueMentor),
      isActive: cat.isActive !== false,
      description: cat.description || ''
    });
    setShowAddModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      let updatedCategories;
      let updatedComposition = [...(currentEvent.rules?.composition || [])];

      if (editingCategory) {
        // Edit existing
        updatedCategories = categories.map((cat) => {
          if (cat.id === editingCategory.id) {
            return {
              ...cat,
              name: formData.name.trim(),
              roleTag: formData.roleTag.trim(),
              countPerTeam: Number(formData.countPerTeam) || 1,
              isUniqueMentor: Boolean(formData.isUniqueMentor),
              isActive: Boolean(formData.isActive),
              description: formData.description.trim()
            };
          }
          return cat;
        });

        // Update composition rule
        const compIdx = updatedComposition.findIndex((c) => c.categoryId === editingCategory.id);
        if (compIdx >= 0) {
          updatedComposition[compIdx] = {
            ...updatedComposition[compIdx],
            count: Number(formData.countPerTeam) || 1,
            roleTag: formData.roleTag.trim()
          };
        }
      } else {
        // Add new
        const exists = categories.some((c) => c.name.toLowerCase() === formData.name.trim().toLowerCase());
        if (exists) {
          showToast(`A category named "${formData.name.trim()}" already exists`, 'error');
          setSaving(false);
          return;
        }

        const newId = `cat_${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;
        const newCat = {
          id: newId,
          name: formData.name.trim(),
          roleTag: formData.roleTag.trim(),
          countPerTeam: Number(formData.countPerTeam) || 1,
          isUniqueMentor: Boolean(formData.isUniqueMentor),
          isActive: Boolean(formData.isActive),
          description: formData.description.trim()
        };

        updatedCategories = [...categories, newCat];
        updatedComposition.push({
          categoryId: newId,
          count: Number(formData.countPerTeam) || 1,
          roleTag: formData.roleTag.trim()
        });
      }

      const teamSize = updatedComposition.reduce((sum, c) => sum + (Number(c.count) || 0), 0);

      const res = await eventsApi.update(currentEvent.eventId, {
        categories: updatedCategories,
        rules: {
          ...currentEvent.rules,
          teamSize,
          composition: updatedComposition
        }
      });

      if (res.success) {
        showToast(editingCategory ? 'Category updated successfully' : 'Category created successfully', 'success');
        setShowAddModal(false);
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      const updatedCategories = categories.map((c) =>
        c.id === cat.id ? { ...c, isActive: c.isActive === false ? true : false } : c
      );
      const res = await eventsApi.update(currentEvent.eventId, {
        categories: updatedCategories
      });
      if (res.success) {
        showToast(`Category "${cat.name}" is now ${cat.isActive === false ? 'Active' : 'Inactive'}`, 'success');
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update category state', 'error');
    }
  };

  const handleDelete = async (cat) => {
    const assignedCount = participantCountMap[cat.id] || 0;
    if (assignedCount > 0) {
      showToast(
        `Cannot delete "${cat.name}" because ${assignedCount} participant(s) are assigned to it. Deactivate it instead.`,
        'error'
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete category "${cat.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const updatedCategories = categories.filter((c) => c.id !== cat.id);
      const updatedComposition = (currentEvent.rules?.composition || []).filter((c) => c.categoryId !== cat.id);
      const teamSize = updatedComposition.reduce((sum, c) => sum + (Number(c.count) || 0), 0);

      const res = await eventsApi.update(currentEvent.eventId, {
        categories: updatedCategories,
        rules: {
          ...currentEvent.rules,
          teamSize,
          composition: updatedComposition
        }
      });

      if (res.success) {
        showToast(`Category "${cat.name}" deleted`, 'success');
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Categories & Roles
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Define participant classifications, quota per team, and role tags for {currentEvent.name}.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Info Notice */}
      <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 flex items-start gap-3 text-xs text-indigo-900 leading-relaxed">
        <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-indigo-950">How Categories Work in Team Formation</p>
          <p className="mt-0.5 text-indigo-800">
            Each category represents a pool of participants. The <span className="font-medium">Quota per Team</span> determines how many members from this category are placed into each formed team. The <span className="font-medium">Role Tag</span> will be assigned to them inside the team roster (e.g. Mentor, Team Lead, Member).
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200/80 p-12 text-center shadow-sm">
          <Layers className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900">No Categories Defined</h3>
          <p className="text-sm text-neutral-500 mt-1 mb-4">
            Create categories like &quot;Mentor&quot;, &quot;Junior Developer&quot;, or &quot;Designer&quot; to govern team rules.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const count = participantCountMap[cat.id] || 0;
            const isActive = cat.isActive !== false;

            return (
              <div
                key={cat.id}
                className={`bg-white rounded-xl border p-5 transition-all shadow-sm flex flex-col justify-between ${
                  isActive ? 'border-neutral-200 hover:border-neutral-300' : 'border-neutral-200/60 opacity-60 bg-neutral-50/50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold text-neutral-900">{cat.name}</h4>
                        {!isActive && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-neutral-100 text-neutral-600 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[11px] font-medium bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                        Role: {cat.roleTag || 'Member'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleActive(cat)}
                      title={isActive ? 'Deactivate category' : 'Activate category'}
                      className="text-neutral-400 hover:text-neutral-600 p-1"
                    >
                      {isActive ? (
                        <ToggleRight className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-neutral-400" />
                      )}
                    </button>
                  </div>

                  {cat.description && (
                    <p className="text-xs text-neutral-500 mb-4 line-clamp-2">{cat.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 py-3 border-y border-neutral-100 text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[11px]">Assigned Roster</span>
                      <span className="font-semibold text-neutral-800 text-sm flex items-center gap-1 mt-0.5">
                        <Users className="w-3.5 h-3.5 text-neutral-400" />
                        {count} participant{count === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[11px]">Quota / Team</span>
                      <span className="font-semibold text-neutral-800 text-sm flex items-center gap-1 mt-0.5">
                        {cat.countPerTeam || 1} required
                      </span>
                    </div>
                  </div>

                  {cat.isUniqueMentor && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
                      Unique Mentor constraint enabled
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-100 text-xs">
                  <span className="text-[11px] font-mono text-neutral-400 truncate max-w-[120px]">{cat.id}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-neutral-500 hover:text-indigo-600 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 text-base">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. First-Year Student, Senior Developer, Mentor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Role Tag in Team</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead, Developer"
                    value={formData.roleTag}
                    onChange={(e) => setFormData({ ...formData, roleTag: e.target.value })}
                    className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Required / Team</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.countPerTeam}
                    onChange={(e) => setFormData({ ...formData, countPerTeam: Number(e.target.value) })}
                    className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Description (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="Notes about eligibility or responsibilities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700">
                  <input
                    type="checkbox"
                    checked={formData.isUniqueMentor}
                    onChange={(e) => setFormData({ ...formData, isUniqueMentor: e.target.checked })}
                    className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    <span className="font-semibold text-neutral-900">Unique Mentor Constraint:</span> Exactly one
                    unique mentor per team, never duplicated.
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    <span className="font-semibold text-neutral-900">Active Category:</span> Include this category in
                    draws and participant assignment.
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
