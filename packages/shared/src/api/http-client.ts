type QueryValue = string | number | boolean | null | undefined;

type QueryParams = Record<string, QueryValue>;

type RequestOptions = {
  params?: QueryParams;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export class HttpError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
  }
}

export type CreateHttpClientOptions = {
  baseUrl: string;
  timeoutMs?: number;
  getAccessToken?: () => Promise<string | null>;
};

function buildUrl(baseUrl: string, path: string, params?: QueryParams): string {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  let urlString = `${normalizedBase}${normalizedPath}`;

  if (params) {
    const queryParts: string[] = [];
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return;
      }
      queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    });
    
    if (queryParts.length > 0) {
      urlString += `?${queryParts.join('&')}`;
    }
  }

  return urlString;
}

async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

export function createHttpClient(options: CreateHttpClientOptions) {
  const timeoutMs = options.timeoutMs ?? 10000;

  async function request<TResponse>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown,
    requestOptions?: RequestOptions,
  ): Promise<TResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const accessToken = await options.getAccessToken?.();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        ...(requestOptions?.headers ?? {}),
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(buildUrl(options.baseUrl, path, requestOptions?.params), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: requestOptions?.signal ?? controller.signal,
      });

      const data = await readResponseBody(response);

      if (!response.ok) {
        const message =
          typeof data === 'object' && data && 'message' in data
            ? String((data as { message?: unknown }).message ?? 'Request failed')
            : 'Request failed';
        throw new HttpError(message, response.status, data);
      }

      return data as TResponse;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {
    get<TResponse>(path: string, requestOptions?: RequestOptions) {
      return request<TResponse>('GET', path, undefined, requestOptions);
    },
    post<TResponse>(path: string, payload?: unknown, requestOptions?: RequestOptions) {
      return request<TResponse>('POST', path, payload, requestOptions);
    },
    put<TResponse>(path: string, payload?: unknown, requestOptions?: RequestOptions) {
      return request<TResponse>('PUT', path, payload, requestOptions);
    },
    delete<TResponse>(path: string, requestOptions?: RequestOptions) {
      return request<TResponse>('DELETE', path, undefined, requestOptions);
    },
  };
}
