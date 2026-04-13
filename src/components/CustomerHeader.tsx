import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Bell, MessageCircle, LogOut, User, Coins, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from '@tanstack/react-router';
import { ProfileSidebar } from './ProfileSidebar';
import { ChatDialog } from './ChatDialog';
import { NotificationsDropdown } from './NotificationsDropdown';

export function CustomerHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      const { count: msgCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      setUnreadMessages(msgCount || 0);

      const { count: notifCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnreadNotifs(notifCount || 0);
    };

    fetchUnread();

    const msgChannel = supabase
      .channel('header-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, () => fetchUnread())
      .subscribe();

    const notifChannel = supabase
      .channel('header-notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => fetchUnread())
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(notifChannel);
    };
  }, [user]);

  if (!user) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 py-2 bg-black/60 backdrop-blur-md" dir="rtl">
        {/* Right: Menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Left: icons */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button
            onClick={() => { setNotifOpen(!notifOpen); setChatOpen(false); }}
            className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifs > 9 ? '9+' : unreadNotifs}
              </span>
            )}
          </button>

          {/* Chat */}
          <button
            onClick={() => { setChatOpen(!chatOpen); setNotifOpen(false); }}
            className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            {unreadMessages > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={async () => { await signOut(); navigate({ to: '/login' }); }}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile Sidebar */}
      <ProfileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Chat Dialog */}
      <AnimatePresence>
        {chatOpen && <ChatDialog onClose={() => setChatOpen(false)} />}
      </AnimatePresence>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {notifOpen && <NotificationsDropdown onClose={() => setNotifOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
