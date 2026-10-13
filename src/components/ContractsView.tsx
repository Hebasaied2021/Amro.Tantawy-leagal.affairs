import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  Clock,
  Search,
  Plus,
  MessageSquare,
  CheckCircle,
  RefreshCw,
  Calendar,
  X,
  FileCheck,
  ChevronLeft
} from 'lucide-react';
import { ContractItem, ContractCategory } from '../types';
import { getDaysRemaining, formatDateArabic } from '../utils/dateHelpers';
import { openWhatsApp, generateContractRenewalReminder } from '../utils/whatsapp';

interface ContractsViewProps {
  contracts: ContractItem[];
  onAddContract: (newContract: ContractItem) => void;
  onUpdateContract: (updatedContract: ContractItem) => void;
}

const CONTRACT_CATEGORIES: ContractCategory[] = [
  'استشارات سنوية',
  'تأسيس شركات',
  'عقد إيجار تجاري',
  'اتفاقية توريد وخدمات',
  'عقد عمل وتنفيذي',
  'اتفاقية سرية معلومات NDA',
  'عقد مقاولات وإنشاءات',
];

export const ContractsView: React.FC<ContractsViewProps> = ({
  contracts,
  onAddContract,
  onUpdateContract,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'urgent' | 'active' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractItem | null>(null);

  // Check how many are urgent (<= 30 days and >= 0)
  const urgentContractsCount = contracts.filter((c) => {
    const days = getDaysRemaining(c.endDate);
    return days >= 0 && days <= 30;
  }).length;

  const filteredContracts = contracts.filter((c) => {
    const days = getDaysRemaining(c.endDate);
    const isUrgent = days >= 0 && days <= 30;
    const isExpired = days < 0;
    const isActive = days > 30;

    let matchStatus = true;
    if (filterType === 'urgent') matchStatus = isUrgent;
    else if (filterType === 'active') matchStatus = isActive;
    else if (filterType === 'expired') matchStatus = isExpired;

    const matchQuery =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.partyTwo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchStatus && matchQuery;
  });

  // Handle contract renewal for 1 more year
  const handleRenewContract = (contract: ContractItem) => {
    const currentEnd = new Date(contract.endDate);
    currentEnd.setFullYear(currentEnd.getFullYear() + 1);
    const newEndStr = currentEnd.toISOString().split('T')[0];

    const updated: ContractItem = {
      ...contract,
      endDate: newEndStr,
      status: 'نشط',
      notes: `${contract.notes}\n[تم التجديد لمدة سنة إضافية بتاريخ ${new Date().toISOString().split('T')[0]}]`,
    };

    onUpdateContract(updated);
    if (selectedContract?.id === contract.id) {
      setSelectedContract(updated);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-[#131728] border border-cyan-500/20 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-[#00F0FF]" />
              <h1 className="text-xl font-bold text-white">
                إدارة العقود وتنبيهات التجديد الدورية
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              متابعة سريان العقود القانونية والاستشارية، مع تنبيه آلي قبل انتهاء العقد بشهر وإرسال تذكير مباشر بالواتساب.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full md:w-auto py-2.5 px-4 rounded-xl text-xs font-bold text-black bg-[#00F0FF] hover:bg-[#00F0FF]/90 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل عقد جديد</span>
          </button>
        </div>

        {/* Warning Banner if urgent contracts exist */}
        {urgentContractsCount > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <span>
                تنبيه: يوجد <strong className="font-en text-amber-300 font-bold">{urgentContractsCount}</strong> عقود تنتهي مدتها خلال أقل من شهر (30 يوماً). يُنصح بالتواصل الفوري مع الأطراف.
              </span>
            </div>
            <button
              onClick={() => setFilterType('urgent')}
              className="text-xs font-bold text-amber-300 hover:text-white bg-amber-900/50 hover:bg-amber-800/60 px-3 py-1 rounded-lg border border-amber-500/30 transition-all cursor-pointer"
            >
              عرض العقود التي تتطلب تجديداً
            </button>
          </div>
        )}

        {/* Search & Status Filters */}
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث برقم العقد، اسم الطرف الثاني، أو تصنيف العقد..."
              className="w-full bg-[#0A0E1A] border border-slate-700 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'bg-[#1A1B2F] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              جميع العقود ({contracts.length})
            </button>
            <button
              onClick={() => setFilterType('urgent')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'urgent'
                  ? 'bg-amber-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                  : 'bg-amber-950/30 text-amber-300 hover:bg-amber-900/40 border border-amber-500/30'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>يتطلب تجديداً عاجلاً (خلال 30 يوم)</span>
              <span className="font-en font-bold">({urgentContractsCount})</span>
            </button>
            <button
              onClick={() => setFilterType('active')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                filterType === 'active'
                  ? 'bg-[#5E5DF0] text-white shadow-[0_0_10px_rgba(94,93,240,0.3)]'
                  : 'bg-[#1A1B2F] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              ساري ومستقر
            </button>
            <button
              onClick={() => setFilterType('expired')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                filterType === 'expired'
                  ? 'bg-rose-500 text-white'
                  : 'bg-[#1A1B2F] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              منتهي الصلاحية
            </button>
          </div>
        </div>
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContracts.map((contract) => {
          const daysLeft = getDaysRemaining(contract.endDate);
          const isUrgent = daysLeft >= 0 && daysLeft <= 30;
          const isExpired = daysLeft < 0;

          return (
            <div
              key={contract.id}
              className={`bg-[#131728] border rounded-2xl p-4.5 transition-all shadow-lg flex flex-col justify-between ${
                isUrgent
                  ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.12)]'
                  : isExpired
                  ? 'border-rose-500/30'
                  : 'border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              <div>
                {/* Header: Category & Number */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-[#00F0FF] bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg">
                    {contract.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-en">
                    {contract.contractNumber}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-2 line-clamp-2">
                  {contract.title}
                </h3>

                {/* Details */}
                <div className="bg-[#0A0E1A] p-2.5 rounded-xl border border-slate-900 space-y-1.5 text-xs text-slate-300 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">الطرف الثاني:</span>
                    <span className="font-semibold text-white truncate max-w-[170px]">
                      {contract.partyTwo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">القيمة المالية:</span>
                    <span className="font-en text-[#00F0FF] font-bold">
                      {contract.value.toLocaleString()} ج.م
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">آلية التجديد:</span>
                    <span className="text-slate-300">{contract.renewalType}</span>
                  </div>
                </div>

                {/* Expiry Badge */}
                <div className="p-2 rounded-xl mb-3 flex items-center justify-between text-xs bg-[#0A0E1A] border border-slate-800">
                  <span className="text-slate-400">تاريخ الانتهاء:</span>
                  <span className="font-en font-bold text-white">{contract.endDate}</span>
                </div>

                {/* Countdown Status */}
                {isUrgent ? (
                  <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2 mb-3 animate-pulse">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      ⚠️ ينتهي خلال <strong>{daysLeft} يوماً</strong> (أقل من شهر)
                    </span>
                  </div>
                ) : isExpired ? (
                  <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>منتهي الصلاحية منذ {Math.abs(daysLeft)} يوماً</span>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-slate-900/60 text-slate-400 text-xs flex items-center gap-2 mb-3">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>ساري المفعول (متبقي {daysLeft} يوماً)</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                {/* WhatsApp Reminder Button */}
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
                  className="flex-1 py-2 px-2.5 rounded-xl text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(52,211,153,0.25)] cursor-pointer"
                  title="إرسال إشعار تجديد فوري بالواتساب"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>تذكير بالواتساب</span>
                </button>

                {/* Quick Renew Button */}
                <button
                  onClick={() => handleRenewContract(contract)}
                  className="py-2 px-3 rounded-xl text-xs font-semibold text-cyan-300 bg-[#1A1B2F] hover:bg-[#252844] border border-cyan-500/30 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  title="تمديد وتجديد العقد لمدة سنة"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>تجديد +سنة</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredContracts.length === 0 && (
        <div className="p-12 text-center bg-[#131728] border border-slate-800 rounded-2xl">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">لا توجد عقود مطابقة</h3>
          <p className="text-xs text-slate-400">
            يمكنك تسجيل عقد جديد بسهولة باستخدام الزر أعلاه.
          </p>
        </div>
      )}

      {/* Modal: تسجيل عقد جديد */}
      {isAddModalOpen && (
        <AddContractModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={(newContract) => {
            onAddContract(newContract);
            setIsAddModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Add Contract Sub-modal
interface AddContractModalProps {
  onClose: () => void;
  onSave: (c: ContractItem) => void;
}

const AddContractModal: React.FC<AddContractModalProps> = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [category, setCategory] = useState<ContractCategory>('استشارات سنوية');
  const [partyTwo, setPartyTwo] = useState('');
  const [clientPhone, setClientPhone] = useState('+2010');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Default end date is 1 year from now
  const defaultEnd = new Date();
  defaultEnd.setFullYear(defaultEnd.getFullYear() + 1);
  const [endDate, setEndDate] = useState(defaultEnd.toISOString().split('T')[0]);
  
  const [value, setValue] = useState(60000);
  const [renewalType, setRenewalType] = useState<'تلقائي' | 'بإخطار كتابي قبل شهر' | 'سنوي مشروط' | 'غير قابل للتجديد'>('بإخطار كتابي قبل شهر');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newContract: ContractItem = {
      id: `cnt-${Date.now()}`,
      contractNumber: contractNumber || `CNT-2026-${Math.floor(Math.random() * 900 + 100)}`,
      title,
      category,
      partyTwo,
      clientPhone,
      startDate,
      endDate,
      value: Number(value),
      renewalType,
      status: 'نشط',
      autoAlertDays: 30,
      notes,
    };

    onSave(newContract);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#131728] border border-cyan-500/40 rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00F0FF]" />
            <h2 className="text-base font-bold text-white">تسجيل عقد قانوني جديد مع التنبيه</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">عنوان / موضوع العقد *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: عقد استشارات وتمثيل قانوني سنوي..."
              className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">تصنيف العقد *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ContractCategory)}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
              >
                {CONTRACT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">رقم العقد المرجعي *</label>
              <input
                type="text"
                required
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                placeholder="CNT-2026-090"
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF] font-en"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">الطرف الثاني (العميل/الشركة) *</label>
              <input
                type="text"
                required
                value={partyTwo}
                onChange={(e) => setPartyTwo(e.target.value)}
                placeholder="اسم العميل أو الكيان"
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">رقم هاتف الواتساب للتذكير *</label>
              <input
                type="text"
                dir="ltr"
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+201012345678"
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF] font-en"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">تاريخ بداية السريان *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF] font-en"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">تاريخ نهاية السريان والتجديد *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF] font-en"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">القيمة المالية الإجمالية (ج.م)</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF] font-en"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">آلية وشروط التجديد</label>
              <select
                value={renewalType}
                onChange={(e) => setRenewalType(e.target.value as any)}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
              >
                <option value="بإخطار كتابي قبل شهر">بإخطار كتابي قبل شهر (موصى به)</option>
                <option value="تلقائي">تلقائي ما لم يطلب الفسخ</option>
                <option value="سنوي مشروط">سنوي مشروط بإعادة التفاوض</option>
                <option value="غير قابل للتجديد">غير قابل للتجديد</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">ملاحظات وشروط خاصة</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="شروط زيادة النسبة السنوية أو آلية الإخطار..."
              className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
            />
          </div>

          <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-cyan-300 text-[11px] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00F0FF] shrink-0" />
            <span>
              يقوم النظام بتفعيل شارة التنبيه الآلية وتجهيز رسالة الواتساب بمجرد اقتراب تاريخ الانتهاء بأقل من 30 يوماً.
            </span>
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#00F0FF] text-black font-bold rounded-xl hover:bg-cyan-300 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.25)]"
            >
              حفظ وتثبيت العقد
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
