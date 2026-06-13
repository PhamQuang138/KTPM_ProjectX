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

export interface SharedContentTarget {
  type: 'community' | 'marketplace';
  id: string;
  title: string;
  content: string;
  image?: string;
  price?: string;
}

interface MessageState {
  isOpen: boolean;
  contactTarget: ContactTarget | null;
  activeConversationId: string | null;
  pendingShare: SharedContentTarget | null;
  openInbox: () => void;
  startContact: (target: ContactTarget) => void;
  startDirect: (target: {userId: string; userName: string}) => void;
  shareContent: (content: SharedContentTarget) => void;
  clearShare: () => void;
  selectConversation: (id: string) => void;
  close: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  isOpen: false,
  contactTarget: null,
  activeConversationId: null,
  pendingShare: null,
  openInbox: () => set({isOpen: true, contactTarget: null, pendingShare: null}),
  startContact: (contactTarget) =>
    set({isOpen: true, contactTarget, activeConversationId: null, pendingShare: null}),
  startDirect: (contactTarget) =>
    set({isOpen: true, contactTarget, activeConversationId: null, pendingShare: null}),
  shareContent: (pendingShare) =>
    set({isOpen: true, pendingShare, contactTarget: null, activeConversationId: null}),
  clearShare: () => set({pendingShare: null}),
  selectConversation: (activeConversationId) =>
    set({isOpen: true, activeConversationId, contactTarget: null}),
  close: () => set({isOpen: false, contactTarget: null, pendingShare: null}),
}));
