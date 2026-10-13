import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Scale,
  FileText,
  Upload,
  ChevronRight,
  ChevronLeft,
  X,
  FileCheck,
  Check,
  ArrowRight,
  FolderOpen,
  Eye,
  AlertCircle
} from 'lucide-react';
import { CaseItem, CaseCategory, CaseStage, HearingLog, CaseDocument } from '../types';

interface CasesViewProps {
  cases: CaseItem[];
  onAddCase: (newCase: CaseItem) => void;
  onUpdateCase: (updatedCase: CaseItem) => void;
}

const ALL_CATEGORIES: CaseCategory[] = [
  'جنائي',
  'مدني',
  'تجاري',
  'عمالي',
  'أحوال شخصية',
  'إداري وتعويضات',
  'عقاري',
];

const STAGES_LIST: CaseStage[] = [
  'تسجيل وتوثيق الدعوى',
  'إيداع المذكرات والمستندات',
  'جلسات المرافعة والتحقيق',
  'محجوزة للحكم',
  'صدور الحكم الابتدائي',
  'مرحلة الاستئناف والطعن',
  'التنفيذ والتحصيل',
];

export const CasesView: React.FC<CasesViewProps> = ({
  cases,
  onAddCase,
  onUpdateCase,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CaseCategory | 'الكل'>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddHearingOpen, setIsAddHearingOpen] = useState(false);

  // Hearing form state
  const [newHearingDecision, setNewHearingDecision] = useState('');
  const [newHearingNotes, setNewHearingNotes] = useState('');
  const [newHearingNextDate, setNewHearingNextDate] = useState('');
  const [newHearingLawyer, setNewHearingLawyer] = useState('أ. عمرو طنطاوي (المستشار القانوني)');

  // Filter cases
  const filteredCases = cases.filter((c) => {
    const matchCategory = selectedCategory === 'الكل' || c.category === selectedCategory;
    const matchQuery =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.opponentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.court.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  // Calculate current stage index
  const getStageIndex = (stage: CaseStage) => STAGES_LIST.indexOf(stage);

  // Handle stage change
  const handleStageSelect = (stage: CaseStage) => {
    if (!selectedCase) return;
    const updated = { ...selectedCase, currentStage: stage };
    setSelectedCase(updated);
    onUpdateCase(updated);
  };

  // Handle adding hearing log
  const handleSaveHearing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    const newLog: HearingLog = {
      id: `h-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      stage: selectedCase.currentStage,
      courtDecision: newHearingDecision,
      notes: newHearingNotes,
      nextHearingDate: newHearingNextDate || undefined,
      attendedLawyer: newHearingLawyer,
    };

    const updatedCase: CaseItem = {
      ...selectedCase,
      hearings: [newLog, ...selectedCase.hearings],
      nextHearingDate: newHearingNextDate || selectedCase.nextHearingDate,
    };

    setSelectedCase(updatedCase);
    onUpdateCase(updatedCase);
    setIsAddHearingOpen(false);
    setNewHearingDecision('');
    setNewHearingNotes('');
    setNewHearingNextDate('');
  };

  // Simulated Document Upload
  const handleUploadDocument = () => {
    if (!selectedCase) return;
    const docTitles = [
      'مذكرة تعقيب ختامية',
      'حافظة مستندات إضافية مؤيدة',
      'إعلان رسمي على يد محضر',
      'صورة التوكيل الرسمي المخصص',
    ];
    const randomTitle = docTitles[Math.floor(Math.random() * docTitles.length)];
    const newDoc: CaseDocument = {
      id: `doc-${Date.now()}`,
      title: `${randomTitle} (${selectedCase.documents.length + 1})`,
      fileType: 'PDF',
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
    };

    const updated = {
      ...selectedCase,
      documents: [newDoc, ...selectedCase.documents],
    };
    setSelectedCase(updated);
    onUpdateCase(updated);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="bg-[#131728] border border-cyan-500/20 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-5 h-5 text-[#00F0FF]" />
              <h1 className="text-xl font-bold text-white">إدارة القضايا ومسار الدعوى</h1>
            </div>
            <p className="text-xs text-slate-400">
              تصنيف الدعاوى حسب الاختصاص القضائي ومتابعة محطات مسار كل قضية والجلسات والمستندات.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full md:w-auto py-2.5 px-4 rounded-xl text-xs font-bold text-black bg-[#00F0FF] hover:bg-[#00F0FF]/90 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل قضية جديدة</span>
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="mt-5 space-y-3.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث برقم القضية، اسم الموكل، الخصم، أو المحكمة..."
              className="w-full bg-[#0A0E1A] border border-slate-700 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>

          {/* Categories Tab Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('الكل')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'الكل'
                  ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'bg-[#1A1B2F] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              الكل ({cases.length})
            </button>
            {ALL_CATEGORIES.map((cat) => {
              const count = cases.filter((c) => c.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                      : 'bg-[#1A1B2F] text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-en ${
                    selectedCategory === cat ? 'bg-black text-[#00F0FF]' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCases.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedCase(c)}
            className="bg-[#131728] border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4.5 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] flex flex-col justify-between group"
          >
            <div>
              {/* Category & Status */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-semibold text-[#00F0FF] bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg">
                  {c.category}
                </span>
                <span className="text-[11px] font-medium text-slate-400 font-en">
                  {c.caseNumber}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2">
                {c.title}
              </h3>

              {/* Parties */}
              <div className="text-xs space-y-1 text-slate-300 mb-3 bg-[#0A0E1A] p-2.5 rounded-xl border border-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">الموكل:</span>
                  <span className="font-semibold text-white truncate max-w-[170px]">{c.clientName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">الخصم:</span>
                  <span className="text-slate-400 truncate max-w-[170px]">{c.opponentName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">المحكمة:</span>
                  <span className="text-slate-400 truncate max-w-[170px]">{c.court}</span>
                </div>
              </div>
            </div>

            {/* Bottom Current Stage & Next Hearing */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">مسار القضية:</span>
                <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {c.currentStage}
                </span>
              </div>

              {c.nextHearingDate && (
                <div className="flex items-center justify-between text-[11px] bg-cyan-950/30 border border-cyan-800/40 p-1.5 rounded-lg text-cyan-300">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#00F0FF]" />
                    <span>الجلسة القادمة:</span>
                  </span>
                  <span className="font-en font-bold">{c.nextHearingDate}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-[#00F0FF] group-hover:underline pt-1">
                <span>عرض التفاصيل والمسار والمستندات</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="p-12 text-center bg-[#131728] border border-slate-800 rounded-2xl">
          <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">لا توجد قضايا مطابقة</h3>
          <p className="text-xs text-slate-400">
            لم نجد أي قضية بهذا التصنيف أو البحث. يمكنك إضافة قضية جديدة الآن.
          </p>
        </div>
      )}

      {/* Case Detailed Modal with Lifecycle / Timeline */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#131728] border border-cyan-500/30 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl relative">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#131728]/95 backdrop-blur-md border-b border-slate-800 p-4 sm:p-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-[#00F0FF]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#00F0FF] text-black">
                      {selectedCase.category}
                    </span>
                    <span className="text-xs text-slate-400 font-en">{selectedCase.caseNumber}</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                    {selectedCase.title}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setSelectedCase(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#0A0E1A] hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* SECTION 1: مسار القضية التفاعلي (Interactive Case Progress Tracker) */}
              <div className="bg-[#0A0E1A] border border-cyan-500/25 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
                    <h3 className="text-sm font-bold text-white">
                      مسار القضية والمحطات الإجرائية
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    المرحلة الحالية:{' '}
                    <span className="text-emerald-400 font-bold">
                      {selectedCase.currentStage}
                    </span>
                  </span>
                </div>

                {/* Visual Step Stepper */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {STAGES_LIST.map((stage, idx) => {
                      const currentIdx = getStageIndex(selectedCase.currentStage);
                      const isPast = idx < currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <button
                          key={stage}
                          onClick={() => handleStageSelect(stage)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[78px] ${
                            isCurrent
                              ? 'bg-gradient-to-b from-[#1A1B2F] to-[#121626] border-[#00F0FF] text-white shadow-[0_0_12px_rgba(0,240,255,0.3)] ring-1 ring-[#00F0FF]'
                              : isPast
                              ? 'bg-[#131728] border-emerald-500/30 text-emerald-300'
                              : 'bg-[#0E1220] border-slate-800 text-slate-500 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-center w-5 h-5 rounded-full mb-1 text-[10px] font-bold font-en">
                            {isPast ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : isCurrent ? (
                              <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>
                          <span className="text-[10px] font-medium leading-tight line-clamp-2">
                            {stage}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    💡 انقر على أي مرحلة أعلاه لتحديث مسار القضية فورياً.
                  </p>
                </div>
              </div>

              {/* SECTION 2: تفاصيل وبيانات الدعوى */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#0A0E1A] p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white mb-2 text-xs border-b border-slate-800 pb-1">
                    أطراف النزاع وهيئة المحكمة
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">الموكل:</span>
                    <span className="font-bold text-white">{selectedCase.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">هاتف الموكل:</span>
                    <span className="font-en text-slate-300">{selectedCase.clientPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">الخصم:</span>
                    <span className="text-rose-300 font-semibold">{selectedCase.opponentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">المحكمة:</span>
                    <span className="text-slate-300">{selectedCase.court}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">الدائرة / القاضي:</span>
                    <span className="text-slate-300">{selectedCase.circuit} - {selectedCase.judge || 'غير محدد'}</span>
                  </div>
                </div>

                <div className="bg-[#0A0E1A] p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white mb-2 text-xs border-b border-slate-800 pb-1">
                    الموقف المالي والإجرائي
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">إجمالي الأتعاب المقررة:</span>
                    <span className="font-en font-bold text-white">{selectedCase.totalFees.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">المسدد من الأتعاب:</span>
                    <span className="font-en font-bold text-emerald-400">{selectedCase.paidFees.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">المتبقي:</span>
                    <span className="font-en font-bold text-amber-400">
                      {(selectedCase.totalFees - selectedCase.paidFees).toLocaleString()} ج.م
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">تاريخ بدء التوكيل:</span>
                    <span className="font-en text-slate-300">{selectedCase.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">حالة الدعوى:</span>
                    <span className="font-bold text-[#00F0FF]">{selectedCase.status}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: سجل الجلسات والمرافعات (Hearings Log) */}
              <div className="bg-[#0A0E1A] border border-slate-800 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#00F0FF]" />
                    <h3 className="text-sm font-bold text-white">
                      سجل الجلسات والقرارات القضائية ({selectedCase.hearings.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsAddHearingOpen(true)}
                    className="py-1 px-3 rounded-lg text-xs font-semibold text-black bg-[#00F0FF] hover:bg-[#00F0FF]/90 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>تسجيل جلسة جديدة</span>
                  </button>
                </div>

                {/* Hearings List */}
                <div className="space-y-3">
                  {selectedCase.hearings.map((h, i) => (
                    <div
                      key={h.id}
                      className="bg-[#131728] border border-slate-800/80 p-3.5 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-300">
                          جلسة بتاريخ: <span className="font-en">{h.date}</span>
                        </span>
                        <span className="text-slate-400">المحامي الحاضر: {h.attendedLawyer}</span>
                      </div>
                      <div className="text-white font-medium">
                        <span className="text-slate-400">قرار المحكمة: </span>
                        {h.courtDecision}
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-500">ما تم بالجلسة: </span>
                        {h.notes}
                      </div>
                      {h.nextHearingDate && (
                        <div className="text-amber-300 pt-1 border-t border-slate-900 flex items-center justify-between text-[11px]">
                          <span>الجلسة القادمة المقررة: <strong className="font-en">{h.nextHearingDate}</strong></span>
                        </div>
                      )}

                      {/* WhatsApp Notify Client Button */}
                      <div className="pt-2 border-t border-slate-900 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const msg = `السلام عليكم ورحمة الله وبركاته،
الأستاذ/ة: ${selectedCase.clientName} المحترم/ة ⚖️

تحية طيبة من مكتب «سمارتك للمحاماة والاستشارات القانونية»،

نود إحاطتكم علماً بمستجدات جلستكم القضائية اليوم:
🔢 رقم الدعوى: ${selectedCase.caseNumber}
🏛️ المحكمة: ${selectedCase.court}
⚖️ قرار المحكمة: ${h.courtDecision}
${h.nextHearingDate ? `📅 موعد الجلسة القادمة: ${h.nextHearingDate}` : ''}

علماً بأن ملفكم قيد المتابعة الدقيقة من قبل فريق الدفاع.
شاكرين ثقتكم الغالية بنا.`;
                            const cleanPhone = selectedCase.clientPhone.replace(/[^\d+]/g, '').replace(/^\+/, '');
                            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                        >
                          <FileText className="w-3 h-3" />
                          <span>إخطار الموكل بنتائج الجلسة عبر الواتساب</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: مستندات ومذكرات الدعوى (Case Documents) */}
              <div className="bg-[#0A0E1A] border border-slate-800 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#00F0FF]" />
                    <h3 className="text-sm font-bold text-white">
                      مستندات وحوافظ القضية ({selectedCase.documents.length})
                    </h3>
                  </div>
                  <button
                    onClick={handleUploadDocument}
                    className="py-1 px-3 rounded-lg text-xs font-semibold text-white bg-[#5E5DF0] hover:bg-[#5E5DF0]/90 transition-all cursor-pointer flex items-center gap-1 shadow-[0_0_10px_rgba(94,93,240,0.3)]"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>إرفاق مستند جديد</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedCase.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-[#131728] border border-slate-800/80 p-3 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-cyan-950/80 text-[#00F0FF] flex items-center justify-center font-bold font-en text-[11px]">
                          {doc.fileType}
                        </div>
                        <div>
                          <div className="font-bold text-white line-clamp-1">{doc.title}</div>
                          <div className="text-[11px] text-slate-500 font-en">
                            {doc.uploadDate} · {doc.fileSize}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                        مؤرشف
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: تسجيل جلسة جديدة */}
      {isAddHearingOpen && selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131728] border border-cyan-500/40 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">تسجيل تفاصيل جلسة مرافعة جديدة</h3>
              <button onClick={() => setIsAddHearingOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHearing} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">قرار المحكمة</label>
                <input
                  type="text"
                  required
                  value={newHearingDecision}
                  onChange={(e) => setNewHearingDecision(e.target.value)}
                  placeholder="مثال: حجز الدعوى للحكم / التأجيل لتقديم المستندات"
                  className="w-full bg-[#0A0E1A] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ما تم بالجلسة ودفوع المحامي</label>
                <textarea
                  rows={2}
                  required
                  value={newHearingNotes}
                  onChange={(e) => setNewHearingNotes(e.target.value)}
                  placeholder="تفاصيل ما أبداه الدفاع من دفوع أو مذكرات..."
                  className="w-full bg-[#0A0E1A] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">موعد الجلسة القادمة (إن وجد)</label>
                  <input
                    type="date"
                    value={newHearingNextDate}
                    onChange={(e) => setNewHearingNextDate(e.target.value)}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-[#00F0FF] font-en"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">المحامي الحاضر</label>
                  <input
                    type="text"
                    value={newHearingLawyer}
                    onChange={(e) => setNewHearingLawyer(e.target.value)}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-[#00F0FF]"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#00F0FF] text-black font-bold rounded-lg hover:bg-cyan-300 transition-all"
                >
                  حفظ الجلسة
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddHearingOpen(false)}
                  className="px-4 py-2 bg-[#1A1B2F] text-slate-300 rounded-lg"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: تسجيل قضية جديدة بالكامل */}
      {isAddModalOpen && (
        <AddCaseModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={(newCase) => {
            onAddCase(newCase);
            setIsAddModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Sub-component for adding a new Case
interface AddCaseModalProps {
  onClose: () => void;
  onSave: (c: CaseItem) => void;
}

const AddCaseModal: React.FC<AddCaseModalProps> = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [category, setCategory] = useState<CaseCategory>('مدني');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+2010');
  const [opponentName, setOpponentName] = useState('');
  const [court, setCourt] = useState('');
  const [circuit, setCircuit] = useState('');
  const [totalFees, setTotalFees] = useState(30000);
  const [paidFees, setPaidFees] = useState(10000);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCase: CaseItem = {
      id: `case-${Date.now()}`,
      title,
      caseNumber: caseNumber || `${Math.floor(Math.random() * 9000 + 1000)} / 2026`,
      category,
      clientName,
      clientPhone,
      opponentName,
      court: court || 'محكمة استئناف القاهرة',
      circuit: circuit || 'الدائرة الأولى',
      startDate: new Date().toISOString().split('T')[0],
      currentStage: 'تسجيل وتوثيق الدعوى',
      status: 'متداولة',
      totalFees: Number(totalFees),
      paidFees: Number(paidFees),
      hearings: [
        {
          id: `h-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          stage: 'تسجيل وتوثيق الدعوى',
          courtDecision: 'قيد صحيفة الدعوى وتحديد أولى جلسات المرافعة',
          notes: 'تم سداد الرسم وقيد الأوراق بالجدول الإلكتروني للمحكمة.',
          attendedLawyer: 'أ. محمود عبد الشافي',
        },
      ],
      documents: [
        {
          id: `doc-${Date.now()}`,
          title: 'صحيفة الدعوى وأصل سند التوكيل',
          fileType: 'PDF',
          uploadDate: new Date().toISOString().split('T')[0],
          fileSize: '2.5 MB',
        },
      ],
      description,
    };

    onSave(newCase);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#131728] border border-cyan-500/40 rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#00F0FF]" />
            <h2 className="text-base font-bold text-white">تسجيل وتصنيف قضية جديدة</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">موضوع / عنوان القضية *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: دعوى مطالبة بتعويض عن إخلال تعاقدي..."
              className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">تصنيف القضية القانوني *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CaseCategory)}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
              >
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">رقم القضية والجدول *</label>
              <input
                type="text"
                required
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="مثال: 1245 / 2026 مدني كلي"
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">اسم الموكل *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="اسم العميل أو اسم الشركة"
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">هاتف الموكل (واتساب)</label>
              <input
                type="text"
                dir="ltr"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+201012345678"
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF] font-en"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">الطرف الخصم *</label>
              <input
                type="text"
                required
                value={opponentName}
                onChange={(e) => setOpponentName(e.target.value)}
                placeholder="اسم المدعى عليه أو الخصم"
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">المحكمة المختصة والدائرة</label>
              <input
                type="text"
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                placeholder="محكمة جنوب القاهرة - الدائرة 5"
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">إجمالي الأتعاب المتفق عليها (ج.م)</label>
              <input
                type="number"
                value={totalFees}
                onChange={(e) => setTotalFees(Number(e.target.value))}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF] font-en"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">الدفعة المسددة مقدماً (ج.م)</label>
              <input
                type="number"
                value={paidFees}
                onChange={(e) => setPaidFees(Number(e.target.value))}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF] font-en"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">ملاحظات ودفوع تمهيدية</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ملخص النزاع القانوني وطلبات الموكل..."
              className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
            />
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#00F0FF] text-black font-bold rounded-xl hover:bg-cyan-300 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.25)]"
            >
              حفظ وتثبيت القضية
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
