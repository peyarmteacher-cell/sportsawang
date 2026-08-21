import React, { useState, useEffect } from 'react';
import { sportsStore } from './services/store';
import { User, Role } from './types';
import { PublicDashboard } from './components/PublicDashboard';
import { PublicResultsView } from './components/PublicResultsView';
import { PublicSports, PublicSchools } from './components/PublicSports';
import { PublicVerifyCertificate } from './components/PublicVerifyCertificate';
import { JudgeDashboard } from './components/judge/JudgeDashboard';
import { SchoolDashboard } from './components/school/SchoolDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LoginModal } from './components/LoginModal';
import {
  Trophy,
  Medal,
  ShieldCheck,
  School,
  LogIn,
  LogOut,
  Sparkles,
  Settings,
  Users,
  Award,
  Menu,
  X,
  FileCheck,
  Layers,
  Search
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('DASHBOARD');
  const [currentUser, setCurrentUser] = useState<User | null>(sportsStore.getCurrentUser());
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [selectedSchoolIdForFilter, setSelectedSchoolIdForFilter] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [urlVerifyToken, setUrlVerifyToken] = useState<string | undefined>(undefined);

  // Subscribe to reactive store changes
  useEffect(() => {
    const unsubscribe = sportsStore.subscribe(() => {
      setCurrentUser(sportsStore.getCurrentUser());
    });

    // Check URL parameters for QR scan verify tokens (e.g. ?verify=TOKEN_SSK69_...)
    const params = new URLSearchParams(window.location.search);
    const verifyParam = params.get('verify');
    if (verifyParam) {
      setUrlVerifyToken(verifyParam);
      setActiveTab('VERIFY');
    }

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'JUDGE') {
      setActiveTab('JUDGE_CONSOLE');
    } else if (user.role === 'SCHOOL') {
      setActiveTab('SCHOOL_PORTAL');
    } else if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
      setActiveTab('ADMIN_CONSOLE');
    }
  };

  const handleLogout = () => {
    sportsStore.logout();
    setCurrentUser(null);
    setActiveTab('DASHBOARD');
  };

  const handleSelectSchool = (schoolId: string) => {
    setSelectedSchoolIdForFilter(schoolId);
    setActiveTab('RESULTS');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-['Prompt'] antialiased">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Brand Logo & Title */}
            <div
              onClick={() => setActiveTab('DASHBOARD')}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-base shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0 font-['Kanit']">
                SP
              </div>
              <div className="max-w-md truncate">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm md:text-base font-['Kanit'] text-indigo-950 tracking-wide truncate">
                    {sportsStore.getCurrentCompetition().competition_name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 shrink-0">
                    PHP 8 / MySQL 8
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium hidden sm:block truncate">
                  {sportsStore.getCurrentCompetition().host_org}
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5">
              <button
                onClick={() => {
                  setSelectedSchoolIdForFilter(undefined);
                  setActiveTab('DASHBOARD');
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
                  activeTab === 'DASHBOARD'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                หน้าหลัก & สรุปเหรียญ
              </button>

              <button
                onClick={() => {
                  setSelectedSchoolIdForFilter(undefined);
                  setActiveTab('RESULTS');
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
                  activeTab === 'RESULTS'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                ผลการแข่งขัน
              </button>

              <button
                onClick={() => setActiveTab('SPORTS')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
                  activeTab === 'SPORTS'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                ชนิดกีฬา
              </button>

              <button
                onClick={() => setActiveTab('SCHOOLS')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
                  activeTab === 'SCHOOLS'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                โรงเรียน
              </button>

              <button
                onClick={() => setActiveTab('VERIFY')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
                  activeTab === 'VERIFY'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                ตรวจสอบเกียรติบัตร QR
              </button>

              {/* Role-Specific Tabs */}
              {currentUser && (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') && (
                <button
                  onClick={() => setActiveTab('ADMIN_CONSOLE')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
                    activeTab === 'ADMIN_CONSOLE'
                      ? 'bg-indigo-900 text-white shadow-xs'
                      : 'text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  ผู้ดูแลระบบ
                </button>
              )}

              {currentUser && currentUser.role === 'SCHOOL' && (
                <button
                  onClick={() => setActiveTab('SCHOOL_PORTAL')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
                    activeTab === 'SCHOOL_PORTAL'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <School className="w-3.5 h-3.5" />
                  ระบบโรงเรียน
                </button>
              )}

              {currentUser && currentUser.role === 'JUDGE' && (
                <button
                  onClick={() => setActiveTab('JUDGE_CONSOLE')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
                    activeTab === 'JUDGE_CONSOLE'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-amber-800 hover:bg-amber-50'
                  }`}
                >
                  <Medal className="w-3.5 h-3.5" />
                  กรรมการตัดสิน
                </button>
              )}
            </nav>

            {/* Auth / Action Button */}
            <div className="flex items-center gap-3">
              {currentUser ? (
                <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
                  <div className="px-2.5 py-0.5 text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 font-['Kanit']">
                      {currentUser.full_name}
                    </p>
                    <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider">
                      {currentUser.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full transition-all shadow-xs hover:shadow-sm flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  เข้าสู่ระบบ (RBAC)
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
            <button
              onClick={() => {
                setActiveTab('DASHBOARD');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-50"
            >
              หน้าหลัก & สรุปเหรียญ
            </button>
            <button
              onClick={() => {
                setActiveTab('RESULTS');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-50"
            >
              ผลการแข่งขัน
            </button>
            <button
              onClick={() => {
                setActiveTab('SPORTS');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-50"
            >
              ชนิดกีฬา
            </button>
            <button
              onClick={() => {
                setActiveTab('SCHOOLS');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-50"
            >
              โรงเรียน
            </button>
            <button
              onClick={() => {
                setActiveTab('VERIFY');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-emerald-800 bg-emerald-50"
            >
              ตรวจสอบเกียรติบัตร QR
            </button>

            {currentUser && (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') && (
              <button
                onClick={() => {
                  setActiveTab('ADMIN_CONSOLE');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-indigo-800 bg-indigo-50"
              >
                ผู้ดูแลระบบ (Admin Console)
              </button>
            )}

            {currentUser && currentUser.role === 'SCHOOL' && (
              <button
                onClick={() => {
                  setActiveTab('SCHOOL_PORTAL');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-emerald-800 bg-emerald-50"
              >
                ระบบโรงเรียน (School Portal)
              </button>
            )}

            {currentUser && currentUser.role === 'JUDGE' && (
              <button
                onClick={() => {
                  setActiveTab('JUDGE_CONSOLE');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-amber-800 bg-amber-50"
              >
                กรรมการตัดสิน (Judge Console)
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'DASHBOARD' && (
          <PublicDashboard
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectSchool={handleSelectSchool}
          />
        )}

        {activeTab === 'RESULTS' && (
          <PublicResultsView initialSchoolId={selectedSchoolIdForFilter} />
        )}

        {activeTab === 'SPORTS' && <PublicSports />}

        {activeTab === 'SCHOOLS' && (
          <PublicSchools onSelectSchool={handleSelectSchool} />
        )}

        {activeTab === 'VERIFY' && (
          <PublicVerifyCertificate initialToken={urlVerifyToken} />
        )}

        {activeTab === 'JUDGE_CONSOLE' && <JudgeDashboard />}

        {activeTab === 'SCHOOL_PORTAL' && (
          <SchoolDashboard
            currentSchoolId={
              currentUser?.school_id || sportsStore.getSchools()[0]?.id
            }
          />
        )}

        {activeTab === 'ADMIN_CONSOLE' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest font-['Kanit']">
                  SYSTEM ONLINE: ข้อมูลซิงค์อัตโนมัติ (ONE DATA, MANY USES)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
              <span>กลุ่มโรงเรียนสว่างสูงกระสัง • สพป.บุรีรัมย์ เขต ๒</span>
              <span>•</span>
              <button
                onClick={() => {
                  if (confirm('คุณต้องการรีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้นหรือไม่?')) {
                    sportsStore.resetToInitialData();
                    window.location.reload();
                  }
                }}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                รีเซ็ตข้อมูลตัวอย่าง
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
