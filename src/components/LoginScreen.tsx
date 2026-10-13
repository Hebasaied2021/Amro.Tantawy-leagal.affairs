import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  Scale,
  ArrowRight,
  X,
  Sparkles
} from 'lucide-react';
import { AuthSession } from '../types';

interface LoginScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: AuthSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Strictly check admin and 123
    if (username.trim().toLowerCase() === 'admin' && password === '123') {
      const session: AuthSession = { role: 'admin' };
      localStorage.setItem('smartech_auth_session', JSON.stringify(session));
      onLoginSuccess(session);
    } else {
      setError('بيانات غير صحيحة. اسم مستخدم صاحب المكتب: admin وكلمة المرور: 123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#131728] border border-cyan-500/40 rounded-2xl p-6 sm:p-7 shadow-2xl relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#0A0E1A] hover:bg-slate-800 transition-colors cursor-pointer"
          title="العودة لشاشة حجز المواعيد"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#5E5DF0] via-[#1A1B2F] to-[#00F0FF] p-[1.5px] shadow-[0_0_20px_rgba(0,240,255,0.3)] mb-3">
            <div className="w-full h-full bg-[#0A0E1A] rounded-2xl flex items-center justify-center">
              <Scale className="w-7 h-7 text-[#00F0FF]" />
            </div>
          </div>

          <h2 className="text-lg font-bold text-white mb-1">
            دخول المستشار عمرو طنطاوي
          </h2>
          <p className="text-xs text-slate-400">
            لوحة تحكم وإدارة القضايا، العقود، والحسابات المالية
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">
              اسم المستخدم
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4 text-[#00F0FF]/70" />
              </div>
              <input
                type="text"
                dir="ltr"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full bg-[#0A0E1A] border border-slate-700 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] rounded-xl pr-10 pl-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all font-en"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">
              كلمة السر
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4 text-[#00F0FF]/70" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="123"
                required
                className="w-full bg-[#0A0E1A] border border-slate-700 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] rounded-xl pr-10 pl-10 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all font-en"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-[#00F0FF] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-[#00F0FF] to-[#5E5DF0] hover:opacity-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>دخول لوحة تحكم صاحب المكتب</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>

          {/* Quick Info & Copyright */}
          <div className="pt-3 border-t border-slate-800 text-center space-y-1.5">
            <span className="text-[11px] text-slate-400 block">
              بيانات الدخول: المستخدم <strong className="text-cyan-300 font-en">admin</strong> / كلمة السر: <strong className="text-cyan-300 font-en">123</strong>
            </span>
            <div className="pt-1 text-[10px] text-slate-500 border-t border-slate-800/60">
              جميع الحقوق محفوظة لـ <strong className="text-slate-300">د. هبه سعيد عبدالله</strong> · <span className="font-en">01098888773</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
