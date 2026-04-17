import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, type ReactNode, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, MapPin, Calendar, Weight, Ruler, Sparkles, Heart, Camera, X, 
  ChevronLeft, ChevronRight, ChevronDown, Send, MessageCircle, Map as MapIcon,
  Mic, Play, Pause, Volume2, Upload, Ghost, AlertCircle, CheckCircle, LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CustomerHeader } from '@/components/CustomerHeader';

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "بإختصار من أنا - منصور" },
      { name: "description", content: "صفحة شخصية تفاعلية تعرض نبذة عن منصور، معرض صور، ووسائل التواصل." },
    ],
  }),
});

const SAUDI_CITIES = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", 
  "تبوك", "الطائف", "الخبر", "أبها", "حائل", "جازان", 
  "نجران", "الباحة", "الجوف", "عرعر", "القصيم", "ينبع"
];

const ORIENTATION_OPTIONS = ["موجب", "سالب تبادلي", "تبادلي"];

const GALLERY_IMAGES = [
  "https://l.top4top.io/p_3753f0ctf1.jpg",
  "https://k.top4top.io/p_3753o9q3b1.jpg",
  "https://j.top4top.io/p_3753k1d8z1.jpg",
  "https://a.top4top.io/p_3753j5pjm1.jpg",
  "https://b.top4top.io/p_3753oij901.jpg",
  "https://d.top4top.io/p_37530tt8z1.jpg",
  "https://c.top4top.io/p_3753ie34w1.jpg",
];

const PEEK_VIDEOS = [
  "/videos/peek-01.mp4",
  "/videos/peek-02.mp4",
  "/videos/peek-03.mp4",
  "/videos/peek-04.mp4",
  "/videos/peek-05.mp4",
  "/videos/peek-06.mp4",
  "/videos/peek-07.mp4",
  "/videos/peek-08.mp4",
  "/videos/peek-09.mp4",
  "/videos/peek-10.mp4",
  "/videos/peek-11.mp4",
  "/videos/peek-12.mp4",
  "/videos/peek-13.mp4",
  "/videos/peek-14.mp4",
];

const POSITIVE_KEYWORDS = [
  "واو", "جميل", "حلو", "حماس", "روعة", "مبدع", "ما شاء الله", 
  "يجنن", "رهيب", "فنان", "كفو", "بطل", "ممتاز", "رائع", "احبك", "قلبي"
];

