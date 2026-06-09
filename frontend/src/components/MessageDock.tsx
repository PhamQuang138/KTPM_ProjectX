import {FormEvent, useCallback, useEffect, useRef, useState} from 'react';
import {ChevronLeft, ExternalLink, LoaderCircle, MessageCircle, Send, X} from 'lucide-react';
import {Link} from 'react-router-dom';
import {apiRequest} from '../lib/api';
import {useAuthStore} from '../store/useAuthStore';
import {useMessageStore} from '../store/useMessageStore';

interface Participant {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  readAt?: string | null;
  sender: Participant;
}

interface Conversation {
  id: string;
  buyer: Participant;
  seller: Participant;
  listing?: {
    id: string;
    title: string;
    price: string;
    vehicle?: {image: string} | null;
  };
  messages: ChatMessage[];
  updatedAt: string;
}

export default function MessageDock() {
  const currentUser = useAuthStore((state) => state.user);
  const {isOpen, contactTarget, activeConversationId, selectConversation, close} = useMessageStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((item) => item.id === activeConversationId) ?? null;

  const loadConversations = useCallback(async () => {
    const data = await apiRequest<Conversation[]>('/messages');
    setConversations(data);
    return data;
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    const data = await apiRequest<ChatMessage[]>(`/messages/${conversationId}/messages`);
    setMessages(data);
  }, []);

  useEffect(() => {
    if (!isOpen || !currentUser) return;
    setError('');
    setIsLoading(true);
    loadConversations()
      .catch((requestError) =>
        setError(requestError instanceof Error ? requestError.message : 'Không thể tải tin nhắn.'),
      )
      .finally(() => setIsLoading(false));
  }, [currentUser, isOpen, loadConversations]);

  useEffect(() => {
    if (!isOpen || !contactTarget) return;
    setIsLoading(true);
    apiRequest<Conversation>('/messages', {
      method: 'POST',
      body: JSON.stringify(contactTarget.listingId ? {listingId: contactTarget.listingId} : {userId: contactTarget.userId}),
    })
      .then(async (conversation) => {
        await loadConversations();
        if (!conversation.messages.length && contactTarget.listingId) {
          setContent(
            `Chào ${contactTarget.sellerName}, tôi muốn trao đổi thêm về ${contactTarget.listingTitle} (${contactTarget.listingPrice}).`,
          );
        }
        selectConversation(conversation.id);
      })
      .catch((requestError) =>
        setError(requestError instanceof Error ? requestError.message : 'Không thể mở cuộc trò chuyện.'),
      )
      .finally(() => setIsLoading(false));
  }, [contactTarget, isOpen, loadConversations, selectConversation]);

  useEffect(() => {
    if (!isOpen || !activeConversationId) {
      setMessages([]);
      return;
    }
    loadMessages(activeConversationId).catch((requestError) =>
      setError(requestError instanceof Error ? requestError.message : 'Không thể tải tin nhắn.'),
    );
    const timer = window.setInterval(() => {
      void loadMessages(activeConversationId);
      void loadConversations();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [activeConversationId, isOpen, loadConversations, loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({top: scrollRef.current.scrollHeight, behavior: 'smooth'});
  }, [messages]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const nextContent = content.trim();
    if (!activeConversationId || !nextContent || isSending) return;

    setError('');
    setIsSending(true);
    try {
      const message = await apiRequest<ChatMessage>(`/messages/${activeConversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({content: nextContent}),
      });
      setMessages((current) => [...current, message]);
      setContent('');
      await loadConversations();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể gửi tin nhắn.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen || !currentUser) return null;

  const otherParticipant = activeConversation
    ? activeConversation.buyer.id === currentUser.id
      ? activeConversation.seller
      : activeConversation.buyer
    : null;

  return (
    <section className="fixed bottom-20 right-3 z-[80] flex h-[min(620px,calc(100vh-7rem))] w-[min(390px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface-container shadow-2xl md:bottom-6 md:right-6">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4">
        {activeConversationId && (
          <button
            type="button"
            onClick={() => selectConversation('')}
            className="interactive-icon"
            title="Danh sách trò chuyện"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {otherParticipant ? (
          <>
            <img
              src={otherParticipant.avatar ?? `https://i.pravatar.cc/100?u=${encodeURIComponent(otherParticipant.email)}`}
              alt={otherParticipant.name}
              className="h-9 w-9 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{otherParticipant.name}</p>
              <p className="truncate text-[10px] text-on-surface-variant">{activeConversation?.listing?.title ?? 'Trò chuyện trực tiếp'}</p>
            </div>
          </>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-bold">Tin nhắn</h2>
          </div>
        )}
        <button type="button" onClick={close} className="interactive-icon" title="Đóng">
          <X className="h-5 w-5" />
        </button>
      </header>

      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && !activeConversationId && (
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map((conversation) => {
            const person =
              conversation.buyer.id === currentUser.id ? conversation.seller : conversation.buyer;
            const latestMessage = conversation.messages[0];
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => selectConversation(conversation.id)}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-white/5"
              >
                <img
                  src={person.avatar ?? `https://i.pravatar.cc/100?u=${encodeURIComponent(person.email)}`}
                  alt={person.name}
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold">{person.name}</p>
                    <span className="shrink-0 text-[9px] text-on-surface-variant">
                      {new Date(conversation.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="truncate text-xs text-primary">{conversation.listing?.title ?? 'Trò chuyện trực tiếp'}</p>
                  <p className="truncate text-xs text-on-surface-variant">
                    {latestMessage?.content ?? 'Bắt đầu cuộc trò chuyện'}
                  </p>
                </div>
              </button>
            );
          })}
          {conversations.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center text-sm text-on-surface-variant">
              <MessageCircle className="mb-3 h-8 w-8 text-primary" />
              Chưa có cuộc trò chuyện nào.
            </div>
          )}
        </div>
      )}

      {!isLoading && activeConversationId && (
        <>
          {activeConversation?.listing && (
            <Link
              to={`/market/${activeConversation.listing.id}`}
              className="mx-3 mt-3 flex shrink-0 items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 hover:bg-primary/10"
            >
              {activeConversation.listing.vehicle?.image ? (
                <img
                  src={activeConversation.listing.vehicle.image}
                  alt={activeConversation.listing.title}
                  className="h-14 w-16 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold">{activeConversation.listing.title}</p>
                <p className="mt-1 text-xs font-bold text-primary">{activeConversation.listing.price}</p>
                <p className="mt-1 text-[9px] uppercase tracking-widest text-on-surface-variant">
                  Sản phẩm đang trao đổi
                </p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-on-surface-variant" />
            </Link>
          )}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message) => {
              const isMine = message.sender.id === currentUser.id;
              return (
                <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm ${
                      isMine
                        ? 'rounded-br-md bg-primary text-on-primary'
                        : 'rounded-bl-md bg-surface-container-high text-on-surface'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <p className="mt-1 text-right text-[9px] opacity-60">
                      {new Date(message.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <form onSubmit={sendMessage} className="flex shrink-0 gap-2 border-t border-white/10 p-3">
            <input
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={4000}
              placeholder="Nhập tin nhắn..."
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!content.trim() || isSending}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary disabled:opacity-50"
              title="Gửi tin nhắn"
            >
              {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </>
      )}

      {error && <p className="shrink-0 border-t border-red-400/20 bg-red-500/10 px-4 py-2 text-xs text-red-200">{error}</p>}
    </section>
  );
}
