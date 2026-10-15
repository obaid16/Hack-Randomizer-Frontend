/**
 * Utility functions for Hackathon Team Randomizer
 */

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateString, options = {}) {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      dateStyle: 'medium',
      ...options
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch {
    return dateString;
  }
}

export function calculateMaxTeams(firstYearsCount, secondYearsCount) {
  const fyCapacity = Math.floor((firstYearsCount || 0) / 2);
  const syCapacity = secondYearsCount || 0;
  return Math.min(fyCapacity, syCapacity);
}
