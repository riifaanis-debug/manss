import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Image, Film, User } from "lucide-react";

interface MediaItem {
  id: string;
  user_id: string;
  name: string;
  file_url: string;
  file_type: string;
  caption: string | null;
  created_at: string;
}

export function AdminCustomerMedia() {
  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    supabase
      .from("customer_media")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setMedia(data as MediaItem[]);
      });
  }, []);

  // Group by user
  const grouped = media.reduce<Record<string, { name: string; items: MediaItem[] }>>(
    (acc, item) => {
      if (!acc[item.user_id]) {
        acc[item.user_id] = { name: item.name, items: [] };
      }
      acc[item.user_id].items.push(item);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
          <Image className="w-5 h-5 text-rose-400" />
        </div>
        <h2 className="text-lg font-bold">صور ومقاطع العملاء</h2>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
          لا توجد صور أو مقاطع حتى الآن
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([userId, group]) => (
            <div
              key={userId}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-rose-500/10 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-rose-400" />
                </div>
                <span className="font-bold text-sm">{group.name}</span>
                <span className="text-zinc-500 text-xs">({group.items.length} ملف)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {group.items.map((item) => (
                  <div key={item.id} className="relative group">
                    {item.file_type === "video" ? (
                      <div className="relative">
                        <video
                          src={item.file_url}
                          className="w-full h-32 object-cover rounded-xl border border-zinc-700"
                          controls
                        />
                        <div className="absolute top-2 left-2 bg-black/60 rounded-lg p-1">
                          <Film className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.file_url}
                        alt={item.caption || "صورة"}
                        className="w-full h-32 object-cover rounded-xl border border-zinc-700"
                      />
                    )}
                    {item.caption && (
                      <p className="text-zinc-400 text-[10px] mt-1 truncate">{item.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
