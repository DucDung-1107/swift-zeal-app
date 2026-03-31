import React, { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

type Message = { id: number; sender: string; content: string; created_at: string; };
type Conversation = {
  id: number;
  session_id: string;
  status: string;
  unread_count: number;
  created_at: string;
  messages?: Message[];
};

const CRMChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [supportMessages, setSupportMessages] = useState<Message[]>([]);
  const [senderNames, setSenderNames] = useState<Record<string, string>>({});
  const [supportReply, setSupportReply] = useState('');
  // Resolve sender display names: try to map UUID-like senders to profiles.full_name
  const resolveSenderNames = async (messages: Message[]) => {
    try {
      const senders = Array.from(new Set((messages || []).map((m) => String(m.sender || '')))).filter(Boolean);
      // Filter out known labels
      const unknownIds = senders.filter((s) => !['admin', 'agent', 'user'].includes(s) && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s));
      if (unknownIds.length === 0) return;

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', unknownIds);
        // Resolve sender display names: try to map UUID-like senders to profiles.full_name
        const resolveSenderNames = async (messages: Message[]) => {
          try {
            const senders = Array.from(new Set((messages || []).map((m) => String(m.sender || '')))).filter(Boolean);
            // Filter out known labels
            const unknownIds = senders.filter((s) => !['admin', 'agent', 'user'].includes(s) && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s));
            if (unknownIds.length === 0) return;

            const { data: profiles, error } = await supabase
              .from('profiles')
              .select('user_id, full_name')
              .in('user_id', unknownIds);

            if (error) {
              console.error('Failed to resolve sender names', error);
              return;
            }

            const map: Record<string, string> = {};
            (profiles || []).forEach((p: any) => {
              if (p?.user_id) map[String(p.user_id)] = p.full_name || String(p.user_id).slice(0, 8) + '...';
            });

            // Merge into existing senderNames
            setSenderNames((prev) => ({ ...prev, ...map }));
          } catch (e) {
            // ignore
          }
        };

      if (error) {
        console.error('Failed to resolve sender names', error);
        return;
      }

      const map: Record<string, string> = {};
      (profiles || []).forEach((p: any) => {
        if (p?.user_id) map[String(p.user_id)] = p.full_name || String(p.user_id).slice(0, 8) + '...';
      });

      // Merge into existing senderNames
      setSenderNames((prev) => ({ ...prev, ...map }));
    } catch (e) {
      // ignore
    }
  };

  const loadSupportConversations = async () => {
    const { data, error } = await supabase
      .from<Conversation>('conversations')
      .select('*, messages(*)')
      .order('unread_count', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Cannot load conversations', error);
      setConversations([]);
      setSupportMessages([]);
      return;
    }

    const sorted = (data || []).sort((a, b) => {
      const aUnread = a.unread_count ?? 0;
      const bUnread = b.unread_count ?? 0;
      if (aUnread !== bUnread) return bUnread - aUnread;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    setConversations(sorted);

    if (!selectedConversationId && sorted.length > 0) {
      setSelectedConversationId(sorted[0].id);
      setSupportMessages(sorted[0].messages || []);
    }
  };
          resolveSenderNames(msgs);
  const loadConversation = async (id: number) => {
    const { data, error } = await supabase
      .from<Conversation>('conversations')
      .select('*, messages(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Cannot load conversation', error);
      setSupportMessages([]);
      return;
    }

    setSelectedConversationId(id);
    const msgs = data.messages || [];
    setSupportMessages(msgs);
    resolveSenderNames(msgs);
  };

  const sendSupportReply = async () => {
    if (!selectedConversationId || !supportReply.trim()) return;

    const payload = {
      conversation_id: selectedConversationId,
      sender: 'admin',
      content: supportReply.trim(),
    };

    const { error } = await supabase.from('messages').insert(payload);
    if (error) {
      console.error('Failed to send support reply', error);
      return;
    }

    await supabase.from('conversations').update({ unread_count: 0 }).eq('id', selectedConversationId);

    setSupportMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'admin', content: supportReply.trim(), created_at: new Date().toISOString() },
    ]);
    setSupportReply('');
    loadSupportConversations();
  };

  useEffect(() => {
    loadSupportConversations();

    // Real-time support: conversation and message updates
    const conversationsChannel = supabase
      .channel('public:conversations')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversations' }, () => {
        loadSupportConversations();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' }, () => {
        loadSupportConversations();
      })
      .subscribe();

    const messagesChannel = supabase
      .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = payload.new as Message;
        // Update selected conversation detail
        if (selectedConversationId === newMessage.conversation_id) {
          setSupportMessages((prev) => {
            const next = [...prev, newMessage];
            resolveSenderNames(next);
            return next;
          });
        }
        // Refresh conversation list for unread count and recent status.
        loadSupportConversations();
      })
      .subscribe();

    // Fallback refresh every 5s for environments not using websocket (or connection dropped)
    const pollingTimer = window.setInterval(() => {
      loadSupportConversations();
      if (selectedConversationId) {
        loadConversation(selectedConversationId);
      }
    }, 5000);

    return () => {
      window.clearInterval(pollingTimer);
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedConversationId]);

  // Resolve sender display names: try to map UUID-like senders to profiles.full_name
  const resolveSenderNames = async (messages: Message[]) => {
    try {
      const senders = Array.from(new Set((messages || []).map((m) => String(m.sender || '')))).filter(Boolean);
      // Filter out known labels
      const unknownIds = senders.filter((s) => !['admin', 'agent', 'user'].includes(s) && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s));
      if (unknownIds.length === 0) return;

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', unknownIds);

      if (error) {
        console.error('Failed to resolve sender names', error);
        return;
      }

      const map: Record<string, string> = {};
      (profiles || []).forEach((p: any) => {
        if (p?.user_id) map[String(p.user_id)] = p.full_name || String(p.user_id).slice(0, 8) + '...';
      });

      // Merge into existing senderNames
      setSenderNames((prev) => ({ ...prev, ...map }));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (!selectedConversationId) return;
    loadConversation(selectedConversationId);
  }, [selectedConversationId]);

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-1 bg-card border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Danh sách chat</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {conversations.length ? conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversationId(conv.id)}
              className={`w-full text-left p-3 rounded-lg transition ${selectedConversationId === conv.id ? 'bg-emerald-500 text-white' : 'bg-background hover:bg-slate-100'} ${conv.unread_count > 0 ? 'font-bold' : 'font-normal'}`}
            >
              <div className="flex items-center justify-between">
                <span># {conv.id}</span>
                <span className="text-[11px] text-emerald-700">{conv.session_id.slice(0, 8)}...</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{conv.status}</span>
                {conv.unread_count > 0 ? (
                  <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">{conv.unread_count} mới</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Đã đọc</span>
                )}
              </div>
            </button>
          )) : (
            <p className="text-sm text-muted-foreground">Chưa có cuộc trò chuyện.</p>
          )}
        </div>
      </div>
      <div className="md:col-span-2 bg-card border rounded-lg p-4 flex flex-col gap-3">
        <h3 className="font-semibold mb-2">Nội dung chat</h3>
        <div className="flex-1 overflow-y-auto max-h-96 space-y-2 p-2 bg-slate-50 rounded">
          {supportMessages.length ? supportMessages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded-lg ${msg.sender === 'user' ? 'bg-white text-slate-900 self-start' : 'bg-emerald-100 text-emerald-900 self-end'}`}
            >
              <p className="text-[10px] mb-1">{
                senderNames[String(msg.sender)]
                  ?? (msg.sender === 'admin' ? 'Admin' : msg.sender === 'agent' ? 'Bot' : msg.sender === 'user' ? 'Khách' : String(msg.sender).slice(0, 8) + '...')
              }</p>
              <p>{msg.content}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{new Date(msg.created_at).toLocaleString('vi-VN')}</p>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">Chọn cuộc trò chuyện bên trái để xem chi tiết.</p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            value={supportReply}
            onChange={(e) => setSupportReply(e.target.value)}
            placeholder="Trả lời..."
            className="flex-1 border rounded px-3 py-2"
            onKeyDown={(e) => e.key === 'Enter' && sendSupportReply()}
          />
          <button onClick={sendSupportReply} className="px-4 py-2 rounded bg-emerald-600 text-white">Gửi</button>
        </div>
      </div>
    </div>
  );
};

export default CRMChat;
