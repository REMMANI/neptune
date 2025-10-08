import 'server-only';

type HttpOptions = {
  revalidate?: number;
  tags?: string[];
  bearerToken?: string;
  headers?: Record<string, string>;
};

type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

export async function serverFetch<T>(
  url: string,
  options: HttpOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const {
      revalidate,
      tags,
      bearerToken,
      headers: customHeaders = {},
    } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'Dealership-CMS/1.0',
      ...customHeaders,
    };

    if (bearerToken) {
      headers.Authorization = `Bearer ${bearerToken}`;
    }

    const fetchOptions: RequestInit = {
      headers,
      next: {
        revalidate,
        tags,
      },
    };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function serverPost<T>(
  url: string,
  body: unknown,
  options: HttpOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const {
      bearerToken,
      headers: customHeaders = {},
    } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'Dealership-CMS/1.0',
      ...customHeaders,
    };

    if (bearerToken) {
      headers.Authorization = `Bearer ${bearerToken}`;
    }

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Environment-based API URLs
export function getCmsApiUrl(): string {
  return process.env.CMS_API_URL || 'https://api.example.com/cms';
}

export function getInventoryApiUrl(): string {
  return process.env.INVENTORY_API_URL || 'https://api.example.com/inventory';
}

export function getCmsApiToken(): string | undefined {
  return process.env.CMS_API_TOKEN;
}

export function getInventoryApiToken(): string | undefined {
  return process.env.INVENTORY_API_TOKEN;
}