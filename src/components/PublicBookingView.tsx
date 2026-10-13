import React, { useState } from 'react';
import {
  Scale,
  CalendarCheck,
  MessageSquare,
  Clock,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Video,
  User,
  Sparkles,
  FileCheck,
  Award
} from 'lucide-react';
import { Appointment } from '../types';
import {
  FIRM_WHATSAPP_NUMBER,
  FIRM_DISPLAY_PHONE,
  LAWYER_NAME,
  LAW_FIRM_NAME,
  openWhatsApp,
  generateClientBookingMessage
} from '../utils/whatsapp';

interface PublicBookingViewProps {
  onBookAppointment: (app: Appointment) => void;
  onOpenAdminLogin: () => void;
}

export const PublicBookingView: React.FC<PublicBookingViewProps> = ({
  onBookAppointment,
  onOpenAdminLogin,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [consultationType, setConsultationType] = useState<Appointment['consultationType']>('حضورية في المكتب');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('06:00 م');
  const [topic, setTopic] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [lastMessage, setLastMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newApp: Appointment = {
      id: `app-${Date.now()}`,
      clientName,
      phone: clientPhone,
      consultationType,
      date,
      time,
      topic,
      lawyer: LAWYER_NAME,
      fee: consultationType === 'مراجعة وصياغة عقد عاجل' ? 3000 : 1500,
      status: 'في الانتظار',
      notes: `طلب حجز استشارة مع ${LAWYER_NAME} عبر بوابة الحجز السريع بالواتساب`,
    };

    onBookAppointment(newApp);

    // Format WhatsApp message to lawyer Amr Tantawy at 01003676300
    const msg = generateClientBookingMessage(
      clientName,
      clientPhone,
      consultationType,
      date,
      time,
      topic
    );
    setLastMessage(msg);
    setSubmitted(true);

    // Launch WhatsApp directly
    openWhatsApp(FIRM_WHATSAPP_NUMBER, msg);
  };

  const handleQuickWhatsAppChat = () => {
    const text = `السلام عليكم ورحمة الله وبركاته، أود الاستفسار والتنسيق لحجز استشارة قانونية مع ${LAWYER_NAME}.`;
    openWhatsApp(FIRM_WHATSAPP_NUMBER, text);
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-[#00F0FF]/20 selection:text-[#00F0FF]">
      {/* Background Cyber Glowing Accents */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#00F0FF]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#5E5DF0]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Cyber Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#00F0FF 1px, transparent 1px), linear-gradient(90deg, #00F0FF 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Public Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0A0E1A]/90 backdrop-blur-md border-b border-cyan-500/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5E5DF0] to-[#00F0FF] p-[1.5px] shadow-[0_0_15px_rgba(0,240,255,0.35)] flex items-center justify-center">
              <div className="w-full h-full bg-[#0A0E1A] rounded-[10px] flex items-center justify-center">
                <Scale className="w-5 h-5 text-[#00F0FF]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 leading-none">
                <span className="font-extrabold text-base text-white">مكتب المستشار عمرو طنطاوي</span>
                <span className="hidden sm:inline-block text-[11px] font-bold text-[#00F0FF] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  للمحاماة والاستشارات
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">الاستشارات والتمثيل القضائي المتخصص</p>
            </div>
          </div>

          {/* Right Header Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick WhatsApp Badge */}
            <button
              onClick={handleQuickWhatsAppChat}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all cursor-pointer shadow-[0_0_12px_rgba(52,211,153,0.3)] font-en"
              title="تواصل مباشر عبر الواتساب مع أ. عمرو طنطاوي"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>واتساب: {FIRM_DISPLAY_PHONE}</span>
            </button>

            {/* Admin Login Gateway (Discrete for Office Owner) */}
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 bg-[#131728] hover:bg-[#1A1B2F] border border-cyan-500/30 hover:border-[#00F0FF] transition-all cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.15)]"
            >
              <Lock className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>دخول الإدارة (Admin)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-bold text-[#00F0FF] mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>بوابة حجز الاستشارات القانونية · المستشار عمرو طنطاوي</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug">
            احجز استشارتك القانونية الآن مع <span className="text-[#00F0FF]">أ. عمرو طنطاوي</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            اختر نوع وتوقيت الاستشارة المناسب لك، وسيتم ربط طلبك فورياً عبر الواتساب على الرقم المعتمد للمستشار عمرو طنطاوي:{' '}
            <strong className="text-emerald-400 font-en font-bold text-sm">{FIRM_DISPLAY_PHONE}</strong>
          </p>
        </div>

        {/* Success Banner if submitted */}
        {submitted && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.2)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  تم تسجيل طلب الحجز وتجهيز رسالة الواتساب للمستشار عمرو طنطاوي بنجاح!
                </h3>
                <p className="text-xs text-emerald-200 mt-0.5">
                  سيتم إرسال الطلب مباشرة إلى المستشار عمرو طنطاوي على الرقم <strong className="font-en font-bold text-white">{FIRM_DISPLAY_PHONE}</strong>:
                </p>
                <div className="mt-2 p-2.5 rounded-xl bg-[#0A0E1A] border border-emerald-500/30 text-[11px] text-emerald-200 whitespace-pre-wrap text-right leading-relaxed max-w-lg">
                  {lastMessage}
                </div>
              </div>
            </div>
            <button
              onClick={() => openWhatsApp(FIRM_WHATSAPP_NUMBER, lastMessage)}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-[0_0_15px_rgba(52,211,153,0.35)] shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              <span>إرسال عبر الواتساب إلى (01003676300)</span>
            </button>
          </div>
        )}

        {/* Booking Grid: Form (7 cols) + Firm Info (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* The Booking Form */}
          <div className="lg:col-span-7 bg-[#131728] border border-cyan-500/25 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-[#00F0FF]" />
                <h2 className="text-base font-bold text-white">استمارة حجز موعد استشارة قانونية</h2>
              </div>
              <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                المستشار عمرو طنطاوي
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Client Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    الاسم بالكامل *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="أ. محمد أحمد..."
                      className="w-full bg-[#0A0E1A] border border-slate-700/80 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] rounded-xl pr-9 pl-3 py-2.5 text-white placeholder-slate-500 outline-none transition-all text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    رقم الهاتف (الواتساب) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      dir="ltr"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="01012345678"
                      className="w-full bg-[#0A0E1A] border border-slate-700/80 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] rounded-xl pr-9 pl-3 py-2.5 text-white placeholder-slate-500 outline-none transition-all text-xs font-en"
                    />
                  </div>
                </div>
              </div>

              {/* Consultation Type */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  نوع وطريقة تقديم الاستشارة *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'حضورية في المكتب', label: 'حضورية بمقر المكتب', desc: 'لقاء مباشر مع المستشار عمرو طنطاوي', icon: MapPin },
                    { id: 'استشارة هاتفية', label: 'استشارة هاتفية سريعة', desc: 'مكالمة هاتفية مع المستشار', icon: Phone },
                    { id: 'جلسة عبر زووم / أونلاين', label: 'جلسة فيديو (زووم)', desc: 'اجتماع افتراضي مرئي عن بُعد', icon: Video },
                    { id: 'مراجعة وصياغة عقد عاجل', label: 'مراجعة وصياغة عقد', desc: 'تدقيق وصياغة العقود القانونية', icon: FileCheck },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = consultationType === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setConsultationType(item.id as any)}
                        className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-cyan-950/50 border-[#00F0FF] text-white shadow-[0_0_12px_rgba(0,240,255,0.2)] ring-1 ring-[#00F0FF]'
                            : 'bg-[#0A0E1A] border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isSelected ? 'bg-[#00F0FF] text-black' : 'bg-slate-800 text-slate-400'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold block text-xs">{item.label}</span>
                          <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    التاريخ المفضل للموعد *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#0A0E1A] border border-slate-700/80 focus:border-[#00F0FF] rounded-xl p-2.5 text-white outline-none font-en text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    التوقيت المفضل *
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-[#0A0E1A] border border-slate-700/80 focus:border-[#00F0FF] rounded-xl p-2.5 text-white outline-none text-xs"
                  >
                    <option value="11:00 ص">11:00 صباحاً</option>
                    <option value="01:00 م">01:00 ظهراً</option>
                    <option value="04:00 م">04:00 عصراً</option>
                    <option value="06:00 م">06:00 مساءً</option>
                    <option value="08:00 م">08:00 مساءً</option>
                  </select>
                </div>
              </div>

              {/* Topic / Summary */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  موضوع الاستشارة وملخص القضية أو الطلب *
                </label>
                <textarea
                  rows={3}
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="يرجى كتابة نبذة عن الموضوع أو النزاع القانوني المراد بحثه مع المستشار عمرو طنطاوي..."
                  className="w-full bg-[#0A0E1A] border border-slate-700/80 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] rounded-xl p-3 text-white placeholder-slate-500 outline-none transition-all text-xs leading-relaxed"
                />
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-[11px] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  سيتم توجيه طلبك مباشرة إلى واتساب المستشار عمرو طنطاوي على الرقم <strong className="font-en text-white font-bold">{FIRM_DISPLAY_PHONE}</strong> للتأكيد الفوري.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-emerald-400 via-[#00F0FF] to-[#5E5DF0] hover:opacity-95 transition-all shadow-[0_0_20px_rgba(52,211,153,0.35)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>تأكيد الحجز ومراسلة أ. عمرو طنطاوي بالواتساب ({FIRM_DISPLAY_PHONE})</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </form>
          </div>

          {/* Firm Information & Guarantees (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Direct WhatsApp Contact Card */}
            <div className="bg-[#131728] border border-emerald-500/30 rounded-2xl p-5 shadow-xl space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">الواتساب المباشر للمستشار</h3>
                  <p className="text-xs text-slate-300 font-semibold">أ. عمرو طنطاوي</p>
                  <p className="text-sm font-bold text-emerald-400 font-en">{FIRM_DISPLAY_PHONE}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                يمكنك أيضاً مراسلة المستشار عمرو طنطاوي فورياً للاستفسارات العاجلة وتنسيق الوكالات القضائية.
              </p>

              <button
                onClick={handleQuickWhatsAppChat}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(52,211,153,0.3)]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>محادثة سريعة عبر الواتساب</span>
              </button>
            </div>

            {/* Office Location & Working Hours */}
            <div className="bg-[#131728] border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
              <h3 className="font-bold text-white border-b border-slate-800 pb-2">بيانات المقر وأوقات العمل:</h3>
              
              <div className="flex items-start gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">مقر المكتب الرئيسي:</span>
                  <span className="text-slate-400">برج النخبة القانوني - التجمع الخامس - القاهرة</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-slate-300">
                <Clock className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">أوقات العمل والمقابلات:</span>
                  <span className="text-slate-400">السبت إلى الخميس: 10:00 صباحاً – 10:00 مساءً</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">السرية المهنية:</span>
                  <span className="text-slate-400">كافة الوقائع والمستندات مشمولة بالسرية التامة وفقاً لتقاليد مهنة المحاماة.</span>
                </div>
              </div>
            </div>

            {/* Admin Lock Box */}
            <div className="bg-[#0A0E1A] border border-cyan-500/20 rounded-2xl p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#00F0FF]" />
                <span className="text-slate-400">خاص بـ أ. عمرو طنطاوي والإدارة:</span>
              </div>
              <button
                onClick={onOpenAdminLogin}
                className="text-xs font-bold text-[#00F0FF] hover:underline cursor-pointer"
              >
                تسجيل الدخول للنظام ⬅
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0A0E1A] py-6 text-center text-xs text-slate-400 space-y-2">
        <p className="font-semibold text-slate-300">
          مكتب أ. عمرو طنطاوي للمحاماة والاستشارات القانونية · هاتف وواتساب الحجوزات: <span className="text-emerald-400 font-en font-bold">{FIRM_DISPLAY_PHONE}</span>
        </p>
        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-2 flex-wrap">
          <span>جميع الحقوق محفوظة لـ <strong className="text-slate-200 font-bold">د. هبه سعيد عبدالله</strong></span>
          <span className="text-slate-600">|</span>
          <span>ايميل: <a href="mailto:heba.wafa2@gmail.com" className="text-cyan-300 font-en hover:underline">heba.wafa2@gmail.com</a></span>
          <span className="text-slate-600">|</span>
          <span>موبايل: <a href="tel:01098888773" className="text-cyan-300 font-en hover:underline" dir="ltr">01098888773</a></span>
        </p>
      </footer>
    </div>
  );
};
