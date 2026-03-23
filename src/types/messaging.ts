export type ConversationUser = {
  id: string;
  username: string;
  name?: string | null;
  avatarUrl?: string | null;
};

export type MessageSender = {
  id: string;
  username: string;
  name?: string | null;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: MessageSender;
};

export type ConversationListItem = {
  id: string;
  createdAt: string;
  participants: ConversationUser[];
  lastMessage?: Message | null;
};

export type ConversationThread = {
  id: string;
  createdAt: string;
  participants: ConversationUser[];
  messages: Message[];
};

export type InteractionType =
  | 'I_CAN_HELP'
  | 'LEARNED_THIS'
  | 'BUILT_SIMILAR';

export type InteractionThreadResponse = {
  interaction: {
    id: string;
    postId: string;
    userId: string;
    type: InteractionType;
    createdAt: string;
  };
  conversation: ConversationThread;
};