function Index() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navTo = useNavigate();

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [formData, setFormData] = useState({
    name: '', age: '', city: '', district: '', snapchat: '', orientation: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [peekFeedback, setPeekFeedback] = useState<Record<number, { rating: number; comment: string }>>({});

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error("Audio play failed:", err);
          showToast("عذراً، لا يمكن تشغيل الصوت في هذا المتصفح", "error");
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'age') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const isFormValid = 
    formData.name.trim() !== '' && 
    formData.age.trim() !== '' && 
    formData.city.trim() !== '' && 
    formData.district.trim() !== '' && 
    formData.snapchat.trim() !== '' && 
    formData.orientation.trim() !== '' &&
    selectedFile !== null;

  const getTelegramUrl = () => {
    let feedbackText = "";
    Object.entries(peekFeedback).forEach(([index, data]) => {
      feedbackText += `\nالمقطع ${parseInt(index) + 1}: تقييم ${data.rating}/10 - تعليق: ${data.comment || 'بدون تعليق'}`;
    });

    const message = `هلا والله منصور 🩷
شفت صفحة " بإختصار من أنا "
وعرفت كل شي عنك وشفت صورك ومقاطعك
وحتى صوتك سمعته 

وهذي بياناتي وبإختصار من أنا

الاسم: ${formData.name || 'لم يذكر'}
العمر: ${formData.age || 'لم يذكر'}
المدينة: ${formData.city || 'لم يذكر'}
الحي: ${formData.district || 'لم يذكر'}
حساب سناب شات: ${formData.snapchat || 'لم يذكر'}
الميول: ${formData.orientation || 'لم يذكر'}
${feedbackText ? `\nتقييماتي للنظرة الخاطفة:${feedbackText}` : ''}

مع المرفق الصوره`;

    return `https://t.me/Who_yoou?text=${encodeURIComponent(message)}`;
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGalleryOpen) return;
      if (e.key === 'ArrowRight') prevImage();
      if (e.key === 'ArrowLeft') nextImage();
      if (e.key === 'Escape') setIsGalleryOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryOpen]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navTo({ to: '/login' });
    }
  }, [authLoading, user, navTo]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center pb-20">
      {/* Customer Header */}
      <CustomerHeader />
      <div className="h-12" /> {/* Spacer for fixed header */}
      {/* Hero Section */}
      <header className="w-full aspect-square md:aspect-video md:h-[60vh] relative flex items-center justify-center overflow-hidden bg-zinc-900">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <video 
            src="/hero-video.mp4"
            autoPlay loop muted playsInline
            className="w-full h-full object-cover pointer-events-none"
            style={{ filter: 'brightness(0.8)' }}
          />
        </motion.div>
        
        <div className="relative z-10 text-center px-4">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight"
          >
            بإختصار من أنا
          </motion.h1>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="h-1 w-24 bg-amber-500 mx-auto rounded-full"
          />
        </div>
      </header>

      <main className="max-w-4xl w-full px-3 md:px-6 -mt-24 md:-mt-32 relative z-20 space-y-5 md:space-y-8">
        
        {/* Section 1: Personal Profile */}
        <motion.section 
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-zinc-200/50 p-4 md:p-8 border border-zinc-100"
        >
          <div className="flex items-center gap-2 mb-6 md:mb-8">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <User size={22} />
            </div>
            <h2 className="text-xl font-bold text-zinc-800">نبذة شخصية</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
            <div className="space-y-4 md:space-y-6">
              <ProfileItem icon={<div className="p-2 bg-blue-50 rounded-xl text-blue-600"><User size={18} /></div>} label="الاسم" value="منصور" />
              <ProfileItem icon={<div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><MapPin size={18} /></div>} label="الموقع" value="من الدمام / وزائر جده - حي التيسير" />
              <ProfileItem icon={<div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Calendar size={18} /></div>} label="العمر" value="24 سنة" />
            </div>
            <div className="space-y-4 md:space-y-6">
              <ProfileItem icon={<div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Weight size={18} /></div>} label="الوزن" value="58 كجم" />
              <ProfileItem icon={<div className="p-2 bg-cyan-50 rounded-xl text-cyan-600"><Ruler size={18} /></div>} label="الطول" value="164 سم" />
              <ProfileItem icon={<div className="p-2 bg-rose-50 rounded-xl text-rose-600"><Sparkles size={18} /></div>} label="المظهر" value="ناعم فيس وجسم" />
              <ProfileItem icon={<div className="p-2 bg-red-50 rounded-xl text-red-600"><Heart size={18} /></div>} label="الميول" value="سالب تبادلي" />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-50">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="text-rose-500 fill-rose-500" size={18} />
              <h3 className="font-semibold text-zinc-700 text-sm md:text-base">الاهتمامات</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-full text-xs font-medium">المواعدة</span>
              <span className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">المرح</span>
              <span className="px-3 py-1.5 bg-sky-50 text-sky-600 rounded-full text-xs font-medium">تكوين صداقات</span>
            </div>
          </div>
        </motion.section>

        {/* Section 2: Peek at Me */}
        <InteractivePeekSection 
          onFeedbackUpdate={async (index, rating, comment) => {
            setPeekFeedback(prev => ({ ...prev, [index]: { rating, comment } }));
            // Award 53 points for rating
            if (rating > 0 && user) {
              await supabase.from('user_points').insert({
                user_id: user.id,
                points: 53,
                reason: `تقييم المقطع ${index + 1}`,
              }).then(() => {});
            }
          }}
        />

        {/* Section: Catch Eyes - Upload Media */}
        <MediaUploadSection user={user} />

        {/* Section: Listen to my voice */}
        <motion.section 
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-zinc-200/50 p-4 md:p-6 border border-zinc-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <Mic size={18} />
            </div>
            <h2 className="text-lg font-bold text-zinc-800">استمع الى صوتي</h2>
          </div>

          <div className="bg-zinc-50 rounded-2xl p-4 flex flex-col items-center gap-3">
            <audio 
              ref={audioRef} 
              src="/audio/voice-message.m4a" 
              preload="auto"
              onEnded={() => setIsPlaying(false)}
            />
            
            <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center shadow-lg shadow-zinc-200 relative">
              {isPlaying && (
                <motion.div 
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 bg-zinc-900 rounded-full"
                />
              )}
              <button 
                onClick={toggleAudio}
                className="relative z-10 w-full h-full flex items-center justify-center text-white transition-transform active:scale-90"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="mr-0.5" />}
              </button>
            </div>

            <div className="text-center">
              <p className="font-bold text-zinc-800 text-sm mb-0.5">رسالة صوتية من منصور</p>
              <div className="flex items-center justify-center gap-2 text-zinc-400 text-[10px]">
                <Volume2 size={12} />
                <span>اضغط للتشغيل فوراً</span>
              </div>
            </div>

            <div className="flex items-center gap-1 h-6 mt-1">
              {[...Array(12)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={isPlaying ? { height: [6, 18, 10, 22, 8][i % 5] } : { height: 6 }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                  className="w-1 bg-zinc-200 rounded-full"
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* Section: Final Contact CTA */}
        <motion.section 
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="bg-zinc-900 rounded-2xl md:rounded-3xl p-5 md:p-10 text-center text-white overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 blur-3xl rounded-full -mr-24 -mt-24" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full -ml-24 -mb-24" />
          
          <div className="relative z-10">
            <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
              <Heart size={24} className="text-rose-400" fill="currentColor" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-3">المواعدة والتواصل</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">
              إذا كنت تبحث عن علاقة حقيقية وانسجام تام، يسعدني أن نبدأ بالتواصل.
            </p>
            <button 
              onClick={() => setIsContactModalOpen(true)}
              className="group relative px-6 py-3.5 bg-rose-500 text-white rounded-2xl font-bold text-sm md:text-base transition-all hover:scale-105 active:scale-95 shadow-xl shadow-rose-500/20 flex items-center justify-center gap-2 mx-auto"
            >
              <MessageCircle size={18} />
              اضغط هنا وإبدأ بالقردنه 😉
            </button>
          </div>
        </motion.section>
      </main>

      {/* Contact Modal */}
      <AnimatePresence>
        {isContactModalOpen && (
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
              className="bg-white w-full max-w-md rounded-3xl overflow-y-auto max-h-[90vh] shadow-2xl relative"
            >
              <button 
                onClick={() => setIsContactModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-zinc-100 rounded-full text-zinc-500 hover:bg-zinc-200 transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="p-5 md:p-8">
                <div className="flex items-center justify-end gap-3 mb-8">
                  <h2 className="text-2xl font-bold text-zinc-800">المواعدة والتواصل</h2>
                  <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500">
                    <MessageCircle size={28} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <ContactField icon={<User size={16} className="text-zinc-400" />} label="الاسم" name="name" value={formData.name} onChange={handleInputChange} placeholder="أدخل اسمك..." />
                  <ContactField icon={<Calendar size={16} className="text-zinc-400" />} label="العمر" name="age" value={formData.age} onChange={handleInputChange} placeholder="أرقام فقط..." type="text" inputMode="numeric" />
                  <SelectField icon={<MapPin size={16} className="text-zinc-400" />} label="المدينة" name="city" value={formData.city} onChange={handleInputChange} options={SAUDI_CITIES} placeholder="اختر المدينة..." />
                  <ContactField icon={<MapIcon size={16} className="text-zinc-400" />} label="الحي" name="district" value={formData.district} onChange={handleInputChange} placeholder="اكتب اسم الحي..." />
                  <ContactField icon={<Ghost size={16} className="text-amber-500" />} label="حساب سناب شات" name="snapchat" value={formData.snapchat} onChange={handleInputChange} placeholder="اسم المستخدم..." />
                  <SelectField icon={<Heart size={16} className="text-rose-500" />} label="الميول" name="orientation" value={formData.orientation} onChange={handleInputChange} options={ORIENTATION_OPTIONS} placeholder="اختر الميول..." />
                  
                  <div className="md:col-span-2">
                    <FileField icon={<Upload size={16} className="text-zinc-400" />} label="صورة توضح الميول" onFileSelect={setSelectedFile} />
                  </div>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={async (e) => {
                      if (!isFormValid) {
                        showToast('يرجى ملء جميع الحقول وإرفاق الصورة أولاً', 'error');
                        return;
                      }
                      
                      try {
                        // Upload image
                        let imageUrl: string | null = null;
                        if (selectedFile && user) {
                          const fileExt = selectedFile.name.split('.').pop();
                          const filePath = `${user.id}/${Date.now()}.${fileExt}`;
                          const { error: uploadError } = await supabase.storage
                            .from('attachments')
                            .upload(filePath, selectedFile);
                          if (!uploadError) {
                            const { data: urlData } = supabase.storage
                              .from('attachments')
                              .getPublicUrl(filePath);
                            imageUrl = urlData.publicUrl;
                          }
                        }

                        // Save submission
                        const { error: subError } = await supabase.from('submissions').insert({
                          user_id: user!.id,
                          name: formData.name,
                          age: formData.age,
                          city: formData.city,
                          district: formData.district,
                          snapchat: formData.snapchat,
                          orientation: formData.orientation,
                          image_url: imageUrl,
                          peek_feedback: peekFeedback,
                        });

                        if (subError) throw subError;

                        // Award 53 points for interaction
                        await supabase.from('user_points').insert({
                          user_id: user!.id,
                          points: 53,
                          reason: 'تفاعل وتواصل',
                        });

                        // Open Telegram
                        window.open(getTelegramUrl(), '_blank');
                        showToast('تم حفظ بياناتك بنجاح! +53 نقطة ذهبية 🪙', 'success');
                        setTimeout(() => setIsContactModalOpen(false), 100);
                      } catch (err) {
                        console.error(err);
                        showToast('حدث خطأ أثناء الحفظ', 'error');
                      }
                    }}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm md:text-base transition-all flex items-center justify-center gap-3 ${
                      isFormValid 
                        ? 'bg-zinc-900 text-white hover:bg-zinc-800 active:scale-95 shadow-lg shadow-zinc-200' 
                        : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    <Send size={18} />
                    بدأ التواصل والانسجام
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Modal */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
          >
            <button 
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110]"
            >
              <X size={32} />
            </button>

            <div className="relative w-full max-w-[370px] aspect-[370/501] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentImageIndex}
                  src={GALLERY_IMAGES[currentImageIndex]}
                  initial={{ opacity: 0, scale: 0.9, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 1.1, x: -20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="w-full h-full object-cover rounded-xl shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>

              <button onClick={prevImage} className="absolute left-2 md:left-4 p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all">
                <ChevronLeft size={24} />
              </button>
              <button onClick={nextImage} className="absolute right-2 md:right-4 p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all">
                <ChevronRight size={24} />
              </button>

              <div className="absolute bottom-[-40px] flex gap-2">
                {GALLERY_IMAGES.map((_, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-8 bg-amber-400' : 'w-2 bg-white/20'}`} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-12 text-zinc-400 text-sm">
        جميع الحقوق محفوظة © {new Date().getFullYear()} - منصور
      </footer>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3"
            style={{ 
              backgroundColor: toast.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(24, 24, 27, 0.9)',
              color: 'white'
            }}
          >
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <span className="text-sm font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InteractivePeekSection({ onFeedbackUpdate }: { onFeedbackUpdate: (index: number, rating: number, comment: string) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoState, setVideoState] = useState<'idle' | 'playing' | 'feedback'>('idle');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setVideoState('playing');
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.error("Video play failed:", err));
    }
  };

  const handleEnded = () => setVideoState('feedback');

  const handleRatingClick = (val: number) => {
    setRating(val);
    onFeedbackUpdate(currentIndex, val, comment);
  };

  const handleCommentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setComment(val);
    onFeedbackUpdate(currentIndex, rating, val);
    const isPositive = POSITIVE_KEYWORDS.some(keyword => val.includes(keyword));
    if (isPositive && currentIndex < PEEK_VIDEOS.length - 1) {
      setTimeout(() => handleNext(), 1000);
    }
  };

  const handleNext = () => {
    if (currentIndex < PEEK_VIDEOS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setVideoState('idle');
      setRating(0);
      setComment('');
    }
  };

  return (
    <motion.section 
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="bg-zinc-900 rounded-2xl md:rounded-3xl p-4 md:p-10 text-white overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full -mr-24 -mt-24" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/10 blur-3xl rounded-full -ml-24 -mb-24" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6 px-2 md:px-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <Camera size={20} className="text-amber-400" />
            </div>
            <h2 className="text-xl font-bold">نظرة خاطفة عني</h2>
          </div>
          <div className="text-xs font-mono text-zinc-500 bg-white/5 px-2 py-1 rounded">
            {currentIndex + 1} / {PEEK_VIDEOS.length}
          </div>
        </div>

        <div className="relative aspect-video bg-black rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-white/5 -mx-4 md:mx-0">
          <video 
            key={currentIndex}
            ref={videoRef}
            src={PEEK_VIDEOS[currentIndex]}
            onEnded={handleEnded}
            playsInline
            className={`w-full h-full object-cover ${videoState === 'playing' ? 'opacity-100' : 'opacity-40'}`}
          />

          {videoState === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <button onClick={handlePlay} className="group flex flex-col items-center gap-3 transition-transform active:scale-95">
                <div className="w-16 h-16 bg-white text-zinc-900 rounded-full flex items-center justify-center shadow-2xl group-hover:bg-amber-400 transition-colors">
                  <Play size={28} fill="currentColor" className="ml-1" />
                </div>
                <span className="text-sm font-bold tracking-wide">المس هنا لتشاهد</span>
              </button>
            </div>
          )}

          {videoState === 'playing' && (
            <div className="absolute top-4 right-4">
              <div className="px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-widest text-white/80 border border-white/10">
                Live Preview
              </div>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {videoState === 'feedback' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 space-y-6"
            >
              <div className="space-y-3">
                <p className="text-sm font-medium text-zinc-400 text-center">ما هو تقييمك لهذا المقطع؟</p>
                <div className="flex items-center justify-between gap-1 max-w-sm mx-auto">
                  {[...Array(10)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleRatingClick(i + 1)}
                      className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all ${
                        rating >= i + 1 
                          ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20' 
                          : 'bg-white/5 text-zinc-500 hover:bg-white/10'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-zinc-400 text-right">عبر عن شعورك الداخلي تجاه ما شاهدت</p>
                <p className="text-[11px] text-rose-500 text-right font-medium leading-relaxed">
                  ملاحظة : هذه الخاصية تستخدم الذكائي الاصطناعي العاطفي 
                  في حال كان النص المكتوب يعبر عن احساس ومشاعر وانجذاب ورغبه صادقه ، سيحلل النظام ذلك وسوف يسمح لك بمشاهذته فديو اخر
                </p>
                <textarea 
                  value={comment}
                  onChange={handleCommentChange}
                  placeholder="اكتب هنا..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all min-h-[100px] resize-none text-right"
                  dir="rtl"
                />
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-white text-zinc-900 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-all flex items-center gap-2"
                >
                  قيم شعوري تجاه طيزه
                  <ChevronLeft size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

function ProfileItem({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-3 md:gap-4">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">{label}</p>
        <div className="text-base md:text-lg font-medium text-zinc-800 leading-tight">{value}</div>
      </div>
    </div>
  );
}

function ContactField({ 
  icon, label, placeholder, name, value, onChange, type = "text", inputMode, required = true
}: { 
  icon: ReactNode; label: string; placeholder: string; name?: string; value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void; type?: string;
  inputMode?: "text" | "numeric" | "tel" | "search" | "email" | "url" | "decimal" | "none";
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] md:text-xs font-bold text-zinc-500 flex items-center gap-2">
        {icon} {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input 
        type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        inputMode={inputMode} required={required}
        className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all text-xs md:text-sm text-zinc-800 placeholder:text-zinc-300"
      />
    </div>
  );
}

function SelectField({ 
  icon, label, options, placeholder, name, value, onChange, required = true
}: { 
  icon: ReactNode; label: string; options: string[]; placeholder: string;
  name?: string; value?: string; onChange?: (e: ChangeEvent<HTMLSelectElement>) => void; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] md:text-xs font-bold text-zinc-500 flex items-center gap-2">
        {icon} {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <select 
          name={name} value={value} onChange={onChange} required={required}
          className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all text-xs md:text-sm text-zinc-800 appearance-none pr-4 pl-10"
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
}

function FileField({ icon, label, onFileSelect, required = true }: { icon: ReactNode; label: string; onFileSelect?: (file: File | null) => void; required?: boolean }) {
  const [fileName, setFileName] = useState<string | null>(null);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      if (onFileSelect) onFileSelect(file);
    } else {
      setFileName(null);
      if (onFileSelect) onFileSelect(null);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] md:text-xs font-bold text-zinc-500 flex items-center gap-2">
        {icon} {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative group">
        <input 
          type="file" accept="image/*,video/*,application/pdf"
          onChange={handleFileChange} required={required}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="w-full px-3 py-2.5 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl flex items-center justify-between group-hover:border-zinc-400 transition-all">
          <span className="text-[11px] md:text-xs text-zinc-400 truncate max-w-[80%]">
            {fileName || "ارفق صورة أو فيديو أو PDF..."}
          </span>
          <Upload size={18} className="text-zinc-300 group-hover:text-zinc-500" />
        </div>
      </div>
    </div>
  );
}

function MediaUploadSection({ user }: { user: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("customer-media")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("customer-media")
        .getPublicUrl(path);

      const fileType = file.type.startsWith("video") ? "video" : "image";

      // Get user name from submissions
      const { data: sub } = await supabase
        .from("submissions")
        .select("name")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      await supabase.from("customer_media").insert({
        user_id: user.id,
        name: sub?.name || user.email || "مجهول",
        file_url: urlData.publicUrl,
        file_type: fileType,
        caption: caption || null,
      });

      setSuccess(true);
      setFile(null);
      setCaption("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.section
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-2xl md:rounded-3xl shadow-xl shadow-rose-100/50 p-4 md:p-8 border border-rose-100 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-32 h-32 bg-amber-200/20 blur-3xl rounded-full -ml-16 -mt-16" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-200/20 blur-3xl rounded-full -mr-16 -mb-16" />

      <div className="relative z-10">
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-amber-400 to-rose-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-rose-200">
            <Camera size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-zinc-800 mb-1">اخطف النظرات 👀</h2>
          <p className="text-zinc-500 text-sm">شارك بفيديو أو صورة وستحصل على جائزة مقدمة من فريق دعم منصور</p>
          <div className="mt-2 inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold">
            🎉 ادخل السحب على مبلغ 500 ريال الليلة!
          </div>
        </div>

        {!user ? (
          <div className="text-center py-4">
            <p className="text-zinc-500 text-sm">يجب تسجيل الدخول أولاً للمشاركة</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-sm mx-auto">
            <div className="relative group">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full px-4 py-3 bg-white border-2 border-dashed border-rose-200 rounded-xl flex items-center justify-between group-hover:border-rose-400 transition-all">
                <span className="text-xs text-zinc-400 truncate max-w-[80%]">
                  {file ? file.name : "اختر صورة أو فيديو..."}
                </span>
                <Upload size={18} className="text-rose-300 group-hover:text-rose-500" />
              </div>
            </div>

            <input
              type="text"
              placeholder="أضف تعليق (اختياري)..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-rose-400"
            />

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-xl font-bold text-sm disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-rose-200"
            >
              {uploading ? "جاري الرفع..." : success ? "✅ تم الرفع بنجاح!" : "شارك الآن 🚀"}
            </button>
          </div>
        )}
      </div>
    </motion.section>
  );
}
