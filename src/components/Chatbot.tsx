// Import necessary libraries
import React, { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../integrations/supabase/client';

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

// Floating Chat Icon Component
const FloatingChatIcon = ({ onClick }: { onClick: () => void }) => (
  <div
    onClick={onClick}
    style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#196110',
      color: 'white',
      borderRadius: '50%',
      width: '60px',
      height: '60px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    }}
  >
    <MessageSquare size={26} />
  </div>
);

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

      const { data: existingConversation, error: existingError } = await supabase
        .from<SupabaseConversation>('conversations')
        .select('id, status, unread_count')
        .eq('session_id', sessionId)
        .limit(1)
        .maybeSingle();

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
        const { data: newConversation, error: insertError } = await supabase
          .from<SupabaseConversation>('conversations')
          .insert({ session_id: sessionId, status: 'open', unread_count: 0 })
          .select('*')
          .single();

        if (insertError || !newConversation) {
          console.error('Error creating conversation', insertError);
          // Fall back to local-only chat so user can still interact
          initLocalChat();
          return;
        }

        convId = newConversation.id;
      }

      setConversationId(convId);

      const { data: messageData, error: messageError } = await supabase
        .from<SupabaseMessage>('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

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
    'Giá bao nhiêu?',
    'Mua ở đâu?',
    'Chính sách đổi trả thế nào?',
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
      <FloatingChatIcon onClick={() => setIsOpen(true)} />
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default Chatbot;
