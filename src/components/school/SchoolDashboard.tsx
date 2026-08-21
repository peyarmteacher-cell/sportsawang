import React, { useState } from 'react';
import { sportsStore } from '../../services/store';
import { School, Student, Coach, Event, Sport, Certificate, Registration } from '../../types';
import { CertificateModal } from '../CertificateModal';
import {
  Users,
  UserPlus,
  Trophy,
  Award,
  FileText,
  School as SchoolIcon,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Download,
  Printer,
  Search,
  Filter,
  Save
} from 'lucide-react';
import { formatThaiDate } from '../../utils/thaiFormatter';

interface SchoolDashboardProps {
  currentSchoolId: string;
}

export const SchoolDashboard: React.FC<SchoolDashboardProps> = ({ currentSchoolId }) => {
  const [activeTab, setActiveTab] = useState<'REGISTRATION' | 'STUDENTS' | 'COACHES' | 'CERTIFICATES' | 'SCHOOL_PROFILE'>('REGISTRATION');
  const [viewingCert, setViewingCert] = useState<Certificate | null>(null);

  const school = sportsStore.getSchools().find((s) => s.id === currentSchoolId) || sportsStore.getSchools()[0];
  const sports = sportsStore.getSports();
  const events = sportsStore.getEvents();
  const students = sportsStore.getStudents().filter((s) => s.school_id === school.id);
  const coaches = sportsStore.getCoaches().filter((c) => c.school_id === school.id);
  const registrations = sportsStore.getRegistrations().filter((r) => r.school_id === school.id);
  const certificates = sportsStore.getCertificates().filter((c) => c.school_id === school.id);
  const regStudents = sportsStore.getRegistrationStudents();

  // School Profile Edit State
  const [schoolFormData, setSchoolFormData] = useState<Partial<School>>({
    school_name: school.school_name,
    short_name: school.short_name || '',
    director_name: school.director_name || '',
    address: school.address || '',
    phone: school.phone || '',
    logo: school.logo || ''
  });
  const [schoolProfileSaveMessage, setSchoolProfileSaveMessage] = useState('');

  // Keep form data in sync if school changes
  React.useEffect(() => {
    setSchoolFormData({
      school_name: school.school_name,
      short_name: school.short_name || '',
      director_name: school.director_name || '',
      address: school.address || '',
      phone: school.phone || '',
      logo: school.logo || ''
    });
  }, [school]);

  const handleSaveSchoolProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolFormData.school_name?.trim()) {
      alert('กรุณากรอกชื่อสถานศึกษา');
      return;
    }
    sportsStore.updateSchool(school.id, {
      school_name: schoolFormData.school_name.trim(),
      short_name: schoolFormData.short_name?.trim() || schoolFormData.school_name.trim(),
      director_name: schoolFormData.director_name?.trim() || '',
      address: schoolFormData.address?.trim() || '',
      phone: schoolFormData.phone?.trim() || '',
      logo: schoolFormData.logo?.trim() || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150'
    });
    setSchoolProfileSaveMessage('บันทึกและปรับปรุงข้อมูลสถานศึกษาเรียบร้อยแล้ว');
    setTimeout(() => setSchoolProfileSaveMessage(''), 4000);
  };

  // Registration Form State
  const [selectedSportId, setSelectedSportId] = useState(sports[0]?.id || '');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedCoachId, setSelectedCoachId] = useState(coaches[0]?.id || '');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  // Add Student Form State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    prefix: 'เด็กชาย',
    first_name: '',
    last_name: '',
    gender: 'MALE',
    grade: 'ป.4',
    birth_date: '2014-05-15',
    id_card: ''
  });

  // Add Coach Form State
  const [showAddCoachModal, setShowAddCoachModal] = useState(false);
  const [newCoach, setNewCoach] = useState<Partial<Coach>>({
    prefix: 'นาย',
    first_name: '',
    last_name: '',
    position: 'ครูชำนาญการ',
    phone: '',
    email: ''
  });

  const availableEvents = events.filter((e) => e.sport_id === selectedSportId);
  const currentEvent = events.find((e) => e.id === selectedEventId);

  const handleToggleStudentSelection = (studentId: string) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter((id) => id !== studentId));
    } else {
      if (currentEvent && selectedStudentIds.length >= currentEvent.max_players) {
        alert(`รายการนี้จำกัดผู้เล่นไม่เกิน ${currentEvent.max_players} คน`);
        return;
      }
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    }
  };

  const handleRegisterEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) {
      alert('กรุณาเลือกรายการแข่งขัน');
      return;
    }
    if (!selectedCoachId) {
      alert('กรุณาเลือกครูผู้ควบคุม/ผู้ฝึกสอน');
      return;
    }
    if (selectedStudentIds.length === 0) {
      alert('กรุณาเลือกนักกีฬาอย่างน้อย 1 คน');
      return;
    }

    sportsStore.registerTeam({
      competition_id: 'COMP-2569-SSK',
      school_id: school.id,
      event_id: selectedEventId,
      coach_id: selectedCoachId,
      registration_status: 'APPROVED',
      registered_by: school.school_name,
      student_ids: selectedStudentIds
    });

    setRegSuccessMessage('ลงทะเบียนรายการแข่งขันสำเร็จเรียบร้อยแล้ว!');
    setSelectedStudentIds([]);
    setTimeout(() => setRegSuccessMessage(''), 4000);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.first_name || !newStudent.last_name) return;

    sportsStore.addStudent({
      competition_id: 'COMP-2569-SSK',
      school_id: school.id,
      student_code: `STD-${Date.now().toString().slice(-4)}`,
      prefix: newStudent.prefix || 'เด็กชาย',
      first_name: newStudent.first_name,
      last_name: newStudent.last_name,
      gender: newStudent.gender as 'MALE' | 'FEMALE',
      grade: newStudent.grade || 'ป.4',
      birth_date: newStudent.birth_date || '2014-01-01',
      id_card: newStudent.id_card,
      status: 'ACTIVE'
    });

    setShowAddStudentModal(false);
    setNewStudent({
      prefix: 'เด็กชาย',
      first_name: '',
      last_name: '',
      gender: 'MALE',
      grade: 'ป.4',
      birth_date: '2014-05-15',
      id_card: ''
    });
  };

  const handleCreateCoach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoach.first_name || !newCoach.last_name) return;

    sportsStore.addCoach({
      competition_id: 'COMP-2569-SSK',
      school_id: school.id,
      prefix: newCoach.prefix || 'นาย',
      first_name: newCoach.first_name,
      last_name: newCoach.last_name,
      position: newCoach.position || 'ครู',
      phone: newCoach.phone,
      status: 'ACTIVE'
    });

    setShowAddCoachModal(false);
    setNewCoach({
      prefix: 'นาย',
      first_name: '',
      last_name: '',
      position: 'ครูชำนาญการ',
      phone: '',
      email: ''
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* School Header Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={school.logo}
            alt={school.school_name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-semibold">
                ระบบจัดการสถานศึกษา (School Portal)
              </span>
              <span className="text-xs text-slate-500 font-mono">รหัส: {school.school_code}</span>
            </div>
            <h1 className="text-2xl font-bold font-['Kanit'] text-slate-900 mt-1">
              {school.school_name}
            </h1>
            <p className="text-xs text-slate-500">{school.address} | โทร. {school.phone || '-'}</p>
          </div>
        </div>

        {/* Quick Nav Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start md:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('REGISTRATION')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'REGISTRATION'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> ลงทะเบียนแข่งขัน
          </button>

          <button
            onClick={() => setActiveTab('STUDENTS')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'STUDENTS'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> ฐานข้อมูลนักกีฬา ({students.length})
          </button>

          <button
            onClick={() => setActiveTab('COACHES')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'COACHES'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> ครูผู้ฝึกสอน ({coaches.length})
          </button>

          <button
            onClick={() => setActiveTab('CERTIFICATES')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'CERTIFICATES'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> เกียรติบัตร ({certificates.length})
          </button>

          <button
            onClick={() => setActiveTab('SCHOOL_PROFILE')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'SCHOOL_PROFILE'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SchoolIcon className="w-3.5 h-3.5" /> ข้อมูลโรงเรียน / แก้ไขข้อมูล
          </button>
        </div>
      </div>

      {/* TAB 1: REGISTRATION */}
      {activeTab === 'REGISTRATION' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
            <div>
              <h2 className="text-lg font-bold font-['Kanit'] text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                ส่งรายชื่อและลงทะเบียนนักกีฬาเข้าร่วมแข่งขัน
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                เลือกชนิดกีฬา ➔ รายการแข่งขัน ➔ ครูผู้ฝึกสอน ➔ ติ๊กเลือกนักกีฬาจากฐานข้อมูลโรงเรียน
              </p>
            </div>

            {regSuccessMessage && (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-300 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{regSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegisterEvent} className="space-y-6">
              {/* Sport Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  1. เลือกชนิดกีฬา
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {sports.map((sp) => (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => {
                        setSelectedSportId(sp.id);
                        setSelectedEventId('');
                        setSelectedStudentIds([]);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        selectedSportId === sp.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <span>{sp.sport_icon}</span>
                      <span>{sp.sport_name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  2. เลือกรายการแข่งขัน
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {availableEvents.map((ev) => {
                    const isSelected = ev.id === selectedEventId;
                    const alreadyReg = registrations.some((r) => r.event_id === ev.id);
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => {
                          setSelectedEventId(ev.id);
                          setSelectedStudentIds([]);
                        }}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-mono text-slate-500 font-semibold">{ev.event_code}</span>
                          {alreadyReg && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-medium">
                              ลงทะเบียนแล้ว
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-slate-900 text-xs font-['Prompt'] line-clamp-1">
                          {ev.event_name}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {ev.grade} | {ev.competition_type === 'TEAM' ? `ทีม (${ev.min_players}-${ev.max_players} คน)` : 'บุคคล'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Coach Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    3. ครูผู้ควบคุม / ผู้ฝึกสอน
                  </label>
                  <select
                    value={selectedCoachId}
                    onChange={(e) => setSelectedCoachId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  >
                    {coaches.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.prefix}{c.first_name} {c.last_name} ({c.position})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Selection Roster */}
              {currentEvent && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      4. ติ๊กเลือกนักกีฬา ({selectedStudentIds.length} / สูงสุด {currentEvent.max_players} คน)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddStudentModal(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> เพิ่มนักเรียนใหม่
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {students.map((st) => {
                      const isChecked = selectedStudentIds.includes(st.id);
                      return (
                        <label
                          key={st.id}
                          className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-blue-100/70 border-blue-400 text-blue-950 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleStudentSelection(st.id)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <div className="text-xs">
                            <p>{st.prefix} {st.first_name} {st.last_name}</p>
                            <span className="text-[10px] text-slate-500 font-normal">
                              ชั้น {st.grade} ({st.gender === 'MALE' ? 'ชาย' : 'หญิง'})
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  บันทึกการส่งรายชื่อนักกีฬา
                </button>
              </div>
            </form>
          </div>

          {/* Registered Teams Table */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base font-['Kanit']">
              รายการที่โรงเรียนได้ลงทะเบียนแล้ว ({registrations.length} รายการ)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-3">รายการแข่งขัน</th>
                    <th className="py-3 px-3">ครูผู้ฝึกสอน</th>
                    <th className="py-3 px-3">จำนวนนักกีฬา</th>
                    <th className="py-3 px-3">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations.map((r) => {
                    const ev = events.find((e) => e.id === r.event_id);
                    const coach = coaches.find((c) => c.id === r.coach_id);
                    const teamMembers = regStudents.filter((rs) => rs.registration_id === r.id);

                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-900">{ev?.event_name}</p>
                          <span className="text-slate-500 font-mono text-[11px]">{ev?.event_code}</span>
                        </td>
                        <td className="py-3 px-3">
                          {coach ? `${coach.prefix}${coach.first_name} ${coach.last_name}` : '-'}
                        </td>
                        <td className="py-3 px-3 font-semibold text-blue-700">
                          {teamMembers.length} คน
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                            {r.registration_status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS DATABASE */}
      {activeTab === 'STUDENTS' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-['Kanit'] text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                ฐานข้อมูลนักกีฬาของโรงเรียน ({students.length} คน)
              </h2>
              <p className="text-xs text-slate-500">
                ข้อมูลนักเรียนถูกกรอกครั้งเดียว สามารถนำไปใช้ลงทะเบียน บันทึกผล และออกเกียรติบัตรได้ทันที
              </p>
            </div>

            <button
              onClick={() => setShowAddStudentModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> เพิ่มข้อมูลนักเรียน
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <th className="py-3 px-4">ชื่อ - นามสกุล</th>
                  <th className="py-3 px-4">เพศ</th>
                  <th className="py-3 px-4">ชั้น</th>
                  <th className="py-3 px-4">วันเกิด</th>
                  <th className="py-3 px-4">เลขประจำตัวประชาชน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {st.prefix} {st.first_name} {st.last_name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {st.gender === 'MALE' ? 'ชาย' : 'หญิง'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {st.grade}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatThaiDate(st.birth_date)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {st.id_card || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COACHES */}
      {activeTab === 'COACHES' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-['Kanit'] text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                ทำเนียบครูผู้ฝึกสอนและผู้ควบคุมทีม ({coaches.length} คน)
              </h2>
              <p className="text-xs text-slate-500">
                รายชื่อครูผู้ฝึกสอนที่จะปรากฏในเกียรติบัตรและเอกสารสรุปผลการแข่งขัน
              </p>
            </div>

            <button
              onClick={() => setShowAddCoachModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> เพิ่มครูผู้ฝึกสอน
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {coaches.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
              >
                <h4 className="font-bold text-slate-900 text-sm font-['Prompt']">
                  {c.prefix}{c.first_name} {c.last_name}
                </h4>
                <p className="text-xs text-indigo-700 font-medium">ตำแหน่ง: {c.position}</p>
                <p className="text-xs text-slate-500">📞 {c.phone || '-'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CERTIFICATES */}
      {activeTab === 'CERTIFICATES' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-['Kanit'] text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                ศูนย์รวมเกียรติบัตรออนไลน์ของโรงเรียน ({certificates.length} ฉบับ)
              </h2>
              <p className="text-xs text-slate-500">
                เกียรติบัตรพร้อม QR Code ตรวจสอบได้ ดาวน์โหลด PDF หรือพิมพ์ได้ทันที
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-4 rounded-xl border border-slate-200 bg-amber-50/30 hover:border-amber-400 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono text-slate-500 font-semibold">{cert.certificate_no}</span>
                    <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                      ISSUED
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm font-['Kanit']">
                    {cert.recipient_name}
                  </h4>
                  <p className="text-xs text-amber-900 font-semibold mt-0.5">{cert.award}</p>
                  <p className="text-[11px] text-slate-600">{cert.event_name}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    {cert.recipient_type === 'STUDENT' ? 'นักเรียน' : 'ครูผู้ฝึกสอน'}
                  </span>
                  <button
                    onClick={() => setViewingCert(cert)}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5" /> ดู / พิมพ์
                  </button>
                </div>
              </div>
            ))}

            {certificates.length === 0 && (
              <div className="col-span-full text-center py-10 text-slate-500">
                ยังไม่มีเกียรติบัตรที่ออกให้สำหรับโรงเรียนนี้ (จะออกอัตโนมัติเมื่อกรรมการบันทึกผลการแข่งขัน)
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SCHOOL_PROFILE */}
      {activeTab === 'SCHOOL_PROFILE' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold font-['Kanit'] text-slate-900 flex items-center gap-2">
                  <SchoolIcon className="w-6 h-6 text-indigo-600" />
                  จัดการและแก้ไขข้อมูลสถานศึกษา
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  ปรับปรุงข้อมูลผู้บริหารสถานศึกษา ที่อยู่ เบอร์โทรศัพท์ และโลโก้โรงเรียน เพื่อความถูกต้องในการออกเกียรติบัตรและเอกสารสรุปผล
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-mono font-medium">
                  SMIS: {school.smis_code || school.school_code}
                </span>
              </div>
            </div>

            {schoolProfileSaveMessage && (
              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{schoolProfileSaveMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveSchoolProfile} className="mt-6 space-y-6">
              {/* Live Preview Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={schoolFormData.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150'}
                  alt="ตัวอย่างโลโก้"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-sm bg-white shrink-0"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150';
                  }}
                />
                <div className="text-center sm:text-left flex-1 min-w-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded uppercase">
                    ตัวอย่างการแสดงผล
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 font-['Kanit'] mt-1 truncate">
                    {schoolFormData.school_name || 'ชื่อโรงเรียน'}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    ผู้อำนวยการ: <span className="text-slate-900">{schoolFormData.director_name || 'ยังไม่ระบุชื่อผู้อำนวยการ'}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    ที่อยู่: {schoolFormData.address || '-'} | โทร. {schoolFormData.phone || '-'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    ชื่อเต็มสถานศึกษา <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolFormData.school_name || ''}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, school_name: e.target.value })}
                    placeholder="เช่น โรงเรียนบ้านหนองหว้า"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">ใช้พิมพ์ในเกียรติบัตรและรายงานผล</p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    ชื่อย่อสถานศึกษา
                  </label>
                  <input
                    type="text"
                    value={schoolFormData.short_name || ''}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, short_name: e.target.value })}
                    placeholder="เช่น รร.บ้านหนองหว้า หรือ บ้านหนองหว้า"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">ใช้แสดงในตารางเหรียญรางวัลและตารางคะแนน</p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    ชื่อ-นามสกุล ผู้อำนวยการโรงเรียน <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolFormData.director_name || ''}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, director_name: e.target.value })}
                    placeholder="เช่น นายสมเกียรติ สว่างวงศ์"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">ชื่อผู้บริหารสำหรับเอกสารทางการและการลงนาม</p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    เบอร์โทรศัพท์ติดต่อสถานศึกษา
                  </label>
                  <input
                    type="text"
                    value={schoolFormData.phone || ''}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, phone: e.target.value })}
                    placeholder="เช่น 044-689123 หรือ 081-xxxxxxx"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    ที่อยู่ / ที่ตั้งสถานศึกษา
                  </label>
                  <textarea
                    rows={2}
                    value={schoolFormData.address || ''}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, address: e.target.value })}
                    placeholder="เช่น หมู่ 4 ต.หนองหว้า อ.กระสัง จ.บุรีรัมย์ 31160"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    URL รูปภาพตราสัญลักษณ์ / โลโก้โรงเรียน
                  </label>
                  <input
                    type="url"
                    value={schoolFormData.logo || ''}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, logo: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                  />
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-[11px] text-slate-400">เลือกโลโก้ตัวอย่าง:</span>
                    <button
                      type="button"
                      onClick={() => setSchoolFormData({ ...schoolFormData, logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150' })}
                      className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium"
                    >
                      ตรามาตรฐาน 1
                    </button>
                    <button
                      type="button"
                      onClick={() => setSchoolFormData({ ...schoolFormData, logo: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150' })}
                      className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium"
                    >
                      ตรามาตรฐาน 2
                    </button>
                    <button
                      type="button"
                      onClick={() => setSchoolFormData({ ...schoolFormData, logo: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=150' })}
                      className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium"
                    >
                      ตรามาตรฐาน 3
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> บันทึกการเปลี่ยนแปลงข้อมูลโรงเรียน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold font-['Kanit'] text-slate-900">
              เพิ่มข้อมูลนักเรียนใหม่ ({school.school_name})
            </h3>
            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1">คำนำหน้า</label>
                  <select
                    value={newStudent.prefix}
                    onChange={(e) => setNewStudent({ ...newStudent, prefix: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="เด็กชาย">เด็กชาย</option>
                    <option value="เด็กหญิง">เด็กหญิง</option>
                    <option value="นาย">นาย</option>
                    <option value="นางสาว">นางสาว</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="font-semibold block mb-1">ชื่อ</label>
                  <input
                    type="text"
                    required
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                    placeholder="เช่น ธีรดนย์"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">นามสกุล</label>
                <input
                  type="text"
                  required
                  value={newStudent.last_name}
                  onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                  placeholder="เช่น สายสืบวงษ์"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">เพศ</label>
                  <select
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as 'MALE' | 'FEMALE' })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="MALE">ชาย</option>
                    <option value="FEMALE">หญิง</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">ระดับชั้น</label>
                  <select
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="ป.1">ป.1</option>
                    <option value="ป.2">ป.2</option>
                    <option value="ป.3">ป.3</option>
                    <option value="ป.4">ป.4</option>
                    <option value="ป.5">ป.5</option>
                    <option value="ป.6">ป.6</option>
                    <option value="ม.1">ม.1</option>
                    <option value="ม.2">ม.2</option>
                    <option value="ม.3">ม.3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">วันเกิด</label>
                <input
                  type="date"
                  value={newStudent.birth_date}
                  onChange={(e) => setNewStudent({ ...newStudent, birth_date: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">เลขประจำตัวประชาชน (13 หลัก)</label>
                <input
                  type="text"
                  value={newStudent.id_card}
                  onChange={(e) => setNewStudent({ ...newStudent, id_card: e.target.value })}
                  placeholder="1310100xxxxxx"
                  className="w-full p-2 border rounded-lg font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 bg-slate-200 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coach Modal */}
      {showAddCoachModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold font-['Kanit'] text-slate-900">
              เพิ่มครูผู้ฝึกสอน ({school.school_name})
            </h3>
            <form onSubmit={handleCreateCoach} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1">คำนำหน้า</label>
                  <input
                    type="text"
                    value={newCoach.prefix}
                    onChange={(e) => setNewCoach({ ...newCoach, prefix: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold block mb-1">ชื่อ</label>
                  <input
                    type="text"
                    required
                    value={newCoach.first_name}
                    onChange={(e) => setNewCoach({ ...newCoach, first_name: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">นามสกุล</label>
                <input
                  type="text"
                  required
                  value={newCoach.last_name}
                  onChange={(e) => setNewCoach({ ...newCoach, last_name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">ตำแหน่ง</label>
                <input
                  type="text"
                  value={newCoach.position}
                  onChange={(e) => setNewCoach({ ...newCoach, position: e.target.value })}
                  placeholder="เช่น ครูชำนาญการพิเศษ"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  value={newCoach.phone}
                  onChange={(e) => setNewCoach({ ...newCoach, phone: e.target.value })}
                  placeholder="081-xxxxxxx"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCoachModal(false)}
                  className="px-4 py-2 bg-slate-200 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                  บันทึกข้อมูล
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
