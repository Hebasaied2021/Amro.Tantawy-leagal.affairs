import React from 'react';
import {
  Scale,
  Briefcase,
  FileText,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  MessageSquare,
  DollarSign,
  PlusCircle,
  CheckCircle,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { CaseItem, ContractItem, ClientAccount, Appointment } from '../types';
import { getDaysRemaining, formatCurrency, formatDateArabic } from '../utils/dateHelpers';
import { openWhatsApp, generateContractRenewalReminder } from '../utils/whatsapp';

interface DashboardViewProps {
  cases: CaseItem[];
  contracts: ContractItem[];
  clients: ClientAccount[];
  appointments: Appointment[];
  onNavigateTab: (tab: 'cases' | 'contracts' | 'accounts' | 'appointments') => void;
  onOpenNewCaseModal: () => void;
  onOpenNewContractModal: () => void;
  onOpenNewAppointmentModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  contracts,
  clients,
  appointments,
  onNavigateTab,
  onOpenNewCaseModal,
  onOpenNewContractModal,
  onOpenNewAppointmentModal,
}) => {
  // Urgent contracts: expiring in <= 30 days and >= 0 days
  const urgentContracts = contracts.filter((c) => {
    const days = getDaysRemaining(c.endDate);
    return days >= 0 && days <= 30;
  });

  // Financial aggregates
  const totalAgreedFees = clients.reduce((sum, c) => sum + c.totalAgreedFees, 0);
  const totalPaidFees = clients.reduce((sum, c) => sum + c.totalPaid, 0);
  const totalPendingFees = totalAgreedFees - totalPaidFees;
  const totalExpenses = clients.reduce((sum, c) => sum + c.courtExpenses, 0);

  // Active cases count
  const activeCasesCount = cases.filter((c) => c.status === 'متداولة' || c.status === 'محجوزة للحكم').length;

  // Upcoming hearings (cases that have a nextHearingDate)
  const upcomingHearings = cases
    .filter((c) => c.nextHearingDate)
    .sort((a, b) => (a.nextHearingDate || '').localeCompare(b.nextHearingDate || ''))
    .slice(0, 4);

  // Category counts
  const categoriesList = ['جنائي', 'مدني', 'تجاري', 'عمالي', 'أحوال شخصية', 'إداري وتعويضات', 'عقاري'] as const;
  const categoryCounts = categoriesList.map((cat) => ({
    name: cat,
    count: cases.filter((c) => c.category === cat).length,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-[#131728] border border-cyan-500/20 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-full bg-gradient-to-r from-transparent via-[#00F0FF]/5 to-[#5E5DF0]/10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                لوحة المتابعة والأداء العام للمكتب
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              إحصائيات فورية عن مسار القضايا، تنبيهات تجديد العقود، الموقف المالي وحجوزات الواتساب.
            </p>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={onOpenNewCaseModal}
              className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl text-xs font-bold text-black bg-[#00F0FF] hover:bg-[#00F0FF]/90 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة قضية</span>
            </button>
            <button
              onClick={onOpenNewContractModal}
              className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl text-xs font-bold text-white bg-[#5E5DF0] hover:bg-[#5E5DF0]/90 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(94,93,240,0.25)] cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>عقد جديد</span>
            </button>
            <button
              onClick={onOpenNewAppointmentModal}
              className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl text-xs font-semibold text-cyan-300 bg-[#1A1B2F] hover:bg-[#20223b] border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>حجز موعد واتساب</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Cases */}
        <div
          onClick={() => onNavigateTab('cases')}
          className="bg-[#131728] border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4.5 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">القضايا المتداولة والنشطة</span>
            <div className="w-9 h-9 rounded-xl bg-[#1A1B2F] border border-cyan-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase className="w-4.5 h-4.5 text-[#00F0FF]" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-en tabular-nums">
              {activeCasesCount}
            </span>
            <span className="text-xs text-slate-400">
              إجمالي: <span className="text-white font-bold font-en">{cases.length}</span>
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-[#00F0FF]">
            <span>استعراض مسار القضايا</span>
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Metric 2: Urgent Contract Renewals */}
        <div
          onClick={() => onNavigateTab('contracts')}
          className={`bg-[#131728] border rounded-2xl p-4.5 transition-all cursor-pointer group shadow-lg ${
            urgentContracts.length > 0
              ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
              : 'border-slate-800 hover:border-cyan-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">تنبيهات تجديد العقود</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
              urgentContracts.length > 0 ? 'bg-amber-950/40 border border-amber-500/40' : 'bg-[#1A1B2F] border border-slate-700'
            }`}>
              <AlertTriangle className={`w-4.5 h-4.5 ${urgentContracts.length > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-en tabular-nums">
                {urgentContracts.length}
              </span>
              <span className="text-xs text-amber-400 font-semibold">(خلال 30 يوم)</span>
            </div>
            <span className="text-xs text-slate-400 font-en">{contracts.length} عقود</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-amber-300">
            <span>إرسال إشعارات التجديد</span>
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Metric 3: Financial Collected */}
        <div
          onClick={() => onNavigateTab('accounts')}
          className="bg-[#131728] border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4.5 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">المحصل من الأتعاب</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-en tabular-nums">
              {totalPaidFees.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400">ج.م مسدد</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>متبقي: <span className="text-amber-400 font-en font-bold">{totalPendingFees.toLocaleString()} ج.م</span></span>
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Metric 4: Consultations & Appointments */}
        <div
          onClick={() => onNavigateTab('appointments')}
          className="bg-[#131728] border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4.5 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">مواعيد واستشارات الواتساب</span>
            <div className="w-9 h-9 rounded-xl bg-[#1A1B2F] border border-[#5E5DF0]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-4.5 h-4.5 text-[#5E5DF0]" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-en tabular-nums">
              {appointments.length}
            </span>
            <span className="text-xs text-cyan-300 font-semibold">مؤكدة وجارية</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-cyan-400">
            <span>إدارة الحجوزات والمراسلة</span>
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Main Split: Urgent Contracts Warnings & Upcoming Court Hearings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Urgent Contracts (تنبيه التجديد قبل شهر) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#131728] border border-cyan-500/20 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  تنبيهات التجديد العاجلة للعقود (قبل الانتهاء بشهر)
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('contracts')}
                className="text-xs text-[#00F0FF] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <span>جميع العقود</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {urgentContracts.length === 0 ? (
              <div className="p-6 text-center bg-[#0A0E1A]/60 rounded-xl border border-slate-800">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-semibold">
                  جميع العقود سارية ولا توجد عقود تقترب من موعد التجديد خلال هذا الشهر.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentContracts.map((contract) => {
                  const daysLeft = getDaysRemaining(contract.endDate);
                  return (
                    <div
                      key={contract.id}
                      className="bg-[#0A0E1A] border border-amber-500/30 hover:border-amber-500/60 rounded-xl p-3.5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">
                            {contract.partyTwo}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30 font-en">
                            متبقي {daysLeft} يوماً
                          </span>
                          <span className="text-[11px] text-slate-400 font-en">
                            {contract.contractNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-1">
                          {contract.title}
                        </p>
                        <div className="text-[11px] text-slate-500 flex items-center gap-3">
                          <span>ينتهي في: <span className="font-en text-slate-300">{contract.endDate}</span></span>
                          <span>القيمة: <span className="font-en text-[#00F0FF]">{contract.value.toLocaleString()} ج.م</span></span>
                        </div>
                      </div>

                      {/* WhatsApp Reminder Action */}
                      <button
                        onClick={() => {
                          const msg = generateContractRenewalReminder(
                            contract.partyTwo,
                            contract.title,
                            contract.contractNumber,
                            contract.endDate,
                            daysLeft
                          );
                          openWhatsApp(contract.clientPhone, msg);
                        }}
                        className="w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(52,211,153,0.3)] cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>تذكير بالواتساب</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cases Categorization Distribution */}
          <div className="bg-[#131728] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h2 className="text-base font-bold text-white mb-3 flex items-center justify-between">
              <span>توزيع القضايا حسب التصنيف القانوني</span>
              <span className="text-xs font-normal text-slate-400 font-en">{cases.length} قضية مسجلة</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {categoryCounts.map((cat) => (
                <div
                  key={cat.name}
                  onClick={() => onNavigateTab('cases')}
                  className="bg-[#0A0E1A] border border-slate-800/90 hover:border-cyan-500/40 p-3 rounded-xl cursor-pointer transition-all text-center"
                >
                  <span className="text-[11px] text-slate-400 block mb-1">{cat.name}</span>
                  <span className="text-lg font-bold text-white font-en tabular-nums">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Upcoming Hearings Schedule */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#131728] border border-cyan-500/20 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#00F0FF]" />
                <h2 className="text-base font-bold text-white">
                  جدول الجلسات والمرافعات القادمة
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('cases')}
                className="text-xs text-[#00F0FF] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <span>الكل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingHearings.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-[#0A0E1A] border border-slate-800 hover:border-cyan-500/30 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{c.clientName}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950/60 text-[#00F0FF] border border-cyan-500/30 font-en">
                      {c.nextHearingDate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium line-clamp-1">{c.court}</p>
                  <p className="text-[11px] text-slate-400">
                    <span className="text-slate-500">سبب الجلسة: </span>
                    {c.nextHearingReason || 'مرافعة وتقديم مستندات'}
                  </p>
                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 border-t border-slate-900">
                    <span className="font-en text-slate-400">{c.caseNumber}</span>
                    <span className="text-emerald-400">{c.currentStage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Direct Assistance Card */}
          <div className="bg-gradient-to-br from-[#161B33] to-[#0A0E1A] border border-emerald-500/30 rounded-2xl p-5 shadow-xl text-right">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm font-bold text-white">حجز الاستشارات عبر الواتساب</h3>
            </div>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              تأكيد مواعيد الجلسات والاستشارات القانونية فورياً للعملاء وإرسال خطابات التذكير المعتمدة بنقرة واحدة.
            </p>
            <button
              onClick={() => onNavigateTab('appointments')}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(52,211,153,0.25)]"
            >
              <span>فتح سجل الاستشارات وحجز موعد جديد</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
