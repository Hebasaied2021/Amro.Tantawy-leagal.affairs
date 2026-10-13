import React, { useState } from 'react';
import {
  Scale,
  Briefcase,
  FileText,
  CreditCard,
  Download,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle2,
  FileCheck,
  Phone,
  ShieldCheck,
  ChevronLeft,
  Receipt,
  UserCheck,
  Printer
} from 'lucide-react';
import { ClientAccount, CaseItem, ContractItem, Appointment, CaseStage } from '../types';
import { exportClientReportToPDF } from '../utils/pdfGenerator';
import { openWhatsApp, generateAppointmentMessage } from '../utils/whatsapp';
import { getDaysRemaining } from '../utils/dateHelpers';

interface ClientPortalViewProps {
  client: ClientAccount;
  cases: CaseItem[];
  contracts: ContractItem[];
  appointments: Appointment[];
  onBookAppointment: (app: Appointment) => void;
}

const STAGES_LIST: CaseStage[] = [
  'تسجيل وتوثيق الدعوى',
  'إيداع المذكرات والمستندات',
  'جلسات المرافعة والتحقيق',
  'محجوزة للحكم',
  'صدور الحكم الابتدائي',
  'مرحلة الاستئناف والطعن',
  'التنفيذ والتحصيل',
];

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  client,
  cases,
  contracts,
  appointments,
  onBookAppointment,
}) => {
  const [activeSection, setActiveSection] = useState<'cases' | 'contracts' | 'finance' | 'consultation'>('cases');
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(cases.length > 0 ? cases[0] : null);

  // Filter ONLY this client's cases, contracts, appointments
  const myCases = cases.filter(
    (c) => c.clientId === client.id || c.clientName.includes(client.name) || client.name.includes(c.clientName)
  );

  const myContracts = contracts.filter(
    (c) => c.clientId === client.id || c.partyTwo.includes(client.name) || client.name.includes(c.partyTwo)
  );

  const myAppointments = appointments.filter(
    (a) => a.clientId === client.id || a.clientName.includes(client.name)
  );

  const remainingBalance = client.totalAgreedFees - client.totalPaid;

  const getStageIndex = (stage: CaseStage) => STAGES_LIST.indexOf(stage);

  return (
    <div className="space-y-6 pb-12">
      {/* Client Welcome Hero Card */}
      <div className="bg-[#131728] border border-cyan-500/20 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-full bg-gradient-to-r from-transparent via-[#00F0FF]/5 to-[#5E5DF0]/10 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                بوابة الموكل المشفرة والمحمية
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
              أهلاً بك، {client.name}
            </h1>
            <p className="text-xs text-slate-400">
              تابع مباشرة مسار قضاياك، جلسات المحاكم القادمة، سريان العقود، وسدد أو حمّل كشوف الحسابات المعتمدة (PDF).
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => exportClientReportToPDF(client)}
              className="flex-1 md:flex-initial py-2.5 px-4 rounded-xl text-xs font-bold text-black bg-[#00F0FF] hover:bg-cyan-300 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل كشف حسابي المالي (PDF)</span>
            </button>

            <button
              onClick={() => {
                const text = `السلام عليكم ورحمة الله وبركاته،\nأنا الموكل: ${client.name}، أود الاستفسار عن مستجدات الملف القانوني.`;
                openWhatsApp('+201008901200', text);
              }}
              className="py-2.5 px-3 rounded-xl text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(52,211,153,0.3)]"
              title="مراسلة مكتب المحاماة عبر الواتساب"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">مراسلة المحامي</span>
            </button>
          </div>
        </div>

        {/* Client Fast Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveSection('cases')}
            className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSection === 'cases'
                ? 'bg-[#00F0FF] text-black shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                : 'bg-[#0A0E1A] text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>قضاياي ({myCases.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('contracts')}
            className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSection === 'contracts'
                ? 'bg-[#00F0FF] text-black shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                : 'bg-[#0A0E1A] text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>عقودي ({myContracts.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('finance')}
            className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSection === 'finance'
                ? 'bg-[#00F0FF] text-black shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                : 'bg-[#0A0E1A] text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>حسابي المالي والـ PDF</span>
          </button>

          <button
            onClick={() => setActiveSection('consultation')}
            className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSection === 'consultation'
                ? 'bg-[#00F0FF] text-black shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                : 'bg-[#0A0E1A] text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>حجز استشارة جديدة</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: CASES TRACKING (مسار قضايا الموكل) */}
      {activeSection === 'cases' && (
        <div className="space-y-6">
          {myCases.length === 0 ? (
            <div className="bg-[#131728] border border-slate-800 rounded-2xl p-8 text-center">
              <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">لا توجد قضايا مقيدة باسمك حالياً</p>
              <p className="text-xs text-slate-400 mt-1">تواصل مع إدارة المكتب لتسجيل توكيل جديد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Cases Selector List */}
              <div className="lg:col-span-4 space-y-3">
                <h2 className="text-xs font-bold text-slate-400">اختر القضية لعرض مسارها:</h2>
                {myCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs ${
                      selectedCase?.id === c.id
                        ? 'bg-[#1A1B2F] border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'bg-[#131728] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-[#00F0FF] bg-cyan-950/60 px-2 py-0.5 rounded">
                        {c.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-en">{c.caseNumber}</span>
                    </div>
                    <h3 className="font-bold text-white mb-1 line-clamp-2">{c.title}</h3>
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{c.currentStage}</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Selected Case Detailed Timeline */}
              {selectedCase && (
                <div className="lg:col-span-8 bg-[#131728] border border-cyan-500/20 rounded-2xl p-5 sm:p-6 space-y-5">
                  <div className="border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-[#00F0FF] text-black font-bold">
                        {selectedCase.category}
                      </span>
                      <span className="text-xs text-slate-400 font-en">{selectedCase.caseNumber}</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {selectedCase.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      المحكمة: <span className="text-slate-200">{selectedCase.court}</span> | الخصم: <span className="text-rose-300 font-semibold">{selectedCase.opponentName}</span>
                    </p>
                  </div>

                  {/* Visual Stepper */}
                  <div className="bg-[#0A0E1A] border border-slate-800 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-white mb-3">
                      مسار القضية والمحطة الحالية:
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                      {STAGES_LIST.map((stage, idx) => {
                        const currentIdx = getStageIndex(selectedCase.currentStage);
                        const isPast = idx < currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div
                            key={stage}
                            className={`p-2 rounded-lg text-center border text-[10px] flex flex-col items-center justify-between min-h-[70px] ${
                              isCurrent
                                ? 'bg-cyan-950/60 border-[#00F0FF] text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.3)] ring-1 ring-[#00F0FF]'
                                : isPast
                                ? 'bg-[#131728] border-emerald-500/30 text-emerald-300'
                                : 'bg-[#0E1220] border-slate-800 text-slate-600'
                            }`}
                          >
                            <span className="font-bold font-en text-[10px]">
                              {isPast ? '✓' : idx + 1}
                            </span>
                            <span className="line-clamp-2">{stage}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Next Hearing Alert */}
                  {selectedCase.nextHearingDate && (
                    <div className="p-3.5 bg-cyan-950/40 border border-cyan-500/40 rounded-xl flex items-center justify-between text-xs text-cyan-200 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#00F0FF] shrink-0" />
                        <span>
                          موعد الجلسة القادمة بالمحكمة: <strong className="font-en text-white text-sm font-bold">{selectedCase.nextHearingDate}</strong>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        سبب الجلسة: {selectedCase.nextHearingReason || 'مرافعة وتقديم مذكرات'}
                      </span>
                    </div>
                  )}

                  {/* Hearing Logs for Client */}
                  <div>
                    <h3 className="text-xs font-bold text-white mb-2">سجل وقرارات الجلسات:</h3>
                    <div className="space-y-2">
                      {selectedCase.hearings.map((h) => (
                        <div key={h.id} className="p-3 rounded-xl bg-[#0A0E1A] border border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-cyan-300 font-en">جلسة {h.date}</span>
                            <span className="text-slate-400">المحامي الحاضر: {h.attendedLawyer}</span>
                          </div>
                          <p className="text-white font-medium">قرار المحكمة: {h.courtDecision}</p>
                          <p className="text-slate-400 text-[11px]">ما تم بالجلسة: {h.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: CONTRACTS (عقود الموكل) */}
      {activeSection === 'contracts' && (
        <div className="space-y-4">
          {myContracts.length === 0 ? (
            <div className="bg-[#131728] border border-slate-800 rounded-2xl p-8 text-center">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">لا توجد عقود مسجلة لهذا الحساب</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myContracts.map((cnt) => {
                const daysLeft = getDaysRemaining(cnt.endDate);
                const isUrgent = daysLeft >= 0 && daysLeft <= 30;

                return (
                  <div key={cnt.id} className="bg-[#131728] border border-slate-800 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#00F0FF] bg-cyan-950/60 px-2.5 py-0.5 rounded">
                        {cnt.category}
                      </span>
                      <span className="text-xs text-slate-400 font-en">{cnt.contractNumber}</span>
                    </div>

                    <h3 className="text-sm font-bold text-white">{cnt.title}</h3>

                    <div className="bg-[#0A0E1A] p-3 rounded-xl border border-slate-900 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">بداية السريان:</span>
                        <span className="font-en text-white">{cnt.startDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">نهاية السريان:</span>
                        <span className="font-en text-white font-bold">{cnt.endDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">آلية التجديد:</span>
                        <span className="text-cyan-300">{cnt.renewalType}</span>
                      </div>
                    </div>

                    {isUrgent && (
                      <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs">
                        ⚠️ ينتهي العقد خلال {daysLeft} يوماً (أقل من شهر). يرجى التنسيق لتجهيز ملحق التجديد.
                      </div>
                    )}

                    <button
                      onClick={() => {
                        const msg = `السلام عليكم ورحمة الله، أنا الموكل: ${client.name}. بخصوص العقد (${cnt.title} - رقم ${cnt.contractNumber})، أود مناقشة التجديد السنوي.`;
                        openWhatsApp('+201008901200', msg);
                      }}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>طلب تجديد العقد عبر الواتساب</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: FINANCIAL STATEMENT (كشف الحساب المالي للموكل فقط) */}
      {activeSection === 'finance' && (
        <div className="bg-[#131728] border border-cyan-500/20 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#00F0FF]" />
                <span>كشف الحساب المالي الخاص بك</span>
              </h2>
              <p className="text-xs text-slate-400">
                سجل الأتعاب والمدفوعات والمصروفات القضائية الصادرة باسمك فقط.
              </p>
            </div>

            <button
              onClick={() => exportClientReportToPDF(client)}
              className="py-2 px-4 rounded-xl text-xs font-bold text-black bg-[#00F0FF] hover:bg-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.25)]"
            >
              <Download className="w-4 h-4" />
              <span>تحميل كشف الحساب المعتمد (PDF)</span>
            </button>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-[#0A0E1A] border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">الأتعاب المقررة</span>
              <span className="text-base font-bold text-white font-en">{client.totalAgreedFees.toLocaleString()} ج.م</span>
            </div>
            <div className="bg-[#0A0E1A] border border-emerald-500/30 p-3.5 rounded-xl">
              <span className="text-[11px] text-emerald-400 block mb-1">المسدد حتى الآن</span>
              <span className="text-base font-bold text-emerald-400 font-en">{client.totalPaid.toLocaleString()} ج.م</span>
            </div>
            <div className="bg-[#0A0E1A] border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] text-cyan-300 block mb-1">المصروفات القضائية</span>
              <span className="text-base font-bold text-cyan-300 font-en">{client.courtExpenses.toLocaleString()} ج.م</span>
            </div>
            <div className="bg-[#0A0E1A] border border-amber-500/30 p-3.5 rounded-xl">
              <span className="text-[11px] text-amber-400 block mb-1">الرصيد المتبقي</span>
              <span className="text-base font-bold text-amber-400 font-en">{remainingBalance.toLocaleString()} ج.م</span>
            </div>
          </div>

          {/* Transactions List */}
          <div>
            <h3 className="text-xs font-bold text-white mb-2">سجل السندات والإيصالات المسجلة:</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0A0E1A] text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">التاريخ</th>
                    <th className="p-2.5">نوع العملية</th>
                    <th className="p-2.5">رقم الإيصال</th>
                    <th className="p-2.5">المبلغ</th>
                    <th className="p-2.5">البيان</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-[#0A0E1A]/60">
                  {client.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-900/40">
                      <td className="p-2.5 font-en text-slate-300">{tx.date}</td>
                      <td className="p-2.5 text-cyan-300 font-semibold">{tx.type}</td>
                      <td className="p-2.5 font-en text-slate-400">{tx.receiptNumber}</td>
                      <td className="p-2.5 font-en font-bold text-emerald-400">{tx.amount.toLocaleString()} ج.م</td>
                      <td className="p-2.5 text-slate-400">{tx.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: BOOK CONSULTATION VIA WHATSAPP (حجز استشارة جديدة للموكل) */}
      {activeSection === 'consultation' && (
        <div className="bg-[#131728] border border-cyan-500/20 rounded-2xl p-5 sm:p-6 space-y-4 max-w-xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">حجز استشارة قانونية مباشرة بالواتساب</h2>
          </div>
          <p className="text-xs text-slate-400">
            أرسل طلب استشارتك مع التوقيت المفضل وسيتم تأكيد الموعد فورياً مع مستشارك القانوني.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                const text = `السلام عليكم ورحمة الله،\nأنا الموكل: ${client.name}، أود حجز جلسة استشارة حضورية في مقر المكتب لمناقشة أوراق ومستندات جديدة.`;
                openWhatsApp('+201008901200', text);
              }}
              className="w-full p-3 rounded-xl bg-[#0A0E1A] hover:bg-[#1A1B2F] border border-slate-800 hover:border-emerald-500/40 text-right flex items-center justify-between text-xs transition-all cursor-pointer group"
            >
              <div>
                <span className="font-bold text-white group-hover:text-emerald-300 block">استشارة حضورية بمقر المكتب</span>
                <span className="text-[11px] text-slate-400">برج النخبة القانوني - القاهرة الجديدة</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              onClick={() => {
                const text = `السلام عليكم ورحمة الله،\nأنا الموكل: ${client.name}، أود حجز استشارة هاتفية عاجلة اليوم.`;
                openWhatsApp('+201008901200', text);
              }}
              className="w-full p-3 rounded-xl bg-[#0A0E1A] hover:bg-[#1A1B2F] border border-slate-800 hover:border-emerald-500/40 text-right flex items-center justify-between text-xs transition-all cursor-pointer group"
            >
              <div>
                <span className="font-bold text-white group-hover:text-emerald-300 block">استشارة هاتفية سريعة</span>
                <span className="text-[11px] text-slate-400">اتصال مباشر مع المستشار المختص</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              onClick={() => {
                const text = `السلام عليكم ورحمة الله،\nأنا الموكل: ${client.name}، أود حجز جلسة مرئية عبر زووم / Google Meet.`;
                openWhatsApp('+201008901200', text);
              }}
              className="w-full p-3 rounded-xl bg-[#0A0E1A] hover:bg-[#1A1B2F] border border-slate-800 hover:border-emerald-500/40 text-right flex items-center justify-between text-xs transition-all cursor-pointer group"
            >
              <div>
                <span className="font-bold text-white group-hover:text-emerald-300 block">جلسة مرئية عن بُعد (زووم)</span>
                <span className="text-[11px] text-slate-400">مناسبة للاجتماعات أثناء السفر والتنقل</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
