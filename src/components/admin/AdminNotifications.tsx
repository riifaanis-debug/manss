import { useState, useEffect } from 'react';
import { Bell, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function AdminNotifications() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('submissions').select('user_id, name');
      if (data) {
        const unique = Array.from(new Map(data.map(d => [d.user_id, d])).values());
        setUsers(unique);
      }
    };
    fetchUsers();
  }, []);

  const sendNotification = async () => {
    if (!selectedUser || !title.trim()) return;
    setSending(true);
    await supabase.from('notifications').insert({
      user_id: selectedUser,
      title: title.trim(),
      body: body.trim(),
      type: 'admin',
    });
    setSending(false);
    setSent(true);
    setTitle('');
    setBody('');
    setTimeout(() => setSent(false), 3000);
  };

  const sendToAll = async () => {
    if (!title.trim()) return;
    setSending(true);
    const inserts = users.map(u => ({
      user_id: u.user_id,
      title: title.trim(),
      body: body.trim(),
      type: 'admin',
    }));
    await supabase.from('notifications').insert(inserts);
    setSending(false);
    setSent(true);
    setTitle('');
    setBody('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="space-y-4 max-w-md" dir="rtl">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-amber-400" />
        <h3 className="text-white font-bold">إرسال إشعار</h3>
      </div>

      <select
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none"
      >
        <option value="">اختر المستخدم...</option>
        {users.map(u => (
          <option key={u.user_id} value={u.user_id}>{u.name}</option>
        ))}
      </select>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="عنوان الإشعار"
        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
      />

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="نص الإشعار (اختياري)"
        rows={3}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
      />

      <div className="flex gap-2">
        <button
          onClick={sendNotification}
          disabled={!selectedUser || !title.trim() || sending}
          className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 text-white rounded-xl py-2.5 text-sm font-bold transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          إرسال لمستخدم
        </button>
        <button
          onClick={sendToAll}
          disabled={!title.trim() || sending}
          className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-white rounded-xl py-2.5 text-sm font-bold transition-colors"
        >
          إرسال للجميع
        </button>
      </div>

      {sent && (
        <div className="text-emerald-400 text-sm text-center bg-emerald-500/10 rounded-xl p-3">
          تم إرسال الإشعار بنجاح ✓
        </div>
      )}
    </div>
  );
}
