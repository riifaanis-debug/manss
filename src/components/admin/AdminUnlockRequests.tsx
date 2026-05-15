import { useEffect, useState } from "react";
import { Unlock, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Req {
  id: string;
  user_id: string;
  user_name: string | null;
  proof_video_url: string;
  status: string;
  created_at: string;
}

export function AdminUnlockRequests() {
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("video_unlock_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setRequests(data as Req[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
    const channel = supabase
      .channel("admin-unlock")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "video_unlock_requests" },
        () => fetchRequests()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, status: "approved" | "rejected", userId: string) => {
    await supabase
      .from("video_unlock_requests")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    await supabase.from("notifications").insert({
      user_id: userId,
      title: status === "approved" ? "✅ تم قبول طلبك" : "❌ تم رفض طلبك",
      body: status === "approved" ? "يمكنك الآن متابعة المشاهدة" : "يرجى إرفاق فيديو جديد",
      type: "unlock_response",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
          <Unlock className="w-5 h-5 text-amber-400" />
        </div>
        <h2 className="text-lg font-bold">طلبات فتح المشاهدات</h2>
        <span className="ml-auto text-xs text-zinc-500">{requests.length}</span>
      </div>

      {loading ? (
        <div className="text-center text-zinc-500 py-8">جاري التحميل...</div>
      ) : requests.length === 0 ? (
        <div className="text-center text-zinc-500 py-10 bg-zinc-900/40 rounded-xl border border-zinc-800">
          لا توجد طلبات
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{r.user_name || "مستخدم"}</h3>
                  <p className="text-[11px] text-zinc-500">{new Date(r.created_at).toLocaleString("ar")}</p>
                </div>
                <span
                  className={`text-[11px] px-2 py-1 rounded-full font-bold ${
                    r.status === "approved"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : r.status === "rejected"
                      ? "bg-rose-500/15 text-rose-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}
                >
                  {r.status === "approved" ? "موافق عليه" : r.status === "rejected" ? "مرفوض" : "قيد المراجعة"}
                </span>
              </div>

              <video
                src={r.proof_video_url}
                controls
                className="w-full max-h-60 rounded-xl bg-black"
              />

              {r.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(r.id, "approved", r.user_id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2.5 text-sm font-bold transition-colors"
                  >
                    <Check className="w-4 h-4" /> موافقة
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, "rejected", r.user_id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl py-2.5 text-sm font-bold transition-colors"
                  >
                    <X className="w-4 h-4" /> رفض
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
