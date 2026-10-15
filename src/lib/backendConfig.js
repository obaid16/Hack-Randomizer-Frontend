/**
 * Resolves and normalizes the backend API base URL.
 * Ensures the `/api/v1` prefix is reliably present whether the user configures:
 * - https://hack-randomizer-backend.onrender.com
 * - https://hack-randomizer-backend.onrender.com/
 * - https://hack-randomizer-backend.onrender.com/api/v1
 * - https://hack-randomizer-backend.onrender.com/api/v1/
 */
export function getBackendUrl() {
  const raw =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:5000/api/v1';

  let cleaned = raw.trim().replace(/\/+$/, '');

  if (!cleaned.endsWith('/api/v1')) {
    cleaned = `${cleaned}/api/v1`;
  }

  return cleaned;
}
