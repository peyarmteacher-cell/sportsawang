import React, { useState } from 'react';
import { sportsStore } from '../../services/store';
import { School, Sport, Event, Competition, Certificate, Log } from '../../types';
import { CertificateModal } from '../CertificateModal';
import { 
  generateDatabaseSql, 
  generateReadmeDocumentation, 
  generateDatabaseConfigPhp, 
  generatePhpInstallScript,
  downloadPhpProjectZip
} from '../../services/exportSqlAndPhp';
import confetti from 'canvas-confetti';
import {
  Settings,
  School as SchoolIcon,
  Trophy,
  Award,
  Database,
  Cloud,
  FileCode,
  Download,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Shield,
  Activity,
  Printer,
  Sparkles,
  Key,
  Lock,
  RotateCcw,
  Check,
  Server
} from 'lucide-react';
import { formatThaiDate } from '../../utils/thaiFormatter';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'SCHOOLS' | 'SPORTS' | 'CERTIFICATES' | 'DATABASE' | 'LOGS'>('SETTINGS');
  const [viewingCert, setViewingCert] = useState<Certificate | null>(null);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [batchSuccessCount, setBatchSuccessCount] = useState<number | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const comp = sportsStore.getCurrentCompetition();
  const schools = sportsStore.getAllSchools();
  const sports = sportsStore.getSports();
  const events = sportsStore.getEvents();
  const certificates = sportsStore.getCertificates();
  const logs = sportsStore.getLogs();
  const users = sportsStore.getUsers();

  // Settings State
  const [compForm, setCompForm] = useState<Competition>({ ...comp });
  const [savedSettings, setSavedSettings] = useState(false);

  // New/Edit School Modal
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [schoolFormData, setSchoolFormData] = useState<Partial<School>>({
    school_code: '',
    smis_code: '',
    school_name: '',
    short_name: '',
    logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150',
    address: 'อ.กระสัง จ.บุรีรัมย์',
    director_name: '',
    phone: '044-xxxxxx'
  });

  // New Event Modal
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    sport_id: sports[0]?.id || '',
    event_code: 'EV-NEW',
    event_name: '',
    gender: 'MALE',
    age_group: 'อายุไม่เกิน 12 ปี',
    grade: 'ป.4 - ป.6',
    competition_type: 'TEAM',
    min_players: 7,
    max_players: 12,
    award_type: 'เหรียญทอง/เงิน/ทองแดง + เกียรติบัตร'
  });

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handleSaveCompetitionSettings = (e: React.FormEvent) => {
    e.preventDefault();
    sportsStore.updateCompetition(compForm);
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3000);
  };

  const handleBatchGenerateCertificates = () => {
    setIsGeneratingBatch(true);
    setTimeout(() => {
      const count = sportsStore.batchGenerateAllCertificates();
      setIsGeneratingBatch(false);
      setBatchSuccessCount(count);
      confetti({ particleCount: 100, spread: 80 });
      setTimeout(() => setBatchSuccessCount(null), 5000);
    }, 600);
  };

  const handleOpenAddSchool = () => {
    setEditingSchoolId(null);
    setSchoolFormData({
      school_code: '',
      smis_code: '',
      school_name: '',
      short_name: '',
      logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150',
      address: 'อ.กระสัง จ.บุรีรัมย์',
      director_name: '',
      phone: '044-xxxxxx'
    });
    setShowAddSchool(true);
  };

  const handleOpenEditSchool = (sch: School) => {
    setEditingSchoolId(sch.id);
    setSchoolFormData({
      school_code: sch.school_code,
      smis_code: sch.smis_code || sch.school_code,
      school_name: sch.school_name,
      short_name: sch.short_name,
      logo: sch.logo,
      address: sch.address,
      director_name: sch.director_name,
      phone: sch.phone
    });
    setShowAddSchool(true);
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolFormData.school_name) return;

    if (editingSchoolId) {
      sportsStore.updateSchool(editingSchoolId, schoolFormData);
      showNotification(`อัปเดตข้อมูล ${schoolFormData.school_name} สำเร็จ`);
    } else {
      sportsStore.addSchool({
        competition_id: comp.id,
        school_code: schoolFormData.school_code || schoolFormData.smis_code || `310300${Math.floor(10 + Math.random() * 89)}`,
        smis_code: schoolFormData.smis_code || schoolFormData.school_code,
        school_name: schoolFormData.school_name,
        short_name: schoolFormData.short_name || schoolFormData.school_name,
        logo: schoolFormData.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150',
        address: schoolFormData.address || 'จ.บุรีรัมย์',
        director_name: schoolFormData.director_name,
        phone: schoolFormData.phone,
        status: 'ACTIVE'
      });
      showNotification(`เพิ่มโรงเรียน ${schoolFormData.school_name} และสร้างบัญชี SMIS สำเร็จ`);
    }

    setShowAddSchool(false);
  };

  const handleResetSchoolPassword = (schoolId: string, schoolName: string) => {
    if (window.confirm(`คุณต้องการรีเซ็ตรหัสผ่านของ "${schoolName}" กลับเป็นรหัสเริ่มต้น '123456' ใช่หรือไม่?`)) {
      const ok = sportsStore.resetSchoolPasswordToDefault(schoolId);
      if (ok) {
        showNotification(`รีเซ็ตรหัสผ่านของ "${schoolName}" เป็น 123456 เรียบร้อยแล้ว (บังคับเปลี่ยนรหัสเมื่อเข้าสู่ระบบ)`);
      } else {
        alert('ไม่พบบัญชีผู้ใช้ของโรงเรียนนี้');
      }
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.event_name) return;

    sportsStore.addEvent({
      competition_id: comp.id,
      sport_id: newEvent.sport_id || sports[0].id,
      event_code: newEvent.event_code || `EV-${Date.now().toString().slice(-4)}`,
      event_name: newEvent.event_name,
      gender: newEvent.gender as any,
      age_group: newEvent.age_group || 'ป.4 - ป.6',
      grade: newEvent.grade || 'ประถมศึกษา',
      competition_type: newEvent.competition_type as any,
      min_players: Number(newEvent.min_players) || 1,
      max_players: Number(newEvent.max_players) || 1,
      award_type: 'เหรียญทอง/เงิน/ทองแดง + เกียรติบัตร',
      status: 'OPEN'
    });

    setShowAddEvent(false);
    showNotification(`เพิ่มรายการ ${newEvent.event_name} สำเร็จ`);
  };

  const handleDownloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    showNotification(`ดาวน์โหลดไฟล์ ${filename} เรียบร้อยแล้ว`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Action Notification */}
      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage(null)} className="text-white/80 hover:text-white font-bold">&times;</button>
        </div>
      )}

      {/* Admin Nav Bar */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-md font-semibold flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> แผงควบคุมผู้ดูแลระบบ (Admin Console)
            </span>
          </div>
          <h1 className="text-2xl font-bold font-['Kanit'] text-slate-900 mt-1">
            การบริหารจัดการระบบและเกียรติบัตร
          </h1>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'SETTINGS' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> ตั้งค่าการแข่งขัน
          </button>

          <button
            onClick={() => setActiveTab('CERTIFICATES')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'CERTIFICATES' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> ออกเกียรติบัตร ({certificates.length})
          </button>

          <button
            onClick={() => setActiveTab('SCHOOLS')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'SCHOOLS' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SchoolIcon className="w-3.5 h-3.5" /> โรงเรียน ({schools.length})
          </button>

          <button
            onClick={() => setActiveTab('SPORTS')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'SPORTS' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> กีฬา/รายการ ({events.length})
          </button>

          <button
            onClick={() => setActiveTab('DATABASE')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'DATABASE' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> SQL & PHP Code
          </button>

          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'LOGS' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> บันทึกประวัติ (Logs)
          </button>
        </div>
      </div>

      {/* TAB 1: COMPETITION SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold font-['Kanit'] text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                ข้อมูลการแข่งขันและผู้มีอำนาจลงนาม
              </h2>
              <p className="text-xs text-slate-500">
                ข้อมูลนี้จะถูกนำไปแสดงในหัวเว็บ ตารางสรุป และบนใบเกียรติบัตรทุกฉบับ
              </p>
            </div>
            {savedSettings && (
              <span className="text-xs text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> บันทึกเรียบร้อย
              </span>
            )}
          </div>

          <form onSubmit={handleSaveCompetitionSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1">ชื่อการแข่งขัน</label>
                <input
                  type="text"
                  required
                  value={compForm.competition_name}
                  onChange={(e) => setCompForm({ ...compForm, competition_name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">ปีการศึกษา / ปีงบประมาณ</label>
                <input
                  type="text"
                  required
                  value={compForm.academic_year}
                  onChange={(e) => setCompForm({ ...compForm, academic_year: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">หน่วยงานผู้จัด (Host)</label>
                <input
                  type="text"
                  required
                  value={compForm.host_org}
                  onChange={(e) => setCompForm({ ...compForm, host_org: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">สถานที่จัดการแข่งขัน (Venue)</label>
                <input
                  type="text"
                  required
                  value={compForm.venue}
                  onChange={(e) => setCompForm({ ...compForm, venue: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">วันที่เริ่มแข่งขัน</label>
                <input
                  type="date"
                  value={compForm.start_date}
                  onChange={(e) => setCompForm({ ...compForm, start_date: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">วันที่สิ้นสุด</label>
                <input
                  type="date"
                  value={compForm.end_date}
                  onChange={(e) => setCompForm({ ...compForm, end_date: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">ประธานกลุ่มโรงเรียน (ผู้ลงนาม 1)</label>
                <input
                  type="text"
                  value={compForm.president_name}
                  onChange={(e) => setCompForm({ ...compForm, president_name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">ผู้อำนวยการเขตพื้นที่ฯ (ผู้ลงนาม 2)</label>
                <input
                  type="text"
                  value={compForm.director_name}
                  onChange={(e) => setCompForm({ ...compForm, director_name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">หมวดอักษรและปีเลขที่เกียรติบัตร</label>
                <input
                  type="text"
                  value={compForm.cert_prefix}
                  onChange={(e) => setCompForm({ ...compForm, cert_prefix: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">เกณฑ์การจัดอันดับตารางเหรียญรางวัล</label>
                <select
                  value={compForm.medal_criteria}
                  onChange={(e) => setCompForm({ ...compForm, medal_criteria: e.target.value as any })}
                  className="w-full p-2.5 border rounded-xl text-sm"
                >
                  <option value="GOLD_FIRST">ลำดับเหรียญทอง (สากลโอลิมปิก) - ทอง ➔ เงิน ➔ ทองแดง</option>
                  <option value="TOTAL_FIRST">จำนวนเหรียญรวมสูงสุด (Total First)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-xs"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: CERTIFICATES */}
      {activeTab === 'CERTIFICATES' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-900/30 text-amber-100 rounded-full text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" /> ระบบ One Data, Many Uses
              </div>
              <h2 className="text-xl font-bold font-['Kanit']">
                ศูนย์สร้างและออกเกียรติบัตรอัตโนมัติ (Batch E-Certificate Engine)
              </h2>
              <p className="text-xs text-amber-100 mt-1 max-w-xl">
                ระบบจะดึงรายชื่อนักเรียนและครูจากทุกรายการที่บันทึกผลเสร็จสิ้น มาสร้างเกียรติบัตร เลขที่เอกสารรันต่อเนื่อง และสร้าง QR Code อัตโนมัติในคลิกเดียว
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleBatchGenerateCertificates}
                disabled={isGeneratingBatch}
                className="px-5 py-3 bg-white hover:bg-amber-50 text-amber-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-amber-600 ${isGeneratingBatch ? 'animate-spin' : ''}`} />
                {isGeneratingBatch ? 'กำลังประมวลผล...' : '⚡ ออกเกียรติบัตรทั้งหมดอัตโนมัติ'}
              </button>
            </div>
          </div>

          {batchSuccessCount !== null && (
            <div className="p-4 bg-emerald-50 text-emerald-900 text-xs rounded-xl border border-emerald-300 font-medium flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">สร้างเกียรติบัตรเสร็จสมบูรณ์!</p>
                <p className="text-slate-600">
                  มีเกียรติบัตรในระบบรวมทั้งสิ้น {certificates.length} ฉบับ (เพิ่มใหม่ {batchSuccessCount} ฉบับ)
                </p>
              </div>
            </div>
          )}

          {/* Certificate Table */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base font-['Kanit']">
                รายการเกียรติบัตรทั้งหมดในระบบ ({certificates.length} ฉบับ)
              </h3>
              <span className="text-xs text-slate-500">
                พร้อมระบบ QR Verification Token
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-3">เลขที่เกียรติบัตร</th>
                    <th className="py-3 px-3">ผู้ได้รับเกียรติบัตร</th>
                    <th className="py-3 px-3">โรงเรียน</th>
                    <th className="py-3 px-3">รางวัลที่ได้รับ</th>
                    <th className="py-3 px-3">รายการแข่งขัน</th>
                    <th className="py-3 px-3 text-center">Google Drive</th>
                    <th className="py-3 px-3 text-center">พิมพ์ / ดู</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-semibold text-blue-900">
                        {cert.certificate_no}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-900">{cert.recipient_name}</p>
                        <span className="text-[10px] text-slate-500">
                          {cert.recipient_type === 'STUDENT' ? 'นักเรียน' : 'ครูผู้ฝึกสอน'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">{cert.school_name}</td>
                      <td className="py-3 px-3 font-semibold text-amber-800">{cert.award}</td>
                      <td className="py-3 px-3 text-slate-600">{cert.event_name}</td>
                      <td className="py-3 px-3 text-center">
                        {cert.drive_file_id ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                            <Cloud className="w-3 h-3" /> ซิงค์แล้ว
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">ยังไม่ซิงค์</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setViewingCert(cert)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Printer className="w-3 h-3" /> เปิดเกียรติบัตร
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCHOOLS & SMIS CREDENTIAL MANAGEMENT */}
      {activeTab === 'SCHOOLS' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
            <div>
              <h2 className="text-lg font-bold font-['Kanit'] text-slate-900 flex items-center gap-2">
                <SchoolIcon className="w-5 h-5 text-blue-600" />
                จัดการรายชื่อโรงเรียนและบัญชีผู้ใช้งาน SMIS ({schools.length} แห่ง)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                กลุ่มโรงเรียนสว่างสูงกระสัง: Username คือรหัส SMIS 8 หลัก, รหัสผ่านเริ่มต้นคือ <span className="font-mono font-bold text-blue-600">123456</span>
              </p>
            </div>
            <button
              onClick={handleOpenAddSchool}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 self-start md:self-auto shadow-sm"
            >
              <Plus className="w-4 h-4" /> เพิ่มโรงเรียนใหม่
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map((sch) => {
              const schoolUser = users.find(u => u.school_id === sch.id || u.username === sch.smis_code || u.username === sch.school_code);
              const mustChange = schoolUser?.must_change_password;

              return (
                <div key={sch.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={sch.logo}
                      alt={sch.school_name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white p-0.5 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm font-['Prompt'] truncate">{sch.school_name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                          SMIS: {sch.smis_code || sch.school_code}
                        </span>
                        {mustChange ? (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> ต้องเปลี่ยนรหัส
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> เปลี่ยนรหัสแล้ว
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">ผอ. {sch.director_name || '-'}</p>
                      <p className="text-[11px] text-slate-400 truncate">{sch.phone || '044-xxxxxx'}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleResetSchoolPassword(sch.id, sch.school_name)}
                      className="text-amber-700 hover:text-amber-800 font-medium text-[11px] flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition"
                      title="รีเซ็ตรหัสผ่านเป็น 123456"
                    >
                      <RotateCcw className="w-3 h-3" /> รีเซ็ตรหัส (123456)
                    </button>
                    <button
                      onClick={() => handleOpenEditSchool(sch)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-[11px] flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition"
                    >
                      <Edit2 className="w-3 h-3" /> แก้ไข
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: SPORTS & EVENTS */}
      {activeTab === 'SPORTS' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold font-['Kanit'] text-slate-900">
                จัดการชนิดกีฬาและรายการแข่งขัน ({events.length} รายการ)
              </h2>
            </div>
            <button
              onClick={() => setShowAddEvent(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> เพิ่มรายการแข่งขัน
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <th className="py-3 px-3">รหัส</th>
                  <th className="py-3 px-3">ชนิดกีฬา</th>
                  <th className="py-3 px-3">ชื่อรายการแข่งขัน</th>
                  <th className="py-3 px-3">เพศ / ระดับชั้น</th>
                  <th className="py-3 px-3">ประเภท</th>
                  <th className="py-3 px-3">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => {
                  const sp = sports.find((s) => s.id === ev.sport_id);
                  return (
                    <tr key={ev.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-semibold">{ev.event_code}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {sp?.sport_icon} {sp?.sport_name}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">{ev.event_name}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {ev.gender} | {ev.grade} ({ev.age_group})
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {ev.competition_type === 'TEAM' ? `ทีม (${ev.min_players}-${ev.max_players} คน)` : 'บุคคล'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          ev.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ev.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DATABASE & PHP EXPORT */}
      {activeTab === 'DATABASE' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
            <div>
              <h2 className="text-lg font-bold font-['Kanit'] text-slate-900 flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" />
                โครงสร้างไฟล์ PHP 8.x + MySQL (PDO Architecture) สำหรับนำไป Deploy หรือ Flow ทันที
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ไฟล์ทั้งหมดถูกจัดเตรียมและสร้างไว้ในตำแหน่งพร้อมใช้งานบน Apache/Nginx (DirectAdmin / cPanel / XAMPP)
              </p>
            </div>

            <button
              onClick={async () => {
                await downloadPhpProjectZip();
                showNotification('กำลังดาวน์โหลดแพ็กเกจโปรเจกต์ PHP + MySQL (ZIP) ครบทุกไฟล์...');
              }}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center gap-2 self-start md:self-auto shrink-0"
            >
              <Download className="w-4 h-4" /> 📦 ดาวน์โหลด Source Code ทั้งโปรเจกต์ (.ZIP)
            </button>
          </div>

          {/* Directory Structure Visualizer */}
          <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl font-mono text-xs space-y-1.5 shadow-inner border border-slate-800">
            <div className="text-amber-400 font-bold flex items-center gap-2 mb-2 pb-2 border-b border-slate-800 font-sans text-sm">
              <span>📁</span> โครงสร้างไฟล์ในระบบ (Standalone PHP + MySQL Structure):
            </div>
            <div className="text-blue-300">├── config/</div>
            <div className="pl-6 text-slate-300">└── <span className="text-emerald-400 font-bold">database.php</span> <span className="text-slate-500">// PDO Singleton + Auto-Installer Check</span></div>
            <div className="text-blue-300">├── includes/</div>
            <div className="pl-6 text-slate-300">├── <span className="text-emerald-400">auth.php</span> <span className="text-slate-500">// Session & RBAC helper</span></div>
            <div className="pl-6 text-slate-300">├── <span className="text-emerald-400">header.php</span> <span className="text-slate-500">// Responsive Navbar & Assets</span></div>
            <div className="pl-6 text-slate-300">└── <span className="text-emerald-400">footer.php</span></div>
            <div className="text-blue-300">├── admin/</div>
            <div className="pl-6 text-slate-300">├── <span className="text-emerald-400">index.php</span> <span className="text-slate-500">// Admin Dashboard</span></div>
            <div className="pl-6 text-slate-300">└── <span className="text-emerald-400">schools.php</span> <span className="text-slate-500">// จัดการ 12 โรงเรียน & รีเซ็ตรหัส SMIS</span></div>
            <div className="text-blue-300">├── school/</div>
            <div className="pl-6 text-slate-300">└── <span className="text-emerald-400">index.php</span> <span className="text-slate-500">// แผงควบคุมโรงเรียน</span></div>
            <div className="text-blue-300">├── judge/</div>
            <div className="pl-6 text-slate-300">└── <span className="text-emerald-400">index.php</span> <span className="text-slate-500">// กรรมการบันทึกผลการแข่งขัน & เหรียญ</span></div>
            <div className="text-blue-300">├── api/</div>
            <div className="pl-6 text-slate-300">└── <span className="text-emerald-400">results.php</span> <span className="text-slate-500">// JSON Endpoint สรุปคะแนนสด</span></div>
            <div className="text-emerald-400">├── index.php <span className="text-slate-500">// หน้าแรก Public Portal & ตารางสรุปเหรียญ 12 รร.</span></div>
            <div className="text-emerald-400">├── install.php <span className="text-slate-500">// Web Auto-Installer สร้างตาราง & Seed ให้อัตโนมัติ</span></div>
            <div className="text-emerald-400">├── login.php <span className="text-slate-500">// เข้าระบบด้วยรหัส SMIS 8 หลัก (รหัสเริ่มต้น: 123456)</span></div>
            <div className="text-emerald-400">├── logout.php</div>
            <div className="text-emerald-400">├── change-password.php <span className="text-slate-500">// บังคับเปลี่ยนรหัสผ่านครั้งแรก</span></div>
            <div className="text-emerald-400">├── verify.php <span className="text-slate-500">// ตรวจสอบเกียรติบัตร QR Code & Token</span></div>
            <div className="text-amber-400 font-bold">├── database.sql <span className="text-slate-500">// MySQL Schema 13 ตาราง + ข้อมูลตั้งต้น 12 โรงเรียน</span></div>
            <div className="text-slate-400">├── .htaccess <span className="text-slate-500">// Apache Config (UTF-8, Security Headers)</span></div>
            <div className="text-slate-400">└── README.md <span className="text-slate-500">// คู่มือการติดตั้งและคำอธิบายระบบ</span></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: config/database.php */}
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="p-2.5 bg-blue-600 text-white rounded-xl inline-block mb-2">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm font-['Kanit']">
                  1. ไฟล์ตั้งค่าฐานข้อมูล (`config/database.php`)
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  ไฟล์ตั้งค่า Host, Port, Database, User, Password ด้วย PDO พร้อมโค้ดดักจับ <code className="bg-white px-1 py-0.5 rounded border border-blue-200">autoInstallDatabase()</code> เมื่อยังไม่พบฐานข้อมูล
                </p>
              </div>

              <button
                onClick={() => handleDownloadFile(generateDatabaseConfigPhp(), 'database.php', 'application/x-php;charset=utf-8')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" /> ดาวน์โหลด `config/database.php`
              </button>
            </div>

            {/* Card 2: install.php */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl inline-block mb-2">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm font-['Kanit']">
                  2. หน้าติดตั้งฐานข้อมูลอัตโนมัติ (`install.php`)
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  เปิดรันผ่านเบราว์เซอร์เพื่อสร้างตารางทั้งหมด 13 ตาราง และนำเข้าโรงเรียน 12 แห่งและรหัสผ่าน SMIS เริ่มต้นให้อัตโนมัติ
                </p>
              </div>

              <button
                onClick={() => handleDownloadFile(generatePhpInstallScript(), 'install.php', 'application/x-php;charset=utf-8')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" /> ดาวน์โหลด `install.php`
              </button>
            </div>

            {/* Card 3: database.sql */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="p-2.5 bg-slate-800 text-white rounded-xl inline-block mb-2">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm font-['Kanit']">
                  3. สคริปต์ฐานข้อมูล (`database.sql`)
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Schema สำหรับ MySQL 8.x/MariaDB ตารางครบทั้ง 13 ตาราง พร้อมข้อมูลโรงเรียนกลุ่มสว่างสูงกระสัง 12 แห่งและบัญชีผู้ใช้งาน
                </p>
              </div>

              <button
                onClick={() => handleDownloadFile(generateDatabaseSql(), 'database.sql', 'text/sql;charset=utf-8')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" /> ดาวน์โหลด `database.sql`
              </button>
            </div>

            {/* Card 4: README.md */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="p-2.5 bg-purple-600 text-white rounded-xl inline-block mb-2">
                  <FileCode className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm font-['Kanit']">
                  4. คู่มือการติดตั้งและใช้งาน (`README.md`)
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  คำอธิบายการตั้งค่า .env, ตารางรายชื่อ SMIS Login ทั้ง 12 โรงเรียน และแนวคิด One Data, Many Uses
                </p>
              </div>

              <button
                onClick={() => handleDownloadFile(generateReadmeDocumentation(), 'README.md', 'text/markdown;charset=utf-8')}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" /> ดาวน์โหลด `README.md`
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'LOGS' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-900 text-base font-['Kanit']">
            ประวัติการปฏิบัติงานในระบบ (System Audit Logs)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <th className="py-3 px-3">เวลา (Timestamp)</th>
                  <th className="py-3 px-3">ผู้ใช้งาน</th>
                  <th className="py-3 px-3">การกระทำ (Action)</th>
                  <th className="py-3 px-3">ตาราง / รายละเอียด</th>
                  <th className="py-3 px-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((lg) => (
                  <tr key={lg.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono text-slate-500">{lg.created_at}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{lg.user_name}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold text-[10px]">
                        {lg.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{lg.details || lg.table_name}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{lg.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit School Modal */}
      {showAddSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200 animate-scale-up">
            <h3 className="text-base font-bold font-['Kanit'] text-slate-900">
              {editingSchoolId ? 'แก้ไขข้อมูลโรงเรียน' : 'เพิ่มโรงเรียนใหม่ในกลุ่ม'}
            </h3>
            <form onSubmit={handleSaveSchool} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">ชื่อโรงเรียน</label>
                <input
                  type="text"
                  required
                  value={schoolFormData.school_name}
                  onChange={(e) => setSchoolFormData({ ...schoolFormData, school_name: e.target.value })}
                  placeholder="เช่น โรงเรียนบ้านสวายสอ"
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">รหัส SMIS (8 หลัก)</label>
                  <input
                    type="text"
                    required
                    value={schoolFormData.smis_code || schoolFormData.school_code}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, smis_code: e.target.value, school_code: e.target.value })}
                    placeholder="เช่น 31030099"
                    className="w-full p-2.5 border rounded-xl text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">ชื่อย่อ</label>
                  <input
                    type="text"
                    value={schoolFormData.short_name}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, short_name: e.target.value })}
                    placeholder="เช่น รร.บ้านสวายสอ"
                    className="w-full p-2.5 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">ผู้อำนวยการโรงเรียน</label>
                <input
                  type="text"
                  value={schoolFormData.director_name}
                  onChange={(e) => setSchoolFormData({ ...schoolFormData, director_name: e.target.value })}
                  placeholder="เช่น ผอ.สมชาย สายลุย"
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  value={schoolFormData.phone}
                  onChange={(e) => setSchoolFormData({ ...schoolFormData, phone: e.target.value })}
                  placeholder="044-xxxxxx"
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSchool(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition">
                  {editingSchoolId ? 'บันทึกการแก้ไข' : 'บันทึกโรงเรียน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold font-['Kanit'] text-slate-900">เพิ่มรายการแข่งขันใหม่</h3>
            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">ชนิดกีฬา</label>
                <select
                  value={newEvent.sport_id}
                  onChange={(e) => setNewEvent({ ...newEvent, sport_id: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                >
                  {sports.map((s) => (
                    <option key={s.id} value={s.id}>{s.sport_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">ชื่อรายการแข่งขัน</label>
                <input
                  type="text"
                  required
                  value={newEvent.event_name}
                  onChange={(e) => setNewEvent({ ...newEvent, event_name: e.target.value })}
                  placeholder="เช่น ฟุตบอลชาย 7 คน รุ่น ป.4 - ป.6"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">เพศ</label>
                  <select
                    value={newEvent.gender}
                    onChange={(e) => setNewEvent({ ...newEvent, gender: e.target.value as any })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="MALE">ชาย</option>
                    <option value="FEMALE">หญิง</option>
                    <option value="MIXED">ผสม</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">ระดับชั้น</label>
                  <input
                    type="text"
                    value={newEvent.grade}
                    onChange={(e) => setNewEvent({ ...newEvent, grade: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="px-4 py-2 bg-slate-200 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {viewingCert && (
        <CertificateModal
          certificate={viewingCert}
          onClose={() => setViewingCert(null)}
        />
      )}
    </div>
  );
};
