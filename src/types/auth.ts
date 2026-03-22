export type AuthUser = {
  id: string;
  username: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
};

export type SessionResponse = {
  user: AuthUser;
};

export type SignupPayload = {
  username: string;
  email: string;
  password: string;
  name?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};
