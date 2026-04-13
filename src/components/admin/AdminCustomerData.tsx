import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Search } from "lucide-react";

interface Submission {
  id: string;
  user_id: string;
  name: string;
  age: string;
  city: string;
  district: string;
  snapchat: string;
  orientation: string;
  height: string | null;
  weight: string | null;
  body_appearance: string | null;
  his_size: string | null;
  her_size: string | null;
  created_at: string;
}

interface Profile {
  user_id: string;
  email: string | null;
}

export function AdminCustomerData() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [subsRes, profilesRes] = await Promise.all([
      supabase.from("submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, email"),
    ]);

    if (subsRes.data) setSubmissions(subsRes.data as Submission[]);
    if (profilesRes.data) {
      const map: Record<string, string> = {};
      (profilesRes.data as Profile[]).forEach((p) => {
        map[p.user_id] = p.email || "-";
      });
      setProfiles(map);
    }
  };

  const filtered = submissions.filter(
    (s) =>
      s.name.includes(search) ||
      s.city.includes(search) ||
      s.snapchat.includes(search) ||
      (profiles[s.user_id] || "").includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-lg font-bold">بيانات العملاء</h2>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="بحث بالاسم أو المدينة أو البريد..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-800/50 text-zinc-400 text-xs">
              <th className="p-3 text-right">البريد</th>
              <th className="p-3 text-right">النوع</th>
              <th className="p-3 text-right">الاسم</th>
              <th className="p-3 text-right">العمر</th>
              <th className="p-3 text-right">المدينة</th>
              <th className="p-3 text-right">الحي</th>
              <th className="p-3 text-right">الطول</th>
              <th className="p-3 text-right">الوزن</th>
              <th className="p-3 text-right">مظهر الجسم</th>
              <th className="p-3 text-right">حجمه</th>
              <th className="p-3 text-right">حجمها</th>
              <th className="p-3 text-right">سناب شات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-8 text-center text-zinc-500">
                  لا توجد بيانات
                </td>
              </tr>
            ) : (
              filtered.map((sub) => (
                <tr key={sub.id} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                  <td className="p-3 text-zinc-300">{profiles[sub.user_id] || "-"}</td>
                  <td className="p-3">{sub.orientation}</td>
                  <td className="p-3 font-medium">{sub.name}</td>
                  <td className="p-3">{sub.age}</td>
                  <td className="p-3">{sub.city}</td>
                  <td className="p-3">{sub.district}</td>
                  <td className="p-3">{sub.height || "-"}</td>
                  <td className="p-3">{sub.weight || "-"}</td>
                  <td className="p-3">{sub.body_appearance || "-"}</td>
                  <td className="p-3">{sub.his_size || "-"}</td>
                  <td className="p-3">{sub.her_size || "-"}</td>
                  <td className="p-3 text-violet-400">{sub.snapchat}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
