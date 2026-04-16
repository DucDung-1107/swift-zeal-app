// Import necessary libraries
import React, { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../integrations/supabase/client';
import { useSiteConfig } from '@/hooks/useSiteConfig';

const API_BASE = null;


type Message = {
  id: number;
  sender: 'user' | 'agent';
  content: string;
  created_at: string;
};

type SupabaseConversation = {
  id: number;
  session_id: string;
  status: string;
  unread_count: number;
  created_at: string;
};

type SupabaseMessage = {
  id: number;
  conversation_id: number;
  sender: 'user' | 'agent';
  content: string;
  created_at: string;
};

// Floating Chat Icon Component (interactive)
const FloatingChatIcon = ({ onClick }: { onClick: () => void }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      title="Mở Chat"
      aria-label="Open Chat"
      style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#196110',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        boxShadow: hover ? '0 12px 30px rgba(0,0,0,0.28)' : '0 6px 18px rgba(0,0,0,0.18)',
        transform: hover ? 'translateY(-3px) scale(1.04)' : 'translateY(0) scale(1)',
        transition: 'transform 160ms ease, box-shadow 160ms ease',
        outline: 'none'
      }}
    >
      <MessageSquare size={24} />
    </div>
  );
};

const ZaloFloatingButton = ({ href }: { href: string }) => {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open Zalo chat"
      title="Chat trên Zalo"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: hover ? '0 12px 30px rgba(16,128,255,0.28)' : '0 6px 18px rgba(16,128,255,0.18)',
        transform: hover ? 'translateY(-3px) scale(1.04)' : 'translateY(0) scale(1)',
        transition: 'transform 160ms ease, box-shadow 160ms ease',
        textDecoration: 'none',
        cursor: 'pointer',
        overflow: 'hidden',
        outline: 'none'
      }}
    >
      <img src="/zalo_icon.png" alt="Zalo" style={{ width: 28, height: 28, borderRadius: 999 }} />
    </a>
  );
};

const PhoneFloatingButton = ({ href }: { href: string }) => {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      aria-label="Call phone"
      title="Gọi: 086612167"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#196110',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: hover ? '0 12px 30px rgba(25, 97, 16, 0.28)' : '0 6px 18px rgba(25, 97, 16, 0.18)',
        transform: hover ? 'translateY(-3px) scale(1.04)' : 'translateY(0) scale(1)',
        transition: 'transform 160ms ease, box-shadow 160ms ease',
        textDecoration: 'none',
        cursor: 'pointer',
        outline: 'none'
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1C9.85 21 3 14.15 3 5a1 1 0 011-1h2.5a1 1 0 011 1c0 1.24.2 2.45.57 3.57a1 1 0 01-.24 1.02l-2.21 2.2z" fill="white" />
      </svg>
    </a>
  );
};

const FloatingActionsInner = ({ onChatClick, zaloHref, phoneHref }: { onChatClick: () => void; zaloHref?: string; phoneHref?: string }) => {
  const { config } = useSiteConfig();
  const zalo = zaloHref || `https://zalo.me/${config.zalo_number || '0866121617'}`;
  const phone = phoneHref || `tel:${config.phone || '0866121617'}`;
  return (
  <div style={{ position: 'fixed', right: '20px', bottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', zIndex: 9999 }}>
    <ZaloFloatingButton href={zalo} />
    <PhoneFloatingButton href={phone} />
    <div
      onClick={onChatClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChatClick(); } }}
      title="Mở Chat"
      aria-label="Open Chat"
      style={{ outline: 'none' }}
    >
      <FloatingChatIcon onClick={onChatClick} />
    </div>
  </div>
  );
};

