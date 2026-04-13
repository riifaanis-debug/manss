import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, LogOut, Menu, X, Users, MessageCircle, Image } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AdminCustomerData } from "@/components/admin/AdminCustomerData";
import { AdminCustomerFeedback } from "@/components/admin/AdminCustomerFeedback";
import { AdminCustomerMedia } from "@/components/admin/AdminCustomerMedia";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "لوحة الإدارة" },
      { name: "description", content: "لوحة التحكم للمسؤول" },
    ],
  }),
});

type AdminTab = "customers" | "feedback" | "media";

const TABS: { id: AdminTab; label: string; icon: typeof Users }[] = [
  { id: "customers", label: "بيانات العملاء", icon: Users },
  { id: "feedback", label: "ردود العملاء", icon: MessageCircle },
  { id: "media", label: "صور ومقاطع العملاء", icon: Image },
];

function AdminPage() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("customers");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate({ to: "/login" });
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">جاري التحميل...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-violet-600 to-indigo-700 p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center hover:bg-white/25 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <h1 className="text-lg font-bold">لوحة الإدارة</h1>
            </div>
          </div>
          <button
            onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-2 text-sm transition-all"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </div>

      <div className="flex relative">
        {/* Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-30 top-[60px]"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 200, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-[60px] bottom-0 w-64 bg-zinc-900 border-l border-zinc-800 z-40 p-4"
            >
              <nav className="space-y-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-violet-600 text-white"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 max-w-6xl mx-auto p-4 w-full">
          {activeTab === "customers" && <AdminCustomerData />}
          {activeTab === "feedback" && <AdminCustomerFeedback />}
          {activeTab === "media" && <AdminCustomerMedia />}
        </main>
      </div>
    </div>
  );
}
