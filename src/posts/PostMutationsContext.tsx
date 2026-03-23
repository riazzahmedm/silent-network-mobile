import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { FeedPost } from '../types/feed';

type PostMutation =
  | { kind: 'updated'; post: FeedPost; nonce: number }
  | { kind: 'deleted'; postId: string; nonce: number }
  | null;

type PostMutationsContextValue = {
  lastMutation: PostMutation;
  emitPostUpdated: (post: FeedPost) => void;
  emitPostDeleted: (postId: string) => void;
};

const PostMutationsContext = createContext<PostMutationsContextValue | null>(null);

export function PostMutationsProvider({ children }: PropsWithChildren) {
  const [lastMutation, setLastMutation] = useState<PostMutation>(null);

  const emitPostUpdated = useCallback((post: FeedPost) => {
    setLastMutation({
      kind: 'updated',
      post,
      nonce: Date.now(),
    });
  }, []);

  const emitPostDeleted = useCallback((postId: string) => {
    setLastMutation({
      kind: 'deleted',
      postId,
      nonce: Date.now(),
    });
  }, []);

  const value = useMemo(
    () => ({
      lastMutation,
      emitPostUpdated,
      emitPostDeleted,
    }),
    [emitPostDeleted, emitPostUpdated, lastMutation],
  );

  return (
    <PostMutationsContext.Provider value={value}>
      {children}
    </PostMutationsContext.Provider>
  );
}

export function usePostMutations() {
  const context = useContext(PostMutationsContext);
  if (!context) {
    throw new Error('usePostMutations must be used within PostMutationsProvider');
  }

  return context;
}
