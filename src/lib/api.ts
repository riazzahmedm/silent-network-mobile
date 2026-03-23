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
  FeedPost,
  PostMedia,
  QueryFeedParams,
  UploadableMediaType,
} from '../types/feed';
import type {
  BuildMapResponse,
  SignalsResponse,
} from '../types/signals';
import type {
  ConversationListItem,
  ConversationThread,
  InteractionThreadResponse,
  InteractionType,
  Message,
} from '../types/messaging';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://127.0.0.1:3000');

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
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
    return request<FeedPost>('/posts', {
      method: 'POST',
      token,
      body: payload,
    });
  },
  getPost(postId: string) {
    return request<FeedPost>(`/posts/${postId}`);
  },
  updatePost(
    postId: string,
    payload: Partial<CreatePostPayload>,
    token: string,
  ) {
    return request<FeedPost>(`/posts/${postId}`, {
      method: 'PATCH',
      token,
      body: payload,
    });
  },
  deletePost(postId: string, token: string) {
    return request<{ id: string }>(`/posts/${postId}`, {
      method: 'DELETE',
      token,
    });
  },
  async uploadMedia(
    payload: {
      postId: string;
      type: UploadableMediaType;
      file: {
        uri: string;
        name: string;
        mimeType: string;
      };
    },
    token: string,
  ) {
    const formData = new FormData();
    formData.append('postId', payload.postId);
    formData.append('type', payload.type);
    formData.append('file', {
      uri: payload.file.uri,
      name: payload.file.name,
      type: payload.file.mimeType,
    } as any);

    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}/media/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    } catch {
      throw new ApiError(`Cannot reach the API at ${API_BASE_URL}.`, 0);
    }

    if (!response.ok) {
      let message = 'Failed to upload media';

      try {
        const body = await response.json();
        if (typeof body.message === 'string') {
          message = body.message;
        } else if (Array.isArray(body.message) && body.message[0]) {
          message = body.message[0];
        }
      } catch {
        message = response.statusText || message;
      }

      throw new ApiError(message, response.status);
    }

    return (await response.json()) as PostMedia;
  },
  deleteMedia(mediaId: string, token: string) {
    return request<PostMedia>(`/media/${mediaId}`, {
      method: 'DELETE',
      token,
    });
  },
  getMySignals(token: string) {
    return request<SignalsResponse>('/streaks/me', {
      token,
    });
  },
  getMyBuildMap(token: string, days = 28) {
    return request<BuildMapResponse>(`/build-map/me?days=${days}`, {
      token,
    });
  },
  getConversations(token: string) {
    return request<ConversationListItem[]>('/messaging/conversations', {
      token,
    });
  },
  getConversation(conversationId: string, token: string) {
    return request<ConversationThread>(`/messaging/conversations/${conversationId}`, {
      token,
    });
  },
  sendMessage(conversationId: string, content: string, token: string) {
    return request<Message>(`/messaging/conversations/${conversationId}/messages`, {
      method: 'POST',
      token,
      body: { content },
    });
  },
  createInteraction(
    payload: {
      postId: string;
      type: InteractionType;
      message?: string;
    },
    token: string,
  ) {
    return request<InteractionThreadResponse>('/interactions', {
      method: 'POST',
      token,
      body: payload,
    });
  },
};

export { ApiError };

export function resolveMediaUrl(url: string) {
  try {
    const mediaUrl = new URL(url);
    const apiUrl = new URL(API_BASE_URL);

    if (
      ['localhost', '127.0.0.1'].includes(mediaUrl.hostname) &&
      !['localhost', '127.0.0.1'].includes(apiUrl.hostname)
    ) {
      mediaUrl.protocol = apiUrl.protocol;
      mediaUrl.hostname = apiUrl.hostname;
      mediaUrl.port = apiUrl.port;
      return mediaUrl.toString();
    }

    return mediaUrl.toString();
  } catch {
    return url;
  }
}
