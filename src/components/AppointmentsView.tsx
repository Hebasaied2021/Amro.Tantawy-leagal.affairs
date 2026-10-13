import React, { useState } from 'react';
import {
  CalendarCheck,
  Search,
  Plus,
  MessageSquare,
  Clock,
  User,
  Phone,
  Video,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { Appointment } from '../types';
import {
  openWhatsApp,
  generateAppointmentMessage,
  generateClientBookingMessage,
  FIRM_WHATSAPP_NUMBER,
  FIRM_DISPLAY_PHONE
} from '../utils/whatsapp';

interface AppointmentsViewProps {
  appointments: Appointment[];
  onAddAppointment: (newApp: Appointment) => void;
  onUpdateAppointment: (updatedApp: Appointment) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  onAddAppointment,
  onUpdateAppointment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'مؤكد' | 'في الانتظار' | 'منجز'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredAppointments = appointments.filter((app) => {
    const matchStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchQuery =
      app.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone.includes(searchQuery);
    return matchStatus && matchQuery;
  });

  const handleUpdateStatus = (app: Appointment, newStatus: Appointment['status']) => {
    onUpdateAppointment({ ...app, status: newStatus });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-[#131728] border border-cyan-500/20 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarCheck className="w-5 h-5 text-[#00F0FF]" />
              <h1 className="text-xl font-bold text-white">
                حجز المواعيد والاستشارات القانونية عبر الواتساب
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              تنظيم جدول الاستشارات الحضورية والهاتفية وعبر الفيديو، وإرسال تأكيد الموعد فورياً للعميل برسالة واتساب معتمدة.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full md:w-auto py-2.5 px-4 rounded-xl text-xs font-bold text-black bg-[#00F0FF] hover:bg-[#00F0FF]/90 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>حجز استشارة جديدة</span>
          </button>
        </div>

        {/* WhatsApp Fast Info Banner */}
        <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              نظام الربط مع واتساب يقوم بصياغة رسالة احترافية تشتمل على موعد الجلسة والمقر واسم المستشار وإرسالها فورياً.
            </span>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-semibold font-en">
            WhatsApp Direct v2.4
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث باسم العميل، موضوع الاستشارة، أو رقم الهاتف..."
              className="w-full bg-[#0A0E1A] border border-slate-700 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'bg-[#1A1B2F] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              جميع المواعيد ({appointments.length})
            </button>
            <button
              onClick={() => setFilterStatus('مؤكد')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                filterStatus === 'مؤكد'
                  ? 'bg-emerald-400 text-black shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                  : 'bg-[#1A1B2F] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              مؤكدة
            </button>
            <button
              onClick={() => setFilterStatus('في الانتظار')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                filterStatus === 'في الانتظار'
                  ? 'bg-amber-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                  : 'bg-[#1A1B2F] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              قيد الانتظار
            </button>
            <button
              onClick={() => setFilterStatus('منجز')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                filterStatus === 'منجز'
                  ? 'bg-[#5E5DF0] text-white shadow-[0_0_10px_rgba(94,93,240,0.3)]'
                  : 'bg-[#1A1B2F] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              تمت الجلسة
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.map((app) => {
          return (
            <div
              key={app.id}
              className="bg-[#131728] border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4.5 transition-all shadow-lg flex flex-col justify-between"
            >
              <div>
                {/* Header: Type and Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-[#00F0FF] bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                    {app.consultationType.includes('زووم') ? (
                      <Video className="w-3 h-3 text-[#00F0FF]" />
                    ) : app.consultationType.includes('هاتف') ? (
                      <Phone className="w-3 h-3 text-[#00F0FF]" />
                    ) : (
                      <User className="w-3 h-3 text-[#00F0FF]" />
                    )}
                    <span>{app.consultationType}</span>
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      app.status === 'مؤكد'
                        ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-500/30'
                        : app.status === 'في الانتظار'
                        ? 'text-amber-300 bg-amber-950/60 border border-amber-500/30'
                        : 'text-slate-400 bg-slate-900 border border-slate-800'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-2 line-clamp-1">{app.clientName}</h3>

                {/* Date & Time pill */}
                <div className="bg-[#0A0E1A] p-2.5 rounded-xl border border-slate-900 mb-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300 font-en">
                    <span className="text-slate-500 font-sans">التاريخ والوقت:</span>
                    <span className="font-bold text-white">
                      {app.date} · {app.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">المستشار المختص:</span>
                    <span className="text-cyan-300 font-medium truncate max-w-[160px]">{app.lawyer}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">رسوم الاستشارة:</span>
                    <span className="font-en text-emerald-400 font-bold">{app.fee.toLocaleString()} ج.م</span>
                  </div>
                </div>

                {/* Topic & Notes */}
                <div className="text-xs text-slate-300 mb-3">
                  <span className="text-slate-500 block mb-0.5">موضوع الاستشارة:</span>
                  <p className="line-clamp-2 leading-relaxed bg-[#0A0E1A]/40 p-2 rounded-lg border border-slate-800/80">
                    {app.topic}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                {/* Send WhatsApp Confirmation Button */}
                <button
                  onClick={() => {
                    const msg = generateAppointmentMessage(
                      app.clientName,
                      app.consultationType,
                      app.date,
                      app.time,
                      app.topic,
                      app.lawyer
                    );
                    openWhatsApp(app.phone, msg);
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(52,211,153,0.3)] cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>إرسال تأكيد الموعد عبر الواتساب</span>
                </button>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 text-[11px]">
                  {app.status !== 'مؤكد' && (
                    <button
                      onClick={() => handleUpdateStatus(app, 'مؤكد')}
                      className="flex-1 py-1 rounded-lg bg-[#1A1B2F] hover:bg-emerald-950/40 text-emerald-300 border border-slate-800 cursor-pointer"
                    >
                      تأكيد
                    </button>
                  )}
                  {app.status !== 'منجز' && (
                    <button
                      onClick={() => handleUpdateStatus(app, 'منجز')}
                      className="flex-1 py-1 rounded-lg bg-[#1A1B2F] hover:bg-cyan-950/40 text-cyan-300 border border-slate-800 cursor-pointer"
                    >
                      إتمام
                    </button>
                  )}
                  {app.status !== 'في الانتظار' && (
                    <button
                      onClick={() => handleUpdateStatus(app, 'في الانتظار')}
                      className="flex-1 py-1 rounded-lg bg-[#1A1B2F] hover:bg-amber-950/40 text-amber-300 border border-slate-800 cursor-pointer"
                    >
                      انتظار
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="p-12 text-center bg-[#131728] border border-slate-800 rounded-2xl">
          <CalendarCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">لا توجد مواعيد مطابقة</h3>
          <p className="text-xs text-slate-400">
            يمكنك تسجيل موعد استشارة جديدة فوراً والتواصل مع العميل عبر الواتساب.
          </p>
        </div>
      )}

      {/* MODAL: حجز استشارة جديدة */}
      {isAddModalOpen && (
        <AddAppointmentModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={(newApp) => {
            onAddAppointment(newApp);
            setIsAddModalOpen(false);
            // Send booking request directly to Lawyer Amr Tantawy on WhatsApp: 01003676300
            const msg = generateClientBookingMessage(
              newApp.clientName,
              newApp.phone,
              newApp.consultationType,
              newApp.date,
              newApp.time,
              newApp.topic
            );
            openWhatsApp(FIRM_WHATSAPP_NUMBER, msg);
          }}
        />
      )}
    </div>
  );
};

// Add Appointment Sub-modal
interface AddAppointmentModalProps {
  onClose: () => void;
  onSave: (app: Appointment) => void;
}

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ onClose, onSave }) => {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('010');
  const [consultationType, setConsultationType] = useState<Appointment['consultationType']>('حضورية في المكتب');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('06:00 م');
  const [topic, setTopic] = useState('');
  const [lawyer, setLawyer] = useState('أ. عمرو طنطاوي (المستشار القانوني)');
  const [fee, setFee] = useState(1500);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newApp: Appointment = {
      id: `app-${Date.now()}`,
      clientName,
      phone,
      consultationType,
      date,
      time,
      topic,
      lawyer,
      fee: Number(fee),
      status: 'مؤكد',
    };

    onSave(newApp);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#131728] border border-cyan-500/40 rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              حجز استشارة قانونية جديدة مع إشعار الواتساب
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">اسم العميل / طالب الاستشارة *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="الأستاذ / ..."
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">رقم الهاتف (الواتساب) *</label>
              <input
                type="text"
                dir="ltr"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+201012345678"
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF] font-en"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">طبيعة ومكان الاستشارة *</label>
              <select
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value as any)}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
              >
                <option value="حضورية في المكتب">حضورية في مقر المكتب</option>
                <option value="استشارة هاتفية">استشارة هاتفية مباشرة</option>
                <option value="جلسة عبر زووم / أونلاين">جلسة مرئية عبر زووم / Google Meet</option>
                <option value="مراجعة وصياغة عقد عاجل">مراجعة وصياغة عقد عاجل</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">المستشار القانوني المسند إليه</label>
              <input
                type="text"
                value={lawyer}
                onChange={(e) => setLawyer(e.target.value)}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">التاريخ المقرر *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF] font-en"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">التوقيت *</label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="مثال: 06:30 م"
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">رسوم الاستشارة (ج.م)</label>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF] font-en"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">موضوع الاستشارة ونقاط النقاش *</label>
            <textarea
              rows={3}
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="وصف مختصر لموضوع الاستشارة القانونية المطلوب بحثها..."
              className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
            />
          </div>

          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-200 text-[11px] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              عند الضغط على الحفظ، سيتم فتح محادثة الواتساب تلقائياً مع العميل مرفقاً بها تفاصيل الموعد والمقر والمستشار.
            </span>
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-400 text-black font-bold rounded-xl hover:bg-emerald-300 transition-all cursor-pointer shadow-[0_0_15px_rgba(52,211,153,0.3)] flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>تأكيد الحجز وفتح الواتساب</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#1A1B2F] text-slate-300 rounded-xl"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
