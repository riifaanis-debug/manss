import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ChatDialog } from '@/components/ChatDialog';
import { AnimatePresence } from 'motion/react';

export function AdminChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      // Get unique sender IDs from messages (customers who sent messages)
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('sender_id, message, created_at, is_read')
        .order('created_at', { ascending: false });

      if (!messages) { setLoading(false); return; }

      // Get unique user IDs (excluding admins)
      const userIds = [...new Set(messages.map(m => m.sender_id))];

      // Get names from submissions
      const { data: subs } = await supabase
        .from('submissions')
        .select('user_id, name')
        .in('user_id', userIds);

      const nameMap = new Map((subs || []).map(s => [s.user_id, s.name]));

      // Group by sender
      const convMap = new Map<string, any>();
      for (const msg of messages) {
        if (msg.sender_id === user?.id) continue; // skip admin's own messages
        if (!convMap.has(msg.sender_id)) {
          convMap.set(msg.sender_id, {
            userId: msg.sender_id,
            name: nameMap.get(msg.sender_id) || 'مستخدم',
            lastMessage: msg.message,
            lastTime: msg.created_at,
            unread: !msg.is_read,
          });
        }
      }

      setConversations(Array.from(convMap.values()));
      setLoading(false);
    };

    fetchConversations();

    const channel = supabase
      .channel('admin-chat-list')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <div className="space-y-3" dir="rtl">
      {loading ? (
        <div className="text-center text-zinc-500 py-8">جاري التحميل...</div>
      ) : conversations.length === 0 ? (
        <div className="text-center text-zinc-500 py-8">لا توجد محادثات</div>
      ) : (
        conversations.map(conv => (
          <button
            key={conv.userId}
            onClick={() => setSelectedUser({ id: conv.userId, name: conv.name })}
            className="w-full bg-zinc-800/60 rounded-xl p-4 text-right hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-zinc-100 font-medium text-sm flex items-center gap-2">
                  {conv.name}
                  {conv.unread && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                </div>
                <div className="text-zinc-500 text-xs mt-1 truncate max-w-[200px]">{conv.lastMessage}</div>
              </div>
              <div className="text-zinc-600 text-[10px]">
                {new Date(conv.lastTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </button>
        ))
      )}

      <AnimatePresence>
        {selectedUser && (
          <ChatDialog
            onClose={() => setSelectedUser(null)}
            targetUserId={selectedUser.id}
            targetUserName={selectedUser.name}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
