import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api, ApiError } from '../lib/api';
import { useToast } from '../toast/ToastContext';
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  SignupPayload,
} from '../types/auth';
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from './storage';

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  accessToken: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  loginWithOAuth: (provider: 'google' | 'github' | 'apple') => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function extractAuthResponseFromUrl(url: string) {
  const [base, hash = ''] = url.split('#');
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const tokenType = params.get('token_type');
  const expiresIn = params.get('expires_in');

  if (!accessToken || !tokenType || !expiresIn) {
    throw new Error(`Invalid auth callback: ${base}`);
  }

  return {
    accessToken,
    tokenType,
    expiresIn: Number(expiresIn),
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const { showToast } = useToast();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        const storedToken = await getStoredAccessToken();
        if (!storedToken) {
          return;
        }

        const session = await api.session(storedToken);
        if (!isMounted) {
          return;
        }

        setAccessToken(storedToken);
        setUser(session.user);
      } catch {
        await clearStoredAccessToken();
        if (!isMounted) {
          return;
        }
        setAccessToken(null);
        setUser(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistAuth = useCallback(async (auth: AuthResponse) => {
    await setStoredAccessToken(auth.accessToken);
    setAccessToken(auth.accessToken);
    setUser(auth.user);
    setError(null);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsLoading(true);
      try {
        const auth = await api.login(payload);
        await persistAuth(auth);
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Login failed. Try again.';
        setError(message);
        showToast({
          title: 'Login failed',
          message,
          type: 'error',
        });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [persistAuth, showToast],
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      setIsLoading(true);
      try {
        const auth = await api.signup(payload);
        await persistAuth(auth);
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Signup failed. Try again.';
        setError(message);
        showToast({
          title: 'Signup failed',
          message,
          type: 'error',
        });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [persistAuth, showToast],
  );

  const loginWithOAuth = useCallback(
    async (provider: 'google' | 'github' | 'apple') => {
      setIsLoading(true);
      try {
        const redirectUri = Linking.createURL('/auth/callback');
        const { url } = await api.oauthUrl(provider, redirectUri);
        const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);

        if (result.type !== 'success' || !result.url) {
          if (result.type !== 'cancel') {
            setError('OAuth login did not complete.');
            showToast({
              title: 'OAuth incomplete',
              message: 'The authentication flow did not finish.',
              type: 'error',
            });
          }
          return;
        }

        const auth = extractAuthResponseFromUrl(result.url);
        const session = await api.session(auth.accessToken);

        await setStoredAccessToken(auth.accessToken);
        setAccessToken(auth.accessToken);
        setUser(session.user);
        setError(null);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'OAuth login failed. Try again.';
        setError(message);
        showToast({
          title: 'OAuth failed',
          message,
          type: 'error',
        });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [showToast],
  );

  const logout = useCallback(async () => {
    await clearStoredAccessToken();
    setAccessToken(null);
    setUser(null);
    setError(null);
    showToast({
      title: 'Logged out',
      message: 'Your session has been cleared on this device.',
      type: 'info',
    });
  }, [showToast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isLoading,
      error,
      login,
      signup,
      logout,
      clearError,
      loginWithOAuth,
    }),
    [
      accessToken,
      user,
      isLoading,
      error,
      login,
      signup,
      logout,
      clearError,
      loginWithOAuth,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
