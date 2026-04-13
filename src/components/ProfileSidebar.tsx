import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, MapPin, Calendar, Ruler, Weight, Sparkles, Heart, Coins, Ghost } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ProfileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileSidebar({ open, onClose }: ProfileSidebarProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !open) return;

    const fetchData = async () => {
      setLoading(true);

      // Get submission (profile data)
      const { data: sub } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setProfile(sub);

      // Get total points
      const { data: points } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', user.id);

      const total = (points || []).reduce((sum, p) => sum + p.points, 0);
      setTotalPoints(total);

      setLoading(false);
    };

    fetchData();
  }, [user, open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-[300px] max-w-[85vw] bg-zinc-900 border-l border-zinc-800 overflow-y-auto"
            dir="rtl"
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">ملفي الشخصي</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-zinc-500 text-sm">جاري التحميل...</div>
            ) : (
              <div className="p-4 space-y-5">
                {/* Points Card */}
                <div className="bg-gradient-to-l from-amber-600 to-yellow-500 rounded-2xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Coins className="w-6 h-6 text-yellow-100" />
                    <span className="text-yellow-100 text-sm font-bold">جنيهاتي الذهبية</span>
                  </div>
                  <div className="text-3xl font-black text-white">{totalPoints}</div>
                  <div className="text-yellow-200 text-xs mt-1">نقطة</div>
                </div>

                {/* Profile Data */}
                {profile ? (
                  <div className="space-y-3">
                    <ProfileRow icon={<User className="w-4 h-4 text-blue-400" />} label="الاسم" value={profile.name} />
                    <ProfileRow icon={<Calendar className="w-4 h-4 text-emerald-400" />} label="العمر" value={profile.age} />
                    <ProfileRow icon={<Heart className="w-4 h-4 text-rose-400" />} label="النوع" value={profile.orientation} />
                    <ProfileRow icon={<MapPin className="w-4 h-4 text-amber-400" />} label="المدينة" value={profile.city} />
                    <ProfileRow icon={<MapPin className="w-4 h-4 text-cyan-400" />} label="الحي" value={profile.district} />
                    <ProfileRow icon={<Ruler className="w-4 h-4 text-indigo-400" />} label="الطول" value={profile.height ? `${profile.height} سم` : '-'} />
                    <ProfileRow icon={<Weight className="w-4 h-4 text-violet-400" />} label="الوزن" value={profile.weight ? `${profile.weight} كجم` : '-'} />
                    <ProfileRow icon={<Sparkles className="w-4 h-4 text-pink-400" />} label="المظهر" value={profile.body_appearance || '-'} />
                    <ProfileRow icon={<Ghost className="w-4 h-4 text-yellow-400" />} label="سناب شات" value={profile.snapchat} />
                  </div>
                ) : (
                  <div className="text-center text-zinc-500 text-sm py-6">لم يتم العثور على بيانات الملف الشخصي</div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 bg-zinc-800/60 rounded-xl px-3 py-2.5">
      {icon}
      <div className="flex-1">
        <div className="text-zinc-500 text-[10px]">{label}</div>
        <div className="text-zinc-100 text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
