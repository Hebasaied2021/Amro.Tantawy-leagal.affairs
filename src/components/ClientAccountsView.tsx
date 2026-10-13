import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Download,
  Printer,
  FileText,
  DollarSign,
  TrendingUp,
  Receipt,
  User,
  Phone,
  Building,
  CheckCircle2,
  X,
  MessageSquare,
  Scale,
  Calendar,
  ChevronLeft
} from 'lucide-react';
import { ClientAccount, Transaction } from '../types';
import { exportClientReportToPDF } from '../utils/pdfGenerator';
import { openWhatsApp, generateFinancialStatementWhatsApp } from '../utils/whatsapp';

interface ClientAccountsViewProps {
  clients: ClientAccount[];
  onAddClient: (newClient: ClientAccount) => void;
  onUpdateClient: (updatedClient: ClientAccount) => void;
}

export const ClientAccountsView: React.FC<ClientAccountsViewProps> = ({
  clients,
  onAddClient,
  onUpdateClient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientAccount | null>(null);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [statementModalClient, setStatementModalClient] = useState<ClientAccount | null>(null);

  // New Transaction Form State
  const [txType, setTxType] = useState<'دفعة أتعاب' | 'مصروفات قضائية' | 'رسوم توكيل وتوثيق' | 'أتعاب استشارة' | 'استرداد مصاريف'>('دفعة أتعاب');
  const [txAmount, setTxAmount] = useState(10000);
  const [txMethod, setTxMethod] = useState<'تحويل بنكي' | 'نقدي' | 'شيك مصدّق' | 'بطاقة دفع'>('تحويل بنكي');
  const [txReceipt, setTxReceipt] = useState('');
  const [txNotes, setTxNotes] = useState('');
  const [txCaseNum, setTxCaseNum] = useState('');

  // Filter clients
  const filteredClients = clients.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.phone.includes(searchQuery)
    );
  });

  // Aggregates
  const totalAgreed = clients.reduce((acc, c) => acc + c.totalAgreedFees, 0);
  const totalPaid = clients.reduce((acc, c) => acc + c.totalPaid, 0);
  const totalRemaining = totalAgreed - totalPaid;
  const totalExpenses = clients.reduce((acc, c) => acc + c.courtExpenses, 0);

  // Handle adding a new transaction to the selected client
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: txType,
      amount: Number(txAmount),
      method: txMethod,
      receiptNumber: txReceipt || `REC-${Math.floor(Math.random() * 9000 + 1000)}`,
      caseNumber: txCaseNum || undefined,
      notes: txNotes,
    };

    let newTotalPaid = selectedClient.totalPaid;
    let newExpenses = selectedClient.courtExpenses;

    if (txType === 'دفعة أتعاب' || txType === 'أتعاب استشارة') {
      newTotalPaid += Number(txAmount);
    } else if (txType === 'مصروفات قضائية' || txType === 'رسوم توكيل وتوثيق') {
      newExpenses += Number(txAmount);
    } else if (txType === 'استرداد مصاريف') {
      newExpenses = Math.max(0, newExpenses - Number(txAmount));
    }

    const updatedClient: ClientAccount = {
      ...selectedClient,
      totalPaid: newTotalPaid,
      courtExpenses: newExpenses,
      transactions: [newTx, ...selectedClient.transactions],
    };

    onUpdateClient(updatedClient);
    setSelectedClient(updatedClient);
    setIsAddTransactionOpen(false);
    setTxAmount(10000);
    setTxNotes('');
    setTxReceipt('');
  };

  // Direct Browser Print for High-Res Arabic Document
  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Aggregates */}
      <div className="bg-[#131728] border border-cyan-500/20 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-5 h-5 text-[#00F0FF]" />
              <h1 className="text-xl font-bold text-white">
                حسابات العملاء والتقارير المالية المعتمدة
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              كشف حساب مستقل لكل عميل لمتابعة الأتعاب، سندات القبض والصرف، وتصدير كشف حساب تفصيلي بصيغة PDF.
            </p>
          </div>

          <button
            onClick={() => setIsAddClientOpen(true)}
            className="w-full md:w-auto py-2.5 px-4 rounded-xl text-xs font-bold text-black bg-[#00F0FF] hover:bg-[#00F0FF]/90 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل ملف عميل جديد</span>
          </button>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="bg-[#0A0E1A] p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">إجمالي الأتعاب المقررة</span>
            <span className="text-base sm:text-lg font-bold text-white font-en tabular-nums">
              {totalAgreed.toLocaleString()} ج.م
            </span>
          </div>
          <div className="bg-[#0A0E1A] p-3 rounded-xl border border-emerald-500/30">
            <span className="text-[11px] text-emerald-400 block mb-0.5">المسدد والمحصل فعلياً</span>
            <span className="text-base sm:text-lg font-bold text-emerald-400 font-en tabular-nums">
              {totalPaid.toLocaleString()} ج.م
            </span>
          </div>
          <div className="bg-[#0A0E1A] p-3 rounded-xl border border-amber-500/30">
            <span className="text-[11px] text-amber-400 block mb-0.5">المتبقي المطلوب تحصيله</span>
            <span className="text-base sm:text-lg font-bold text-amber-400 font-en tabular-nums">
              {totalRemaining.toLocaleString()} ج.م
            </span>
          </div>
          <div className="bg-[#0A0E1A] p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-cyan-300 block mb-0.5">المصروفات والرسوم القضائية</span>
            <span className="text-base sm:text-lg font-bold text-cyan-300 font-en tabular-nums">
              {totalExpenses.toLocaleString()} ج.م
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم العميل، الشركة، أو رقم الهاتف..."
            className="w-full bg-[#0A0E1A] border border-slate-700 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const remaining = client.totalAgreedFees - client.totalPaid;
          const isFullySettled = remaining <= 0;

          return (
            <div
              key={client.id}
              className="bg-[#131728] border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4.5 transition-all shadow-lg flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950 text-[#00F0FF] flex items-center justify-center font-bold font-en text-xs">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{client.name}</h3>
                      {client.companyName && (
                        <p className="text-[11px] text-slate-400 line-clamp-1">{client.companyName}</p>
                      )}
                    </div>
                  </div>

                  {isFullySettled ? (
                    <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                      خالص الأتعاب
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-md">
                      مستحق السداد
                    </span>
                  )}
                </div>

                {/* Financial Ledger Mini-table */}
                <div className="bg-[#0A0E1A] p-2.5 rounded-xl border border-slate-900 space-y-1.5 text-xs mb-3 font-en">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">الأتعاب المتفق عليها:</span>
                    <span className="font-bold text-white">{client.totalAgreedFees.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">المسدد حتى تاريخه:</span>
                    <span className="font-bold text-emerald-400">{client.totalPaid.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">الرصيد المتبقي:</span>
                    <span className="font-bold text-amber-400">{remaining.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                    <span className="text-slate-500 font-sans">المصروفات القضائية:</span>
                    <span className="text-cyan-300 font-semibold">{client.courtExpenses.toLocaleString()} ج.م</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between mb-3">
                  <span>عدد العمليات والسندات:</span>
                  <span className="font-en text-white font-bold">{client.transactions.length} سندات</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                {/* PDF Report Export Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportClientReportToPDF(client)}
                    className="flex-1 py-2 px-2.5 rounded-xl text-xs font-bold text-black bg-[#00F0FF] hover:bg-cyan-300 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.25)] cursor-pointer"
                    title="تصدير كشف حساب PDF معتمد فوراً"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تصدير تقرير PDF</span>
                  </button>

                  <button
                    onClick={() => setStatementModalClient(client)}
                    className="py-2 px-3 rounded-xl text-xs font-semibold text-white bg-[#1A1B2F] hover:bg-[#252844] border border-cyan-500/30 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="معاينة وطباعة كشف الحساب التفصيلي"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>معاينة</span>
                  </button>
                </div>

                {/* Ledger & Transaction management */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedClient(client);
                      setIsAddTransactionOpen(true);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-cyan-300 bg-[#0E1324] hover:bg-cyan-950/40 border border-slate-800 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-[#00F0FF]" />
                    <span>سند دفع / قبض</span>
                  </button>

                  <button
                    onClick={() => {
                      const msg = generateFinancialStatementWhatsApp(
                        client.name,
                        client.totalAgreedFees,
                        client.totalPaid,
                        remaining
                      );
                      openWhatsApp(client.phone, msg);
                    }}
                    className="py-1.5 px-2.5 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="إرسال الموقف المالي عبر الواتساب"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>واتساب</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="p-12 text-center bg-[#131728] border border-slate-800 rounded-2xl">
          <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">لا يوجد عملاء مطابقون</h3>
          <p className="text-xs text-slate-400">
            يمكنك تسجيل حساب عميل جديد من خلال الزر في الأعلى.
          </p>
        </div>
      )}

      {/* MODAL: استعراض وطباعة كشف الحساب المالي التفصيلي */}
      {statementModalClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#131728] border border-cyan-500/30 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl relative">
            {/* Header with Export & Print controls */}
            <div className="sticky top-0 bg-[#131728]/95 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between z-10 no-print">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#00F0FF]" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  كشف حساب مالي تفصيلي: {statementModalClient.name}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportClientReportToPDF(statementModalClient)}
                  className="py-1.5 px-3 rounded-lg text-xs font-bold text-black bg-[#00F0FF] hover:bg-cyan-300 flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تصدير PDF</span>
                </button>
                <button
                  onClick={handlePrintStatement}
                  className="py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-[#5E5DF0] hover:bg-[#5E5DF0]/90 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة</span>
                </button>
                <button
                  onClick={() => setStatementModalClient(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white bg-[#0A0E1A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Statement Canvas */}
            <div className="p-6 space-y-6 bg-[#0A0E1A] text-slate-200">
              {/* Official Office Letterhead */}
              <div className="border-b-2 border-[#00F0FF]/30 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#5E5DF0] to-[#00F0FF] p-[1.5px] flex items-center justify-center">
                    <div className="w-full h-full bg-[#0A0E1A] rounded-[10px] flex items-center justify-center">
                      <Scale className="w-6 h-6 text-[#00F0FF]" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">
                      مكتب سمارتك للمحاماة والاستشارات القانونية
                    </h2>
                    <p className="text-xs text-cyan-300 font-en">SMARTECH LEGAL & ADVOCACY FIRM</p>
                    <p className="text-[11px] text-slate-400">القاهرة الجديدة - برج النخبة القانوني | هاتف: +201008901200</p>
                  </div>
                </div>

                <div className="text-left font-en text-xs text-slate-400">
                  <div>التاريخ: <span className="text-white font-bold">{new Date().toISOString().split('T')[0]}</span></div>
                  <div>رقم الملف: <span className="text-[#00F0FF] font-bold">ACC-{statementModalClient.id.toUpperCase()}</span></div>
                </div>
              </div>

              {/* Client Info Banner */}
              <div className="bg-[#131728] border border-slate-800 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">اسم الموكل / العميل:</span>
                  <span className="text-sm font-bold text-white">{statementModalClient.name}</span>
                  {statementModalClient.companyName && (
                    <span className="text-slate-400 block mt-0.5">{statementModalClient.companyName}</span>
                  )}
                </div>
                <div className="space-y-1">
                  <div><span className="text-slate-500">الهاتف: </span><span className="font-en text-white">{statementModalClient.phone}</span></div>
                  <div><span className="text-slate-500">الرقم القومي / السجل: </span><span className="font-en text-white">{statementModalClient.nationalId || 'مسجل رسمياً'}</span></div>
                  <div><span className="text-slate-500">العنوان: </span><span className="text-slate-300">{statementModalClient.address || 'القاهرة، جمهورية مصر العربية'}</span></div>
                </div>
              </div>

              {/* Totals Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-[#131728] border border-slate-800 p-3 rounded-xl">
                  <span className="text-[11px] text-slate-400 block mb-1">الأتعاب المتفق عليها</span>
                  <span className="text-base font-bold text-white font-en">{statementModalClient.totalAgreedFees.toLocaleString()} ج.م</span>
                </div>
                <div className="bg-[#131728] border border-emerald-500/30 p-3 rounded-xl">
                  <span className="text-[11px] text-emerald-400 block mb-1">المسدد فعلياً</span>
                  <span className="text-base font-bold text-emerald-400 font-en">{statementModalClient.totalPaid.toLocaleString()} ج.م</span>
                </div>
                <div className="bg-[#131728] border border-slate-800 p-3 rounded-xl">
                  <span className="text-[11px] text-cyan-300 block mb-1">المصروفات القضائية</span>
                  <span className="text-base font-bold text-cyan-300 font-en">{statementModalClient.courtExpenses.toLocaleString()} ج.م</span>
                </div>
                <div className="bg-[#131728] border border-amber-500/30 p-3 rounded-xl">
                  <span className="text-[11px] text-amber-400 block mb-1">صافي الرصيد المستحق</span>
                  <span className="text-base font-bold text-amber-400 font-en">
                    {(statementModalClient.totalAgreedFees - statementModalClient.totalPaid + statementModalClient.courtExpenses).toLocaleString()} ج.م
                  </span>
                </div>
              </div>

              {/* Itemized Transactions Table */}
              <div>
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-[#00F0FF]" />
                  <span>جدول حركة السندات والمدفوعات والمصروفات بالتفصيل:</span>
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#131728] text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">التاريخ</th>
                        <th className="p-2.5">نوع العملية</th>
                        <th className="p-2.5">طريقة الدفع</th>
                        <th className="p-2.5">رقم الإيصال</th>
                        <th className="p-2.5">المبلغ (ج.م)</th>
                        <th className="p-2.5">البيان / الملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 bg-[#0A0E1A]">
                      {statementModalClient.transactions.map((tx, idx) => {
                        const isIncome = tx.type === 'دفعة أتعاب' || tx.type === 'أتعاب استشارة';
                        return (
                          <tr key={tx.id} className="hover:bg-slate-900/40">
                            <td className="p-2.5 font-en text-slate-500">{idx + 1}</td>
                            <td className="p-2.5 font-en text-slate-300 whitespace-nowrap">{tx.date}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                isIncome ? 'text-emerald-300 bg-emerald-950/50' : 'text-amber-300 bg-amber-950/50'
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-300">{tx.method}</td>
                            <td className="p-2.5 font-en text-slate-400">{tx.receiptNumber}</td>
                            <td className={`p-2.5 font-en font-bold ${isIncome ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {tx.amount.toLocaleString()}
                            </td>
                            <td className="p-2.5 text-slate-400">{tx.notes || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Legal Disclaimer & Signatures */}
              <div className="pt-6 border-t border-slate-800 grid grid-cols-2 text-center text-xs text-slate-400">
                <div>
                  <p className="mb-8">المحاسب المالي المختص</p>
                  <div className="w-32 border-b border-slate-700 mx-auto" />
                </div>
                <div>
                  <p className="mb-8">اعتماد الإدارة / الشريك المدير</p>
                  <div className="w-32 border-b border-slate-700 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: إضافة سند قبض / دفع جديد */}
      {isAddTransactionOpen && selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131728] border border-cyan-500/40 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                تسجيل حركة مالية جديدة لـ ({selectedClient.name})
              </h3>
              <button onClick={() => setIsAddTransactionOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">نوع الحركة المالية *</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value as any)}
                  className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
                >
                  <option value="دفعة أتعاب">دفعة أتعاب (سداد من العميل)</option>
                  <option value="أتعاب استشارة">أتعاب استشارة قانونية</option>
                  <option value="مصروفات قضائية">مصروفات ورسوم قضائية (سداد للمحكمة)</option>
                  <option value="رسوم توكيل وتوثيق">رسوم توكيل وتوثيق شهر عقاري</option>
                  <option value="استرداد مصاريف">استرداد مصروفات</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">المبلغ (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF] font-en"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">طريقة السداد</label>
                  <select
                    value={txMethod}
                    onChange={(e) => setTxMethod(e.target.value as any)}
                    className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
                  >
                    <option value="تحويل بنكي">تحويل بنكي</option>
                    <option value="نقدي">نقدي بخزينة المكتب</option>
                    <option value="شيك مصدّق">شيك مصدّق</option>
                    <option value="بطاقة دفع">بطاقة دفع إلكتروني</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">رقم الإيصال / السند</label>
                <input
                  type="text"
                  value={txReceipt}
                  onChange={(e) => setTxReceipt(e.target.value)}
                  placeholder="REC-2026-..."
                  className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF] font-en"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">البيان والملاحظات</label>
                <input
                  type="text"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="سداد الدفعة الثانية من مرحلة الاستئناف..."
                  className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#00F0FF] text-black font-bold rounded-xl hover:bg-cyan-300 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                >
                  حفظ السند المالي
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddTransactionOpen(false)}
                  className="px-4 py-2.5 bg-[#1A1B2F] text-slate-300 rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: تسجيل عميل جديد */}
      {isAddClientOpen && (
        <AddClientModal
          onClose={() => setIsAddClientOpen(false)}
          onSave={(newClient) => {
            onAddClient(newClient);
            setIsAddClientOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Add Client Sub-modal
interface AddClientModalProps {
  onClose: () => void;
  onSave: (c: ClientAccount) => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('+2010');
  const [email, setEmail] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [address, setAddress] = useState('');
  const [totalAgreedFees, setTotalAgreedFees] = useState(50000);
  const [firstPayment, setFirstPayment] = useState(20000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: ClientAccount = {
      id: `client-${Date.now()}`,
      name,
      companyName: companyName || undefined,
      phone,
      email: email || `${name.replace(/\s+/g, '').toLowerCase()}@client.com`,
      nationalId,
      address: address || 'القاهرة، مصر',
      totalAgreedFees: Number(totalAgreedFees),
      totalPaid: Number(firstPayment),
      courtExpenses: 0,
      createdAt: new Date().toISOString().split('T')[0],
      transactions: firstPayment > 0 ? [
        {
          id: `tx-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'دفعة أتعاب',
          amount: Number(firstPayment),
          method: 'تحويل بنكي',
          receiptNumber: `REC-${Math.floor(Math.random() * 9000 + 1000)}`,
          notes: 'دفعة مقدمة عند فتح الملف التعاقدي',
        }
      ] : [],
    };

    onSave(newClient);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#131728] border border-cyan-500/40 rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#00F0FF]" />
            <h2 className="text-base font-bold text-white">تسجيل حساب وملف مالي لعميل جديد</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">اسم العميل بالكامل *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الأستاذ / ..."
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">اسم الشركة أو الكيان (إن وجد)</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="شركة ..."
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div>
              <label className="block text-slate-300 font-semibold mb-1">الرقم القومي / السجل التجاري</label>
              <input
                type="text"
                dir="ltr"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="2850101..."
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF] font-en"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">إجمالي الأتعاب المقررة (ج.م) *</label>
              <input
                type="number"
                required
                value={totalAgreedFees}
                onChange={(e) => setTotalAgreedFees(Number(e.target.value))}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF] font-en"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">الدفعة الأولى المسددة (ج.م)</label>
              <input
                type="number"
                value={firstPayment}
                onChange={(e) => setFirstPayment(Number(e.target.value))}
                className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF] font-en"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">العنوان أو المقر</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="المدينة، المحافظة"
              className="w-full bg-[#0A0E1A] border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-[#00F0FF]"
            />
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#00F0FF] text-black font-bold rounded-xl hover:bg-cyan-300 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.25)]"
            >
              إنشاء ملف العميل
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
