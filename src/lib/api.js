/**
 * Frontend API client communicating with Next.js internal proxies
 * Prevents exposing JWT in localStorage while securely relaying credentials.
 */

export class ApiError extends Error {
  constructor(message, status = 500, errors = [], isOffline = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.isOffline = isOffline;
  }
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (err) {
    throw new ApiError(
      'Unable to connect to the server. Please check your network connection.',
      503,
      [],
      true
    );
  }

  // Handle binary / CSV downloads
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/csv') || contentType.includes('application/octet-stream')) {
    if (!response.ok) {
      throw new ApiError('Failed to download file from server', response.status);
    }
    const blob = await response.blob();
    return blob;
  }

  let data;
  const rawText = await response.text();
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    if (!response.ok) {
      throw new ApiError(
        `Server returned ${response.status}: ${response.statusText || 'Internal Server Error'}`,
        response.status
      );
    }
    throw new ApiError('Invalid response received from server', response.status);
  }

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.message || 'An unexpected error occurred',
      response.status,
      data.errors || [],
      Boolean(data.isOffline)
    );
  }

  return data;
}

// Authentication Service
export const authApi = {
  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  logout: () =>
    request('/api/auth/logout', {
      method: 'POST'
    }),

  getMe: () => request('/api/auth/me'),

  changePassword: (currentPassword, newPassword) =>
    request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    })
};

// Dashboard Service
export const dashboardApi = {
  getStats: () => request('/api/backend/dashboard/stats')
};

// Students Service
export const studentsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/api/backend/students${qs}`);
  },

  getById: (id) => request(`/api/backend/students/${id}`),

  create: (data) =>
    request('/api/backend/students', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  update: (id, data) =>
    request(`/api/backend/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  delete: (id) =>
    request(`/api/backend/students/${id}`, {
      method: 'DELETE'
    }),

  bulkUploadCsv: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/backend/students/bulk', {
      method: 'POST',
      body: formData
    });
  },

  bulkImportJson: (students) =>
    request('/api/backend/students/bulk', {
      method: 'POST',
      body: JSON.stringify({ students })
    })
};

// Mentors Service
export const mentorsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/api/backend/mentors${qs}`);
  },

  getById: (id) => request(`/api/backend/mentors/${id}`),

  create: (data) =>
    request('/api/backend/mentors', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  update: (id, data) =>
    request(`/api/backend/mentors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  delete: (id) =>
    request(`/api/backend/mentors/${id}`, {
      method: 'DELETE'
    }),

  bulkUploadCsv: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/backend/mentors/bulk', {
      method: 'POST',
      body: formData
    });
  },

  bulkImportJson: (mentors) =>
    request('/api/backend/mentors/bulk', {
      method: 'POST',
      body: JSON.stringify({ mentors })
    })
};

// Team Generations Service
export const generationsApi = {
  preview: (options = {}) =>
    request('/api/backend/generations/preview', {
      method: 'POST',
      body: JSON.stringify(options)
    }),

  create: (options) =>
    request('/api/backend/generations', {
      method: 'POST',
      body: JSON.stringify(options)
    }),

  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/api/backend/generations${qs}`);
  },

  getById: (id) => request(`/api/backend/generations/${id}`),

  updateTeam: (generationId, teamId, updateData) =>
    request(`/api/backend/generations/${generationId}/teams/${teamId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    }),

  regenerate: (generationId, options = {}) =>
    request(`/api/backend/generations/${generationId}/regenerate`, {
      method: 'POST',
      body: JSON.stringify({ confirm: true, ...options })
    }),

  exportCsv: async (generationId, defaultFilename = 'generation_export.csv') => {
    const blob = await request(`/api/backend/generations/${generationId}/export`);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = defaultFilename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }
};
