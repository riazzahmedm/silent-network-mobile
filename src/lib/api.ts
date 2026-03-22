import type {
  AuthResponse,
  LoginPayload,
  SessionResponse,
  SignupPayload,
} from '../types/auth';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:3000';

type RequestOptions = {
  method?: 'GET' | 'POST';
  token?: string | null;
  body?: unknown;
};

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token
        ? { Authorization: `Bearer ${options.token}` }
        : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!response.ok) {
    let message = 'Something went wrong';

    try {
      const payload = await response.json();
      if (typeof payload.message === 'string') {
        message = payload.message;
      } else if (Array.isArray(payload.message) && payload.message.length > 0) {
        message = payload.message[0];
      }
    } catch {
      message = response.statusText || message;
    }

    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

export const api = {
  baseUrl: API_BASE_URL,
  login(payload: LoginPayload) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    });
  },
  signup(payload: SignupPayload) {
    return request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: payload,
    });
  },
  session(token: string) {
    return request<SessionResponse>('/auth/session', {
      token,
    });
  },
  oauthUrl(provider: 'google' | 'github' | 'apple', redirect: string) {
    return request<{ url: string }>(
      `/auth/oauth/${provider}/url?redirect=${encodeURIComponent(redirect)}`,
    );
  },
};

export { ApiError };