// Chat Window Component
const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);
  const [hasSupabase, setHasSupabase] = useState<boolean>(isSupabaseConfigured);

  const defaultWelcome = 'Cảm ơn quý khách quan tâm tới Phúc Vinh Solar, Nếu bạn muốn có được sự quan tâm đặc biệt hơn hãy gửi tới zalo với số điện thoại 0866121617, cảm ơn quý khách và xin quý khách đợi trong giây lát chúng tôi sẽ trả lời trong ít phút.';

  // Helper: initialise local-only chat with welcome message
  const initLocalChat = () => {
    setHasSupabase(false);
    setConversationId(-1); // Sentinel so sendMessage doesn't short-circuit
    setMessages([{ id: Date.now(), sender: 'agent', content: defaultWelcome, created_at: new Date().toISOString() }]);
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let subscription: any;

    const initChat = async () => {
      const sessionId =
        localStorage.getItem('chat_session_id') ||
        (typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem('chat_session_id', sessionId);

      if (!isSupabaseConfigured) {
        console.info('Supabase is not configured; using local-only chat mode.');
        initLocalChat();
        return;
      }

      const { data: existingConversation, error: existingError } = await (supabase
        .from('conversations')
        .select('id, status, unread_count')
        .eq('session_id', sessionId)
        .limit(1)
        .maybeSingle() as any);

      if (existingError) {
        console.error('Error checking conversation', existingError);
        // Table missing or misconfigured — fall back to local-only chat
        // so the user still gets the welcome message and can interact.
        initLocalChat();
        return;
      }

      let convId: number;

      if (existingConversation?.id) {
        convId = existingConversation.id;
      } else {
        const { data: newConversation, error: insertError } = await (supabase
          .from('conversations')
          .insert({ session_id: sessionId, status: 'open', unread_count: 0 } as any)
          .select('*')
          .single() as any);

        if (insertError || !newConversation) {
          console.error('Error creating conversation', insertError);
          // Fall back to local-only chat so user can still interact
          initLocalChat();
          return;
        }

        convId = newConversation.id;
      }

      setConversationId(convId);

      const { data: messageData, error: messageError } = await (supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true }) as any);

      if (messageError) {
        console.error('Error loading messages', messageError);
      }

      setMessages((messageData || []) as Message[]);

      if ((messageData || []).length === 0) {
        // Thêm default reply ngay khi mới tạo convo nếu chưa có message
        await supabase.from('messages').insert([{ conversation_id: convId, sender: 'agent', content: defaultWelcome }]);
        setMessages([{ id: Date.now() + 1, sender: 'agent', content: defaultWelcome, created_at: new Date().toISOString() }]);
      }

      subscription = supabase
        .channel('public:messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convId}` },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        )
        .subscribe();
    };

    initChat();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  const sendMessage = async (messageText?: string) => {
    const text = (messageText ?? input).trim();
    if (!text || !conversationId) return;

    setTyping(true);

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    if (!hasSupabase) {
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'agent', content: defaultWelcome, created_at: new Date().toISOString() }]);
      setTyping(false);
      return;
    }

    const { error: sendError } = await supabase.from('messages').insert([
      { conversation_id: conversationId, sender: 'user', content: text },
    ]);

    if (sendError) {
      console.error('Error inserting user message', sendError);
      alert('Lỗi gửi tin nhắn: ' + (sendError.message || sendError.details || 'Quyền truy cập bị từ chối.'));
      setTyping(false);
      return;
    }

    await supabase
      .from('conversations')
      .update({ unread_count: 1 })
      .eq('id', conversationId);

    const defaultReply = 'Cảm ơn quý khách quan tâm tới Phúc Vinh Solar, Nếu bạn muốn có được sự quan tâm đặc biệt hơn hãy gửi tới zalo với số điện thoại 0866121617, cảm ơn quý khách và xin quý khách đợi trong giây lát chúng tôi sẽ trả lời trong ít phút.';
    const { error: botError } = await supabase.from('messages').insert([
      { conversation_id: conversationId, sender: 'agent', content: defaultReply },
    ]);

    if (botError) {
      console.error('Error inserting auto reply', botError);
    }

    setTyping(false);
  };

  const quickReplies = [
    'Tôi muốn tư vấn về sản phẩm',
    'Shop của bạn ở địa chỉ nào?',
    'Chính sách đổi trả của shop thế nào?',
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '60px',
        right: '20px',
        width: '430px',
        height: '540px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 35px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          backgroundColor: '#196110',
          color: 'white',
          padding: '12px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} />
          <strong>Chat Support</strong>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px' }}>
          ✖
        </button>
      </div>
      <div
        style={{
          flex: 1,
          padding: '10px',
          overflowY: 'auto',
          maxHeight: '300px',
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: '10px',
              textAlign: msg.sender === 'user' ? 'right' : 'left',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: '16px',
                backgroundColor: msg.sender === 'user' ? '#196110' : '#f1f1f1',
                color: msg.sender === 'user' ? 'white' : 'black',
              }}
            >
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px', borderBottom: '1px solid #ddd' }}>
        {quickReplies.map((reply) => (
          <button
            key={reply}
            onClick={() => {
              setInput(reply);
              sendMessage(reply);
            }}
            style={{
              padding: '6px 10px',
              borderRadius: '14px',
              border: '1px solid #ddd',
              backgroundColor: '#f3f4f6',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {reply}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', padding: '12px', borderTop: '1px solid #ddd', alignItems: 'center', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: '10px 12px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '999px' }}
          onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
          placeholder="Nhập câu hỏi..."
        />
        <button
          onClick={() => sendMessage()}
          style={{
            width: '44px',
            height: '44px',
            backgroundColor: '#196110',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
          }}
          aria-label="Gửi"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

// Main Component
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <FloatingActionsInner onChatClick={() => setIsOpen(true)} />
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default Chatbot;