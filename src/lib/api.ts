import { Platform } from 'react-native';
import type {
  AuthResponse,
  LoginPayload,
  SessionResponse,
  SignupPayload,
} from '../types/auth';
import type {
  CreatePostPayload,
  FeedResponse,
  QueryFeedParams,
} from '../types/feed';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://127.0.0.1:3000');

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
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.token
          ? { Authorization: `Bearer ${options.token}` }
          : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch {
    const localhostHint =
      API_BASE_URL.includes('127.0.0.1') ||
      API_BASE_URL.includes('localhost') ||
      API_BASE_URL.includes('10.0.2.2');

    const message = localhostHint
      ? `Cannot reach the API at ${API_BASE_URL}. If you are on a physical device, start Expo with EXPO_PUBLIC_API_BASE_URL pointed at your Mac's LAN IP.`
      : `Cannot reach the API at ${API_BASE_URL}.`;

    throw new ApiError(message, 0);
  }

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
  getFeed(params: QueryFeedParams = {}) {
    const searchParams = new URLSearchParams();

    if (params.cursor) {
      searchParams.set('cursor', params.cursor);
    }
    if (params.type) {
      searchParams.set('type', params.type);
    }
    if (params.limit) {
      searchParams.set('limit', String(params.limit));
    }

    const query = searchParams.toString();
    return request<FeedResponse>(`/feed${query ? `?${query}` : ''}`);
  },
  createPost(payload: CreatePostPayload, token: string) {
    return request('/posts', {
      method: 'POST',
      token,
      body: payload,
    });
  },
};

export { ApiError };
