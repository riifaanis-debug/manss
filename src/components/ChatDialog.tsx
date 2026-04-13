import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ChatDialogProps {
  onClose: () => void;
  /** If provided, admin is chatting with this specific user */
  targetUserId?: string;
  targetUserName?: string;
}

export function ChatDialog({ onClose, targetUserId, targetUserName }: ChatDialogProps) {
  const { user, isAdmin } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!user) return;

    let query = supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (isAdmin && targetUserId) {
      // Admin viewing specific user's chat
      query = query.or(`and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId})`);
    } else if (!isAdmin) {
      // Customer: show messages between them and any admin
      query = query.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
    }

    const { data } = await query;
    setMessages(data || []);

    // Mark received messages as read
    if (data && data.length > 0) {
      const unreadIds = data
        .filter(m => m.receiver_id === user.id && !m.is_read)
        .map(m => m.id);
      if (unreadIds.length > 0) {
        await supabase.from('chat_messages').update({ is_read: true }).in('id', unreadIds);
      }
    }
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('chat-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, targetUserId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || sending) return;
    setSending(true);

    const receiverId = isAdmin ? targetUserId : null;

    await supabase.from('chat_messages').insert({
      sender_id: user.id,
      receiver_id: receiverId,
      message: newMessage.trim(),
    });

    // Create notification for admin when customer sends a message
    if (!isAdmin) {
      // Notify all admins
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminRoles) {
        for (const admin of adminRoles) {
          await supabase.from('notifications').insert({
            user_id: admin.user_id,
            title: 'رسالة جديدة',
            body: `رسالة جديدة من عميل`,
            type: 'chat',
          });
        }
      }
    }

    setNewMessage('');
    setSending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-0 left-0 right-0 z-[80] mx-auto max-w-md"
      dir="rtl"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-t-2xl shadow-2xl flex flex-col" style={{ height: '60vh', maxHeight: '500px' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-zinc-800">
          <h3 className="text-white font-bold text-sm">
            {targetUserName ? `محادثة مع ${targetUserName}` : 'محادثة مع الإدارة'}
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.length === 0 && (
            <div className="text-center text-zinc-600 text-xs py-8">لا توجد رسائل بعد، ابدأ المحادثة</div>
          )}
          {messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                  isMine
                    ? 'bg-blue-600 text-white rounded-bl-sm'
                    : 'bg-zinc-800 text-zinc-100 rounded-br-sm'
                }`}>
                  {msg.message}
                  <div className={`text-[9px] mt-1 ${isMine ? 'text-blue-200' : 'text-zinc-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-zinc-800 flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اكتب رسالتك..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="w-9 h-9 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 rounded-xl flex items-center justify-center text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
