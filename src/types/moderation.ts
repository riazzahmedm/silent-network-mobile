export type ReportReason =
  | 'SPAM'
  | 'HARASSMENT'
  | 'INAPPROPRIATE'
  | 'MISLEADING'
  | 'OTHER';

export type ReportPostPayload = {
  postId: string;
  reason: ReportReason;
  details?: string;
};

export type PostReportResponse = {
  id: string;
  postId: string;
  reporterUserId: string;
  reason: ReportReason;
  details?: string | null;
  createdAt: string;
};

export type UserBlockResponse = {
  id: string;
  blockerUserId: string;
  blockedUserId: string;
  createdAt: string;
  blocked: {
    id: string;
    username: string;
    name?: string | null;
    avatarUrl?: string | null;
  };
};

export type SpamFlagResponse = {
  postId: string;
  userId: string;
  spamFlagCount: number;
  hiddenFromPublicFeed: boolean;
};
