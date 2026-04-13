import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Star } from "lucide-react";

interface Submission {
  id: string;
  name: string;
  peek_feedback: any;
  created_at: string;
}

export function AdminCustomerFeedback() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    supabase
      .from("submissions")
      .select("id, name, peek_feedback, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setSubmissions(data as Submission[]);
      });
  }, []);

  const withFeedback = submissions.filter(
    (s) =>
      s.peek_feedback &&
      typeof s.peek_feedback === "object" &&
      !Array.isArray(s.peek_feedback) &&
      Object.keys(s.peek_feedback as Record<string, any>).length > 0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-emerald-400" />
        </div>
        <h2 className="text-lg font-bold">ردود العملاء</h2>
      </div>

      {withFeedback.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
          لا توجد ردود حتى الآن
        </div>
      ) : (
        <div className="space-y-3">
          {withFeedback.map((sub) => (
            <div
              key={sub.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 font-bold text-xs">
                    {sub.name.charAt(0)}
                  </div>
                  <span className="font-bold text-sm">{sub.name}</span>
                </div>
                <span className="text-zinc-500 text-xs">
                  {new Date(sub.created_at).toLocaleDateString("ar-SA")}
                </span>
              </div>

              <div className="space-y-2">
                {Object.entries(sub.peek_feedback as Record<string, any>).map(
                  ([key, val]: [string, any]) => (
                    <div key={key} className="bg-zinc-800 rounded-xl p-3 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-400">المقطع {parseInt(key) + 1}</span>
                        <span className="text-zinc-500">•</span>
                        <span>تقييم: {val?.rating}/10</span>
                      </div>
                      {val?.comment && (
                        <p className="text-zinc-400 mt-1 pr-5">{val.comment}</p>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
