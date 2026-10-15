'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { STATUS } from '@/lib/constants';

const mentorSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(120, 'Full name cannot exceed 120 characters'),
  mentorId: z
    .string()
    .min(2, 'Mentor ID must be at least 2 characters')
    .max(50, 'Mentor ID cannot exceed 50 characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  expertise: z.string().optional(),
  status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE])
});

export default function MentorModal({ isOpen, onClose, onSave, mentor = null }) {
  const isEditing = Boolean(mentor);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(mentorSchema),
    defaultValues: {
      fullName: '',
      mentorId: '',
      email: '',
      expertise: '',
      status: STATUS.ACTIVE
    }
  });

  useEffect(() => {
    if (mentor) {
      reset({
        fullName: mentor.fullName || '',
        mentorId: mentor.mentorId || '',
        email: mentor.email || '',
        expertise: Array.isArray(mentor.expertise) ? mentor.expertise.join(', ') : '',
        status: mentor.status || STATUS.ACTIVE
      });
    } else {
      reset({
        fullName: '',
        mentorId: '',
        email: '',
        expertise: '',
        status: STATUS.ACTIVE
      });
    }
  }, [mentor, isOpen, reset]);

  const onSubmit = async (data) => {
    const payload = {
      fullName: data.fullName.trim(),
      mentorId: data.mentorId.trim().toUpperCase(),
      email: data.email?.trim() ? data.email.trim().toLowerCase() : null,
      expertise: data.expertise
        ? data.expertise.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      status: data.status
    };

    await onSave(payload, mentor?._id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Mentor Profile' : 'Add New Mentor'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Mentor'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            {...register('fullName')}
            className="w-full bg-white border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-lg py-2 px-3 text-sm text-slate-900 outline-none"
            placeholder="e.g. Dr. Ramesh Kumar"
          />
          {errors.fullName && (
            <p className="text-xs text-rose-600 mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Mentor ID & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mentor ID *
            </label>
            <input
              type="text"
              {...register('mentorId')}
              className="w-full bg-white border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-lg py-2 px-3 text-sm text-slate-900 font-mono uppercase outline-none"
              placeholder="e.g. MTR-001"
            />
            {errors.mentorId && (
              <p className="text-xs text-rose-600 mt-1">{errors.mentorId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address (Optional)
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full bg-white border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-lg py-2 px-3 text-sm text-slate-900 outline-none"
              placeholder="mentor@college.edu"
            />
            {errors.email && (
              <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Areas of Expertise */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Areas of Expertise (Comma-separated)
          </label>
          <input
            type="text"
            {...register('expertise')}
            className="w-full bg-white border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-lg py-2 px-3 text-sm text-slate-900 outline-none"
            placeholder="e.g. Cloud Computing, AI & ML, Distributed Systems, Web Security"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Status
          </label>
          <select
            {...register('status')}
            className="w-full bg-white border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-lg py-2 px-3 text-sm text-slate-900 outline-none"
          >
            <option value={STATUS.ACTIVE}>Active (Eligible for generations)</option>
            <option value={STATUS.INACTIVE}>Inactive</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}
