import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Search, Copy, Check } from "lucide-react";

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
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const buildText = (sub: Submission) => {
    const lines = [
      `البريد: ${profiles[sub.user_id] || "-"}`,
      `الاسم: ${sub.name}`,
      `العمر: ${sub.age}`,
      `النوع/الميول: ${sub.orientation}`,
      `المدينة: ${sub.city}`,
      `الحي: ${sub.district}`,
      `الطول: ${sub.height || "-"}`,
      `الوزن: ${sub.weight || "-"}`,
      `مظهر الجسم: ${sub.body_appearance || "-"}`,
      `حجمه: ${sub.his_size || "-"}`,
      `حجمها: ${sub.her_size || "-"}`,
      `سناب شات: ${sub.snapchat}`,
      `تاريخ التسجيل: ${new Date(sub.created_at).toLocaleString("ar")}`,
    ];
    return lines.join("\n");
  };

  const copyCard = async (sub: Submission) => {
    try {
      await navigator.clipboard.writeText(buildText(sub));
      setCopiedId(sub.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const Field = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-zinc-800/50 last:border-0">
      <span className="text-[11px] text-zinc-500 font-medium shrink-0">{label}</span>
      <span className={`text-sm ${accent ? "text-violet-400" : "text-zinc-100"} text-left break-all`}>
        {value || "-"}
      </span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-lg font-bold">بيانات العملاء</h2>
        <span className="ml-auto text-xs text-zinc-500">{filtered.length} عميل</span>
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

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-zinc-500 bg-zinc-900/40 rounded-xl border border-zinc-800">
            لا توجد بيانات
          </div>
        ) : (
          filtered.map((sub) => (
            <div
              key={sub.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-1 hover:border-violet-600/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{sub.name}</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {new Date(sub.created_at).toLocaleString("ar")}
                  </p>
                </div>
                <button
                  onClick={() => copyCard(sub)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copiedId === sub.id
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-violet-500/15 text-violet-300 hover:bg-violet-500/25"
                  }`}
                >
                  {copiedId === sub.id ? (
                    <><Check className="w-3.5 h-3.5" /> تم النسخ</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> نسخ البيانات</>
                  )}
                </button>
              </div>

              <Field label="البريد" value={profiles[sub.user_id] || "-"} />
              <Field label="العمر" value={sub.age} />
              <Field label="النوع / الميول" value={sub.orientation} />
              <Field label="المدينة" value={sub.city} />
              <Field label="الحي" value={sub.district} />
              <Field label="الطول" value={sub.height || "-"} />
              <Field label="الوزن" value={sub.weight || "-"} />
              <Field label="مظهر الجسم" value={sub.body_appearance || "-"} />
              <Field label="حجمه" value={sub.his_size || "-"} />
              <Field label="حجمها" value={sub.her_size || "-"} />
              <Field label="سناب شات" value={sub.snapchat} accent />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
