'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { ACADEMIC_YEARS, STATUS } from '@/lib/constants';

const studentSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(120, 'Full name cannot exceed 120 characters'),
  studentId: z
    .string()
    .min(2, 'Student ID must be at least 2 characters')
    .max(50, 'Student ID cannot exceed 50 characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  academicYear: z.enum([ACADEMIC_YEARS.FIRST_YEAR, ACADEMIC_YEARS.SECOND_YEAR], {
    errorMap: () => ({ message: 'Please select an academic year' })
  }),
  department: z.string().optional(),
  skills: z.string().optional(),
  status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE])
});

export default function StudentModal({ isOpen, onClose, onSave, student = null }) {
  const isEditing = Boolean(student);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      fullName: '',
      studentId: '',
      email: '',
      academicYear: ACADEMIC_YEARS.FIRST_YEAR,
      department: '',
      skills: '',
      status: STATUS.ACTIVE
    }
  });

  useEffect(() => {
    if (student) {
      reset({
        fullName: student.fullName || '',
        studentId: student.studentId || '',
        email: student.email || '',
        academicYear: student.academicYear || ACADEMIC_YEARS.FIRST_YEAR,
        department: student.department || '',
        skills: Array.isArray(student.skills) ? student.skills.join(', ') : '',
        status: student.status || STATUS.ACTIVE
      });
    } else {
      reset({
        fullName: '',
        studentId: '',
        email: '',
        academicYear: ACADEMIC_YEARS.FIRST_YEAR,
        department: '',
        skills: '',
        status: STATUS.ACTIVE
      });
    }
  }, [student, isOpen, reset]);

  const onSubmit = async (data) => {
    const payload = {
      fullName: data.fullName.trim(),
      studentId: data.studentId.trim().toUpperCase(),
      email: data.email?.trim() ? data.email.trim().toLowerCase() : null,
      academicYear: data.academicYear,
      department: data.department?.trim() || '',
      skills: data.skills
        ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      status: data.status
    };

    await onSave(payload, student?._id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Student Profile' : 'Add New Student'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Student'}
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
            placeholder="e.g. Aryan Nair"
          />
          {errors.fullName && (
            <p className="text-xs text-rose-600 mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Student ID & Academic Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Student ID *
            </label>
            <input
              type="text"
              {...register('studentId')}
              className="w-full bg-white border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-lg py-2 px-3 text-sm text-slate-900 font-mono uppercase outline-none"
              placeholder="e.g. FY-CS-101"
            />
            {errors.studentId && (
              <p className="text-xs text-rose-600 mt-1">{errors.studentId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Academic Year *
            </label>
            <select
              {...register('academicYear')}
              className="w-full bg-white border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-lg py-2 px-3 text-sm text-slate-900 outline-none"
            >
              <option value={ACADEMIC_YEARS.FIRST_YEAR}>First Year (1st Year)</option>
              <option value={ACADEMIC_YEARS.SECOND_YEAR}>Second Year (2nd Year)</option>
            </select>
            {errors.academicYear && (
              <p className="text-xs text-rose-600 mt-1">{errors.academicYear.message}</p>
            )}
          </div>
        </div>

        {/* Email & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address (Optional)
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full bg-white border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-lg py-2 px-3 text-sm text-slate-900 outline-none"
              placeholder="student@college.edu"
            />
            {errors.email && (
              <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department
            </label>
            <input
              type="text"
              {...register('department')}
              className="w-full bg-white border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-lg py-2 px-3 text-sm text-slate-900 outline-none"
              placeholder="e.g. Computer Science"
            />
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Technical Skills (Comma-separated)
          </label>
          <input
            type="text"
            {...register('skills')}
            className="w-full bg-white border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-lg py-2 px-3 text-sm text-slate-900 outline-none"
            placeholder="e.g. React, Node.js, Python, UI/UX"
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
            <option value={STATUS.ACTIVE}>Active (Eligible for generation)</option>
            <option value={STATUS.INACTIVE}>Inactive</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}
