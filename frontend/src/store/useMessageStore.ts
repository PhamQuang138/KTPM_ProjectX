import {create} from 'zustand';

interface ContactTarget {
  listingId?: string;
  listingTitle?: string;
  listingPrice?: string;
  listingImage?: string;
  sellerName?: string;
  userId?: string;
  userName?: string;
}

export interface SharedPostTarget {
  postId: string;
  authorName: string;
  content: string;
  image?: string;
}

interface MessageState {
  isOpen: boolean;
  contactTarget: ContactTarget | null;
  activeConversationId: string | null;
  pendingPostShare: SharedPostTarget | null;
  openInbox: () => void;
  startContact: (target: ContactTarget) => void;
  startDirect: (target: {userId: string; userName: string}) => void;
  sharePost: (post: SharedPostTarget) => void;
  clearPostShare: () => void;
  selectConversation: (id: string) => void;
  close: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  isOpen: false,
  contactTarget: null,
  activeConversationId: null,
  pendingPostShare: null,
  openInbox: () => set({isOpen: true, contactTarget: null, pendingPostShare: null}),
  startContact: (contactTarget) =>
    set({isOpen: true, contactTarget, activeConversationId: null, pendingPostShare: null}),
  startDirect: (contactTarget) =>
    set({isOpen: true, contactTarget, activeConversationId: null, pendingPostShare: null}),
  sharePost: (pendingPostShare) =>
    set({isOpen: true, pendingPostShare, contactTarget: null, activeConversationId: null}),
  clearPostShare: () => set({pendingPostShare: null}),
  selectConversation: (activeConversationId) =>
    set({isOpen: true, activeConversationId, contactTarget: null}),
  close: () => set({isOpen: false, contactTarget: null, pendingPostShare: null}),
}));
