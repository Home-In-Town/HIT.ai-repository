const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  console.warn("NEXT_PUBLIC_API_BASE_URL is not defined in environment variables");
}

interface FetchOptions extends RequestInit {
  token?: string;
}

/**
 * Central API helper that prepends the base URL and handles auth headers.
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, headers, ...rest } = options;

  const defaultHeaders: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
    ...rest,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { message?: string }).message ||
        `API error: ${response.status}`
    );
  }

  return response.json();
}

/**
 * For multipart/form-data requests (file uploads) — does NOT set Content-Type
 * so the browser can set it with the boundary.
 */
export async function apiUpload<T = unknown>(
  endpoint: string,
  formData: FormData,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { message?: string }).message ||
        `Upload error: ${response.status}`
    );
  }

  return response.json();
}
