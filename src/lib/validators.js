import { z } from 'zod';
import { ACADEMIC_YEARS, STATUS } from './constants';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your new password')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword']
  });

export const studentSchema = z.object({
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

export const mentorSchema = z.object({
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
  department: z.string().optional(),
  expertise: z.string().optional(),
  status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE])
});

export const generationConfigSchema = z.object({
  generationName: z
    .string()
    .min(3, 'Generation title must be at least 3 characters')
    .max(120, 'Generation title cannot exceed 120 characters'),
  requestedTeamCount: z
    .number()
    .int()
    .positive('Team count must be greater than 0')
    .nullable()
    .optional(),
  balancedMentorDistribution: z.boolean().default(true),
  excludeAssignedStudents: z.boolean().default(false),
  teamNamePrefix: z.string().default('Team')
});
