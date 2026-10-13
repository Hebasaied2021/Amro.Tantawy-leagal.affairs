import React, { useState } from 'react';
import {
  FileCode,
  Calculator,
  Copy,
  Check,
  Printer,
  Search,
  BookOpen,
  DollarSign,
  Scale,
  Sparkles
} from 'lucide-react';
import { LegalTemplate } from '../types';
import { INITIAL_TEMPLATES } from '../data/initialData';

export const LegalToolsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'calculator'>('templates');
  const [templates, setTemplates] = useState<LegalTemplate[]>(INITIAL_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<LegalTemplate>(INITIAL_TEMPLATES[0]);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Court Fee Calculator State
  const [claimAmount, setClaimAmount] = useState<number>(100000);
  const [courtType, setCourtType] = useState<'مدني جزئي' | 'مدني كلي' | 'اقتصادي' | 'عمالي'>('مدني كلي');

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedTemplate.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Court Fee Calculation Logic (Egyptian / Arab Legal standard ratio approximation)
  const calculateFees = () => {
    let baseRatio = 0.05; // 5%
    if (courtType === 'عمالي') baseRatio = 0; // Labor cases exempt or nominal
    else if (courtType === 'اقتصادي') baseRatio = 0.06;
    else if (courtType === 'مدني جزئي') baseRatio = 0.035;

    const judicialFee = Math.round(claimAmount * baseRatio);
    const servicesFund = Math.round(judicialFee * 0.1); // 10% صندوق الخدمات
    const lawyerStamp = 150; // دمغة محاماة
    const total = judicialFee + servicesFund + lawyerStamp;

    return {
      judicialFee,
      servicesFund,
      lawyerStamp,
      total,
    };
  };

  const feeResults = calculateFees();

  const filteredTemplates = templates.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-[#131728] border border-cyan-500/20 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-[#00F0FF]" />
              <h1 className="text-xl font-bold text-white">
                أدوات المحامي الذكية ومكتبة الصيغ القانونية
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              صيغ عقود وإنذارات جاهزة للاستخدام الفوري، مع حاسبة تقديرية للرسوم القضائية وصناديق الخدمات.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-[#00F0FF] text-black shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'bg-[#0A0E1A] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              مكتبة الصيغ والعقود
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-[#00F0FF] text-black shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'bg-[#0A0E1A] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              حاسبة الرسوم القضائية
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: TEMPLATES LIBRARY */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Templates list (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث بالاسم أو التصنيف..."
                className="w-full bg-[#131728] border border-slate-800 focus:border-[#00F0FF] rounded-xl pr-9 pl-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <div className="space-y-2">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                    selectedTemplate.id === tpl.id
                      ? 'bg-[#1A1B2F] border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                      : 'bg-[#131728] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-[#00F0FF] bg-cyan-950/60 px-2 py-0.5 rounded">
                      {tpl.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-white mb-1">{tpl.title}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{tpl.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Template Preview (8 cols) */}
          <div className="lg:col-span-8 bg-[#131728] border border-cyan-500/20 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div>
                <span className="text-xs text-[#00F0FF] font-bold">{selectedTemplate.category}</span>
                <h2 className="text-base font-bold text-white">{selectedTemplate.title}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="py-1.5 px-3 rounded-lg text-xs font-bold text-black bg-[#00F0FF] hover:bg-cyan-300 transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ الصيغة'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-[#1A1B2F] hover:bg-slate-800 border border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة</span>
                </button>
              </div>
            </div>

            <div className="bg-[#0A0E1A] p-4 rounded-xl border border-slate-800">
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                {selectedTemplate.content}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COURT FEES CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="bg-[#131728] border border-cyan-500/20 rounded-2xl p-5 sm:p-6 max-w-2xl mx-auto space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-[#00F0FF]" />
            <h2 className="text-base font-bold text-white">حاسبة الرسوم القضائية والدمغات التقريبية</h2>
          </div>
          <p className="text-xs text-slate-400">
            أداة فورية لحساب الرسوم النسبية وصناديق الخدمات القضائية لتقدير تكاليف الدعوى قبل قيدها بالجدول.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">قيمة المطالبة / النزاع (ج.م) *</label>
              <input
                type="number"
                value={claimAmount}
                onChange={(e) => setClaimAmount(Number(e.target.value))}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF] font-en text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">نوع المحكمة والاختصاص *</label>
              <select
                value={courtType}
                onChange={(e) => setCourtType(e.target.value as any)}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
              >
                <option value="مدني كلي">محكمة مدني كلي (5%)</option>
                <option value="اقتصادي">المحكمة الاقتصادية (6%)</option>
                <option value="مدني جزئي">محكمة مدني جزئي (3.5%)</option>
                <option value="عمالي">محكمة العمال (معفى من الرسوم النسبية)</option>
              </select>
            </div>
          </div>

          {/* Results Box */}
          <div className="bg-[#0A0E1A] p-4 rounded-xl border border-cyan-500/30 space-y-2 text-xs font-en">
            <h3 className="font-bold text-white font-sans text-xs border-b border-slate-800 pb-2">
              البيان التقديري للرسوم الواجب سدادها لخزينة المحكمة:
            </h3>

            <div className="flex justify-between text-slate-300">
              <span className="font-sans">الرسم النسبي للمحكمة:</span>
              <span className="font-bold">{feeResults.judicialFee.toLocaleString()} ج.م</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span className="font-sans">صندوق الخدمات القضائية (10%):</span>
              <span className="font-bold">{feeResults.servicesFund.toLocaleString()} ج.م</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span className="font-sans">دمغة المحاماة ورسوم التوكيل:</span>
              <span className="font-bold">{feeResults.lawyerStamp.toLocaleString()} ج.م</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between text-sm">
              <span className="font-sans font-bold text-cyan-300">إجمالي الرسوم التقديرية:</span>
              <span className="font-bold text-[#00F0FF]">{feeResults.total.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
