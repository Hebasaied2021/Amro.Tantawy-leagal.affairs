import React from 'react';
import {
  Scale,
  LayoutDashboard,
  Briefcase,
  FileText,
  CreditCard,
  CalendarCheck,
  LogOut,
  AlertCircle,
  Menu,
  X,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { UserRole } from '../types';

export type TabType = 'dashboard' | 'cases' | 'contracts' | 'accounts' | 'appointments' | 'tools';

interface NavbarProps {
  role: UserRole;
  clientName?: string;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  urgentRenewalsCount: number;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  role,
  clientName,
  activeTab,
  setActiveTab,
  urgentRenewalsCount,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const adminNavItems = [
    {
      id: 'dashboard' as TabType,
      label: 'لوحة التحكم',
      icon: LayoutDashboard,
    },
    {
      id: 'cases' as TabType,
      label: 'القضايا ومسار الدعوى',
      icon: Briefcase,
    },
    {
      id: 'contracts' as TabType,
      label: 'العقود وتنبيهات التجديد',
      icon: FileText,
      badge: urgentRenewalsCount > 0 ? urgentRenewalsCount : null,
    },
    {
      id: 'accounts' as TabType,
      label: 'حسابات العملاء والـ PDF',
      icon: CreditCard,
    },
    {
      id: 'appointments' as TabType,
      label: 'المواعيد والواتساب',
      icon: CalendarCheck,
    },
    {
      id: 'tools' as TabType,
      label: 'صيغ وحاسبة الرسوم',
      icon: Sparkles,
    },
  ];

  return (
    <>
      {/* Top Desktop/Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0A0E1A]/90 backdrop-blur-md border-b border-cyan-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-6">
              {/* Zone 1: Brand Wordmark */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5E5DF0] to-[#00F0FF] p-[1.5px] shadow-[0_0_15px_rgba(0,240,255,0.35)] flex items-center justify-center">
                  <div className="w-full h-full bg-[#0A0E1A] rounded-[10px] flex items-center justify-center">
                    <Scale className="w-5 h-5 text-[#00F0FF]" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="font-bold text-sm text-white">مكتب أ. عمرو طنطاوي</span>
                    <span className="text-[11px] font-semibold text-[#00F0FF] font-en tracking-wider">LEGAL</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    إدارة قضايا واستشارات المحاماة
                  </span>
                </div>
              </div>

            {/* Zone 2: Navigation Links (Desktop) - Only for Admin */}
            {role === 'admin' ? (
              <nav className="hidden lg:flex items-center gap-1">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'text-[#00F0FF] bg-[#161B33] border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                          : 'text-slate-300 hover:text-white hover:bg-[#131728]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#00F0FF]' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold font-en leading-none text-black bg-[#00F0FF] rounded-full shadow-[0_0_8px_#00F0FF]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            ) : (
              <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
                <UserCheck className="w-3.5 h-3.5" />
                <span>جلسة موكل مشفرة: <strong className="text-white">{clientName}</strong></span>
              </div>
            )}

            {/* Zone 3: User Info & Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {role === 'admin' ? (
                <div className="hidden sm:flex items-center gap-2 bg-[#131728] border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />
                  <span className="text-slate-300">المستشار:</span>
                  <span className="font-bold text-white">أ. عمرو طنطاوي</span>
                </div>
              ) : (
                <div className="sm:hidden text-xs text-emerald-300 font-bold truncate max-w-[120px]">
                  {clientName}
                </div>
              )}

              <button
                onClick={onLogout}
                title="تسجيل الخروج والعودة لشاشة الدخول"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/20 rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">خروج</span>
              </button>

              {/* Mobile hamburger toggle (only if admin) */}
              {role === 'admin' && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-[#131728] border border-slate-800"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5 text-[#00F0FF]" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer (Admin Only) */}
        {role === 'admin' && mobileMenuOpen && (
          <div className="lg:hidden bg-[#0D1222] border-b border-cyan-500/20 px-4 pt-2 pb-4 space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-[#00F0FF] bg-[#161B33] border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-[#131728]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#00F0FF]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold text-black bg-[#00F0FF] rounded-full">
                      {item.badge} تنبيه
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Admin Only) */}
      {role === 'admin' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0E1A]/95 backdrop-blur-lg border-t border-cyan-500/20 px-2 py-1.5 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-around">
            {adminNavItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-all relative ${
                    isActive ? 'text-[#00F0FF]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#00F0FF]' : 'text-slate-400'}`} />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]" />
                    )}
                  </div>
                  <span className="truncate max-w-[65px]">{item.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
