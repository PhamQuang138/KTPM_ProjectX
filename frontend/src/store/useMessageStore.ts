import {create} from 'zustand';

interface ContactTarget {
  listingId: string;
  listingTitle: string;
  sellerName: string;
}

interface MessageState {
  isOpen: boolean;
  contactTarget: ContactTarget | null;
  activeConversationId: string | null;
  openInbox: () => void;
  startContact: (target: ContactTarget) => void;
  selectConversation: (id: string) => void;
  close: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  isOpen: false,
  contactTarget: null,
  activeConversationId: null,
  openInbox: () => set({isOpen: true, contactTarget: null}),
  startContact: (contactTarget) =>
    set({isOpen: true, contactTarget, activeConversationId: null}),
  selectConversation: (activeConversationId) =>
    set({isOpen: true, activeConversationId, contactTarget: null}),
  close: () => set({isOpen: false, contactTarget: null}),
}));
