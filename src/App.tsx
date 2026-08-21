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
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Brand Logo & Title */}
            <div
              onClick={() => setActiveTab('DASHBOARD')}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <div className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-500 rounded-2xl flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base md:text-lg font-['Kanit'] text-slate-900 tracking-tight">
                    กีฬากลุ่มโรงเรียนสว่างสูงกระสัง ๒๕๖๙
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-800 rounded-full border border-blue-200">
                    PHP 8 / MySQL 8
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  สำนักงานเขตพื้นที่การศึกษาประถมศึกษาบุรีรัมย์ เขต ๒
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => {
                  setSelectedSchoolIdForFilter(undefined);
                  setActiveTab('DASHBOARD');
                }}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'DASHBOARD'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                หน้าหลัก & สรุปเหรียญ
              </button>

              <button
                onClick={() => {
                  setSelectedSchoolIdForFilter(undefined);
                  setActiveTab('RESULTS');
                }}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'RESULTS'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                ผลการแข่งขัน
              </button>

              <button
                onClick={() => setActiveTab('SPORTS')}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'SPORTS'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                ชนิดกีฬา
              </button>

              <button
                onClick={() => setActiveTab('SCHOOLS')}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'SCHOOLS'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                โรงเรียน
              </button>

              <button
                onClick={() => setActiveTab('VERIFY')}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'VERIFY'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                ตรวจสอบเกียรติบัตร QR
              </button>

              {/* Role-Specific Tabs */}
              {currentUser && (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') && (
                <button
                  onClick={() => setActiveTab('ADMIN_CONSOLE')}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'ADMIN_CONSOLE'
                      ? 'bg-purple-100 text-purple-900'
                      : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  ผู้ดูแลระบบ
                </button>
              )}

              {currentUser && currentUser.role === 'SCHOOL' && (
                <button
                  onClick={() => setActiveTab('SCHOOL_PORTAL')}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'SCHOOL_PORTAL'
                      ? 'bg-emerald-100 text-emerald-900'
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
                  className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'JUDGE_CONSOLE'
                      ? 'bg-amber-100 text-amber-900'
                      : 'text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  <Medal className="w-3.5 h-3.5" />
                  กรรมการตัดสิน
                </button>
              )}
            </nav>

            {/* Auth / Action Button */}
            <div className="flex items-center gap-2">
              {currentUser ? (
                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-200">
                  <div className="px-3 py-1 text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 font-['Kanit']">
                      {currentUser.full_name}
                    </p>
                    <span className="text-[10px] text-blue-700 font-semibold uppercase">
                      {currentUser.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
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
                className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-purple-800 bg-purple-50"
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
      <footer className="bg-white border-t border-slate-200 py-8 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm font-bold font-['Kanit'] text-slate-800">
            <span>🏆 กลุ่มโรงเรียนสว่างสูงกระสัง</span>
            <span>•</span>
            <span>สพป.บุรีรัมย์ เขต ๒</span>
          </div>

          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            ระบบบริหารจัดการแข่งขันกีฬา One Data, Many Uses — สรุปเหรียญรางวัลอัตโนมัติ ออกเกียรติบัตรพร้อม QR Code และซิงค์ Google Drive
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-400">
            <span>Tech Stack: PHP 8.x • MySQL 8.x • Bootstrap 5 • Chart.js • QR Code</span>
            <button
              onClick={() => {
                if (confirm('คุณต้องการรีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้นหรือไม่?')) {
                  sportsStore.resetToInitialData();
                  window.location.reload();
                }
              }}
              className="text-blue-600 hover:underline"
            >
              รีเซ็ตข้อมูลตัวอย่าง (Reset Data)
            </button>
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
