import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { getBackendUrl } from '@/lib/backendConfig';

async function forwardRequest(request, context, method) {
  const params = await Promise.resolve(context?.params || {});
  const path = params.path || [];
  const endpoint = Array.isArray(path) ? path.join('/') : path;

  // Preserve query string
  const url = new URL(request.url);
  const queryString = url.search;
  const backendTarget = `${getBackendUrl()}/${endpoint}${queryString}`;

  // Read HttpOnly auth token
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const contentType = request.headers.get('content-type');

  let body = undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    if (contentType && contentType.includes('application/json')) {
      headers['Content-Type'] = 'application/json';
      body = await request.text();
    } else if (contentType && contentType.includes('multipart/form-data')) {
      // Forward form data directly as ArrayBuffer / stream
      body = await request.arrayBuffer();
      headers['Content-Type'] = contentType;
    } else {
      body = await request.arrayBuffer();
      if (contentType) headers['Content-Type'] = contentType;
    }
  }

  try {
    const backendResponse = await fetch(backendTarget, {
      method,
      headers,
      body
    });

    const respContentType = backendResponse.headers.get('content-type') || '';

    // Handle CSV or non-JSON files (e.g. exports)
    if (respContentType.includes('text/csv') || respContentType.includes('application/octet-stream')) {
      const buffer = await backendResponse.arrayBuffer();
      const disposition = backendResponse.headers.get('content-disposition');

      const fileHeaders = {
        'Content-Type': respContentType
      };
      if (disposition) {
        fileHeaders['Content-Disposition'] = disposition;
      }

      return new NextResponse(buffer, {
        status: backendResponse.status,
        headers: fileHeaders
      });
    }

    // JSON response
    const json = await backendResponse.json();
    return NextResponse.json(json, { status: backendResponse.status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Backend API is currently unreachable. Please verify that the backend server is running on ' + BACKEND_URL,
        isOffline: true,
        error: error.message
      },
      { status: 503 }
    );
  }
}

export async function GET(request, context) {
  return forwardRequest(request, context, 'GET');
}

export async function POST(request, context) {
  return forwardRequest(request, context, 'POST');
}

export async function PATCH(request, context) {
  return forwardRequest(request, context, 'PATCH');
}

export async function DELETE(request, context) {
  return forwardRequest(request, context, 'DELETE');
}
