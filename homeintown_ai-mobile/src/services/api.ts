/**
 * Core API request helper.
 * Handles authentication cookies, error responses, and timeouts.
 */

import { API_BASE_URL, API_TIMEOUT } from './config';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
}

interface ApiError {
  error: string;
  statusCode: number;
}

class ApiRequestError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
  }
}

export { ApiRequestError };

/**
 * Make an API request to the backend.
 * Automatically includes credentials (cookies) for auth.
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, timeout = API_TIMEOUT } = options;

  const url = `${API_BASE_URL}/api/${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Unknown error occurred',
      }));
      throw new ApiRequestError(
        (errorData as ApiError).error || `Request failed with status ${response.status}`,
        response.status
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiRequestError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiRequestError('Request timed out', 408);
    }

    throw new ApiRequestError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}
