import { useState, useEffect } from 'react';
import { Coins, Plus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function AdminPoints() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [bonusPoints, setBonusPoints] = useState('');
  const [bonusReason, setBonusReason] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const { data: subs } = await supabase.from('submissions').select('user_id, name, snapchat');
    if (!subs) { setLoading(false); return; }

    const { data: allPoints } = await supabase.from('user_points').select('user_id, points');

    const userMap = new Map<string, { name: string; snapchat: string; total: number }>();
    for (const s of subs) {
      if (!userMap.has(s.user_id)) {
        userMap.set(s.user_id, { name: s.name, snapchat: s.snapchat, total: 0 });
      }
    }
    for (const p of (allPoints || [])) {
      const u = userMap.get(p.user_id);
      if (u) u.total += p.points;
    }

    setUsers(Array.from(userMap.entries()).map(([id, data]) => ({ id, ...data })));
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const addBonus = async (userId: string) => {
    const pts = parseInt(bonusPoints);
    if (!pts || pts <= 0) return;
    await supabase.from('user_points').insert({
      user_id: userId,
      points: pts,
      reason: bonusReason || 'مكافأة من الإدارة',
    });
    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'مكافأة نقاط! 🪙',
      body: `حصلت على ${pts} نقطة ذهبية${bonusReason ? ': ' + bonusReason : ''}`,
      type: 'points',
    });
    setBonusPoints('');
    setBonusReason('');
    setAddingFor(null);
    fetchUsers();
  };

  const filtered = users.filter(u =>
    u.name.includes(search) || u.snapchat.includes(search)
  );

  return (
    <div className="space-y-4" dir="rtl">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو سناب شات..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pr-10 pl-4 py-2.5 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        />
      </div>

      {loading ? (
        <div className="text-center text-zinc-500 py-8">جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-zinc-500 py-8">لا توجد نتائج</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <div key={u.id} className="bg-zinc-800/60 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-zinc-100 font-medium text-sm">{u.name}</div>
                  <div className="text-zinc-500 text-xs">@{u.snapchat}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-amber-600/20 text-amber-400 px-3 py-1 rounded-full">
                    <Coins className="w-3.5 h-3.5" />
                    <span className="text-sm font-bold">{u.total}</span>
                  </div>
                  <button
                    onClick={() => setAddingFor(addingFor === u.id ? null : u.id)}
                    className="w-8 h-8 bg-violet-600 hover:bg-violet-500 rounded-lg flex items-center justify-center text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {addingFor === u.id && (
                <div className="mt-3 pt-3 border-t border-zinc-700 space-y-2">
                  <input
                    type="number"
                    value={bonusPoints}
                    onChange={(e) => setBonusPoints(e.target.value)}
                    placeholder="عدد النقاط"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={bonusReason}
                    onChange={(e) => setBonusReason(e.target.value)}
                    placeholder="السبب (اختياري)"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none"
                  />
                  <button
                    onClick={() => addBonus(u.id)}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white rounded-lg py-2 text-sm font-bold transition-colors"
                  >
                    إضافة نقاط مكافأة
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
