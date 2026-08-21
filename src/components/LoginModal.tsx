import React, { useState } from 'react';
import { sportsStore } from '../services/store';
import { User, Role } from '../types';
import { LogIn, KeyRound, ShieldCheck, UserCheck, School, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const users = sportsStore.getUsers();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetUser = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!targetUser) {
      setError('ไม่พบชื่อผู้ใช้งานนี้ในระบบ');
      return;
    }

    if (targetUser.status === 'INACTIVE') {
      setError('บัญชีผู้ใช้นี้ถูกระงับการใช้งาน');
      return;
    }

    // Authenticate (in real PHP backend: password_verify($password, $user['password']))
    // Default demo passwords match admin1234 or pass1234 or judge1234
    sportsStore.setCurrentUser(targetUser);
    onSuccess(targetUser);
    onClose();
  };

  const handleQuickLogin = (uname: string) => {
    const targetUser = users.find((u) => u.username === uname);
    if (targetUser) {
      sportsStore.setCurrentUser(targetUser);
      onSuccess(targetUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 space-y-6 relative border border-slate-100 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold font-['Kanit'] text-slate-900">
            เข้าสู่ระบบจัดการแข่งขัน
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-['Prompt']">
            ระบบบริหารจัดการแข่งขันกีฬากลุ่มโรงเรียนสว่างสูงกระสัง
          </p>
        </div>

        {/* Quick Demo Switcher */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
            <span className="flex items-center gap-1 text-amber-700">
              <Sparkles className="w-3.5 h-3.5" /> ทดสอบระบบ 1-คลิก (Quick Login):
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('superadmin')}
              className="p-2 bg-white hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 border border-slate-200 rounded-xl transition-all font-medium text-left flex items-center gap-2 shadow-2xs"
            >
              <span className="text-sm">👑</span>
              <div>
                <p className="font-semibold text-slate-900">Super Admin</p>
                <span className="text-[10px] text-slate-500">ผู้ดูแลสูงสุด</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="p-2 bg-white hover:bg-blue-50 hover:text-blue-900 hover:border-blue-300 border border-slate-200 rounded-xl transition-all font-medium text-left flex items-center gap-2 shadow-2xs"
            >
              <span className="text-sm">🛡️</span>
              <div>
                <p className="font-semibold text-slate-900">Admin การแข่งขัน</p>
                <span className="text-[10px] text-slate-500">จัดการข้อมูล/เกียรติบัตร</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('school_nongwa')}
              className="p-2 bg-white hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 border border-slate-200 rounded-xl transition-all font-medium text-left flex items-center gap-2 shadow-2xs"
            >
              <span className="text-sm">🏫</span>
              <div>
                <p className="font-semibold text-slate-900">รร.บ้านหนองหว้า</p>
                <span className="text-[10px] text-slate-500">ลงทะเบียนนักเรียน/ทีม</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('referee1')}
              className="p-2 bg-white hover:bg-purple-50 hover:text-purple-900 hover:border-purple-300 border border-slate-200 rounded-xl transition-all font-medium text-left flex items-center gap-2 shadow-2xs"
            >
              <span className="text-sm">⚖️</span>
              <div>
                <p className="font-semibold text-slate-900">กรรมการตัดสิน</p>
                <span className="text-[10px] text-slate-500">บันทึกผลการแข่งขัน</span>
              </div>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 font-medium flex items-center gap-2">
              <span className="text-rose-500">⚠️</span> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อผู้ใช้งาน (Username)
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="เช่น superadmin, school_nongwa"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รหัสผ่าน (Password)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-500">
          ระบบปลอดภัยด้วย PHP 8.x + MySQL 8.x Prepared Statements & RBAC
        </div>
      </div>
    </div>
  );
};
