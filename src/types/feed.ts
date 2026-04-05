export type PostType = 'BUILDING' | 'LEARNING' | 'STRUGGLING';

export type PostMedia = {
  id: string;
  postId: string;
  url: string;
  type: 'IMAGE' | 'VIDEO' | 'FILE';
  createdAt: string;
};

export type UploadableMediaType = PostMedia['type'];

export type MilestoneBadge = {
  kind: 'BUILDING' | 'LEARNING' | 'STRUGGLING';
  label: string;
  threshold: number;
};

export type PostAuthor = {
  id: string;
  username: string;
  name?: string | null;
  avatarUrl?: string | null;
  badges: MilestoneBadge[];
};

export type FeedPost = {
  id: string;
  userId: string;
  type: PostType;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: PostAuthor;
  media: PostMedia[];
};

export type FeedResponse = {
  items: FeedPost[];
  page: {
    limit: number;
    hasMore: boolean;
    nextCursor?: string | null;
  };
};

export type QueryFeedParams = {
  cursor?: string | null;
  type?: PostType;
  limit?: number;
};

export type CreatePostPayload = {
  type: PostType;
  content: string;
};
