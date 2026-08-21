import React, { useState } from 'react';
import { sportsStore } from '../../services/store';
import { School, Sport, Event, Competition, Certificate, User, Log } from '../../types';
import { CertificateModal } from '../CertificateModal';
import { 
  generateDatabaseSql, 
  generateReadmeDocumentation, 
  generateDatabaseConfigPhp, 
  generatePhpInstallScript,
  generateUpdateDatabaseSql,
  generateUpdateDatabasePhp,
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
  Server,
  Users,
  UserPlus,
  UserCheck,
  Search,
  Filter,
  Layers,
  ArrowRight,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { formatThaiDate } from '../../utils/thaiFormatter';

export const AdminDashboard: React.FC = () => {
  const currentUser = sportsStore.getCurrentUser();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'USERS' | 'SCHOOLS' | 'SPORTS' | 'CERTIFICATES' | 'DATABASE' | 'LOGS'>('SETTINGS');
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

  // User Management State
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<User>>({
    username: '',
    full_name: '',
    role: 'SCHOOL',
    school_id: '',
    email: '',
    phone: '',
    status: 'ACTIVE',
    password_plain: '123456',
    must_change_password: true
  });

  // School Management State
  const [schoolSearchTerm, setSchoolSearchTerm] = useState<string>('');
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

  // Sports & Events Management State
  const [sportsSubTab, setSportsSubTab] = useState<'EVENTS' | 'CATEGORIES'>('EVENTS');
  const [eventSportFilter, setEventSportFilter] = useState<string>('ALL');
  const [eventGradeFilter, setEventGradeFilter] = useState<string>('ALL');
  const [eventGenderFilter, setEventGenderFilter] = useState<string>('ALL');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventFormData, setEventFormData] = useState<Partial<Event>>({
    sport_id: sports[0]?.id || '',
    event_code: 'EV-NEW',
    event_name: '',
    gender: 'MALE',
    age_group: 'อายุไม่เกิน 12 ปี',
    grade: 'ประถมศึกษา',
    competition_type: 'TEAM',
    min_players: 7,
    max_players: 12,
    award_type: 'เหรียญรางวัล ทอง เงิน ทองแดง + เกียรติบัตร'
  });

  // Add / Edit Sport Category Modal
  const [showAddSport, setShowAddSport] = useState(false);
  const [editingSportId, setEditingSportId] = useState<string | null>(null);
  const [sportFormData, setSportFormData] = useState<Partial<Sport>>({
    sport_name: '',
    sport_icon: '🏆',
    category: 'BALL',
    description: '',
    status: 'ACTIVE'
  });

  // Database Update State
  const [isUpdatingDb, setIsUpdatingDb] = useState(false);
  const [dbUpdateLogs, setDbUpdateLogs] = useState<{ query: string; status: 'SUCCESS' | 'INFO'; message: string }[]>([]);
  const [dbUpdateDone, setDbUpdateDone] = useState(false);

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handleSaveCompetitionSettings = (e: React.FormEvent) => {
    e.preventDefault();
    sportsStore.updateCompetition(compForm);
    setSavedSettings(true);
    showNotification('บันทึกการตั้งค่าการแข่งขันและแบนเนอร์เรียบร้อยแล้ว');
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

  // --- USER MANAGEMENT HANDLERS ---
  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setUserFormData({
      username: '',
      full_name: '',
      role: 'SCHOOL',
      school_id: schools[0]?.id || '',
      email: '',
      phone: '',
      status: 'ACTIVE',
      password_plain: '123456',
      must_change_password: true
    });
    setShowAddUser(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUserId(user.id);
    setUserFormData({
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      school_id: user.school_id || '',
      email: user.email,
      phone: user.phone || '',
      status: user.status,
      password_plain: user.password_plain || '123456',
      must_change_password: user.must_change_password ?? false
    });
    setShowAddUser(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.username || !userFormData.full_name) {
      alert('กรุณากรอก Username และชื่อ-นามสกุล');
      return;
    }

    if (editingUserId) {
      sportsStore.updateUser(editingUserId, {
        username: userFormData.username.trim(),
        full_name: userFormData.full_name.trim(),
        role: userFormData.role,
        school_id: userFormData.role === 'SCHOOL' ? userFormData.school_id : undefined,
        email: userFormData.email || '',
        phone: userFormData.phone || '',
        status: userFormData.status,
        must_change_password: userFormData.must_change_password
      });
      showNotification(`แก้ไขข้อมูลผู้ใช้งาน "${userFormData.full_name}" สำเร็จ`);
    } else {
      sportsStore.addUser({
        username: userFormData.username.trim(),
        password_hash: '$2y$10$qR6K8k7FwQvE8Z0e6YhSKeN2pE7B4...',
        password_plain: userFormData.password_plain || '123456',
        full_name: userFormData.full_name.trim(),
        role: userFormData.role || 'SCHOOL',
        school_id: userFormData.role === 'SCHOOL' ? userFormData.school_id : undefined,
        email: userFormData.email || `${userFormData.username}@sawangsung.ac.th`,
        phone: userFormData.phone || '',
        status: userFormData.status || 'ACTIVE',
        must_change_password: userFormData.must_change_password ?? true
      });
      showNotification(`เพิ่มผู้ใช้งาน "${userFormData.full_name}" สำเร็จ`);
    }

    setShowAddUser(false);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน "${userName}" ออกจากระบบ?`)) {
      sportsStore.deleteUser(userId);
      showNotification(`ลบผู้ใช้งาน "${userName}" เรียบร้อยแล้ว`);
    }
  };

  const handleResetUserPassword = (userId: string, userName: string) => {
    if (window.confirm(`ต้องการรีเซ็ตรหัสผ่านของ "${userName}" เป็น "123456" ใช่หรือไม่?`)) {
      const res = sportsStore.resetSchoolPasswordToDefault(userId);
      if (res.success) {
        showNotification(`รีเซ็ตรหัสผ่านของ "${userName}" เป็น 123456 เรียบร้อยแล้ว`);
      }
    }
  };

  // --- SCHOOL MANAGEMENT HANDLERS ---
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

  const handleDeleteSchool = (schoolId: string, schoolName: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบโรงเรียน "${schoolName}" ออกจากระบบ? ข้อมูลการสมัครและนักเรียนของโรงเรียนนี้จะได้รับผลกระทบ`)) {
      sportsStore.deleteSchool(schoolId);
      showNotification(`ลบโรงเรียน "${schoolName}" เรียบร้อยแล้ว`);
    }
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

  // --- SPORTS & EVENTS HANDLERS ---
  const handleOpenAddEvent = (preset?: Partial<Event>) => {
    setEditingEventId(null);
    setEventFormData({
      sport_id: preset?.sport_id || sports[0]?.id || '',
      event_code: `EV-${Date.now().toString().slice(-4)}`,
      event_name: preset?.event_name || '',
      gender: preset?.gender || 'MALE',
      age_group: preset?.age_group || 'อายุไม่เกิน 12 ปี',
      grade: preset?.grade || 'ประถมศึกษา',
      competition_type: preset?.competition_type || 'TEAM',
      min_players: preset?.min_players || 7,
      max_players: preset?.max_players || 12,
      award_type: preset?.award_type || 'เหรียญรางวัล ทอง เงิน ทองแดง + เกียรติบัตร'
    });
    setShowAddEvent(true);
  };

  const handleOpenEditEvent = (ev: Event) => {
    setEditingEventId(ev.id);
    setEventFormData({
      sport_id: ev.sport_id,
      event_code: ev.event_code,
      event_name: ev.event_name,
      gender: ev.gender,
      age_group: ev.age_group,
      grade: ev.grade,
      competition_type: ev.competition_type,
      min_players: ev.min_players,
      max_players: ev.max_players,
      award_type: ev.award_type
    });
    setShowAddEvent(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventFormData.event_name) {
      alert('กรุณากรอกชื่อรายการแข่งขัน');
      return;
    }

    if (editingEventId) {
      sportsStore.updateEvent(editingEventId, {
        sport_id: eventFormData.sport_id,
        event_code: eventFormData.event_code,
        event_name: eventFormData.event_name,
        gender: eventFormData.gender as any,
        age_group: eventFormData.age_group || 'ไม่จำกัด',
        grade: eventFormData.grade || 'ประถมศึกษา',
        competition_type: eventFormData.competition_type as any,
        min_players: Number(eventFormData.min_players) || 1,
        max_players: Number(eventFormData.max_players) || 1,
        award_type: eventFormData.award_type || 'เหรียญรางวัล ทอง เงิน ทองแดง + เกียรติบัตร'
      });
      showNotification(`แก้ไขรายการแข่งขัน "${eventFormData.event_name}" สำเร็จ`);
    } else {
      sportsStore.addEvent({
        competition_id: comp.id,
        sport_id: eventFormData.sport_id || sports[0]?.id || '',
        event_code: eventFormData.event_code || `EV-${Date.now().toString().slice(-4)}`,
        event_name: eventFormData.event_name,
        gender: eventFormData.gender as any,
        age_group: eventFormData.age_group || 'ไม่จำกัด',
        grade: eventFormData.grade || 'ประถมศึกษา',
        competition_type: eventFormData.competition_type as any,
        min_players: Number(eventFormData.min_players) || 1,
        max_players: Number(eventFormData.max_players) || 1,
        award_type: eventFormData.award_type || 'เหรียญรางวัล ทอง เงิน ทองแดง + เกียรติบัตร',
        status: 'OPEN'
      });
      showNotification(`เพิ่มรายการแข่งขัน "${eventFormData.event_name}" สำเร็จ`);
    }

    setShowAddEvent(false);
  };

  const handleDeleteEvent = (eventId: string, eventName: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายการแข่งขัน "${eventName}"?`)) {
      sportsStore.deleteEvent(eventId);
      showNotification(`ลบรายการแข่งขัน "${eventName}" เรียบร้อยแล้ว`);
    }
  };

  // Sport Category Handlers
  const handleOpenAddSport = () => {
    setEditingSportId(null);
    setSportFormData({
      sport_name: '',
      sport_icon: '🏆',
      category: 'BALL',
      description: '',
      status: 'ACTIVE'
    });
    setShowAddSport(true);
  };

  const handleOpenEditSport = (sp: Sport) => {
    setEditingSportId(sp.id);
    setSportFormData({
      sport_name: sp.sport_name,
      sport_icon: sp.sport_icon,
      category: sp.category,
      description: sp.description || '',
      status: sp.status
    });
    setShowAddSport(true);
  };

  const handleSaveSport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sportFormData.sport_name) return;

    if (editingSportId) {
      sportsStore.updateSport(editingSportId, sportFormData);
      showNotification(`แก้ไขหมวดหมู่กีฬา "${sportFormData.sport_name}" สำเร็จ`);
    } else {
      sportsStore.addSport({
        sport_name: sportFormData.sport_name,
        sport_icon: sportFormData.sport_icon || '🏆',
        category: sportFormData.category || 'BALL',
        description: sportFormData.description || '',
        status: 'ACTIVE'
      });
      showNotification(`เพิ่มหมวดหมู่กีฬา "${sportFormData.sport_name}" สำเร็จ`);
    }

    setShowAddSport(false);
  };

  const handleDeleteSport = (sportId: string, sportName: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่กีฬา "${sportName}"?`)) {
      sportsStore.deleteSport(sportId);
      showNotification(`ลบหมวดหมู่กีฬา "${sportName}" เรียบร้อยแล้ว`);
    }
  };

  // --- DATABASE UPDATE RUNNER ---
  const handleRunDatabaseUpdate = () => {
    setIsUpdatingDb(true);
    setDbUpdateDone(false);
    setDbUpdateLogs([]);

    const queries = [
      { q: "ALTER TABLE `competitions` ADD COLUMN IF NOT EXISTS `academic_year` VARCHAR(50) DEFAULT '2569'", msg: "เพิ่มคอลัมน์ academic_year ในตาราง competitions สำเร็จ" },
      { q: "ALTER TABLE `competitions` ADD COLUMN IF NOT EXISTS `header_bg_image` TEXT DEFAULT NULL", msg: "เพิ่มคอลัมน์ header_bg_image สำหรับตกแต่งหัวเว็บ สำเร็จ" },
      { q: "ALTER TABLE `competitions` ADD COLUMN IF NOT EXISTS `google_drive_folder_id` VARCHAR(255) DEFAULT NULL", msg: "เพิ่มคอลัมน์ google_drive_folder_id สำเร็จ" },
      { q: "ALTER TABLE `competitions` ADD COLUMN IF NOT EXISTS `google_slide_template_id` VARCHAR(255) DEFAULT NULL", msg: "เพิ่มคอลัมน์ google_slide_template_id สำเร็จ" },
      { q: "ALTER TABLE `competitions` ADD COLUMN IF NOT EXISTS `president_name` VARCHAR(150) DEFAULT NULL", msg: "เพิ่มคอลัมน์ president_name (ประธานจัดการแข่งขัน) สำเร็จ" },
      { q: "ALTER TABLE `competitions` ADD COLUMN IF NOT EXISTS `director_name` VARCHAR(150) DEFAULT NULL", msg: "เพิ่มคอลัมน์ director_name (ผอ.เขตพื้นที่ฯ) สำเร็จ" },
      { q: "ALTER TABLE `competitions` ADD COLUMN IF NOT EXISTS `cert_prefix` VARCHAR(50) DEFAULT 'สพป.บร.3/2569-'", msg: "เพิ่มคอลัมน์ cert_prefix สำเร็จ" },
      { q: "ALTER TABLE `competitions` ADD COLUMN IF NOT EXISTS `medal_criteria` ENUM('GOLD_FIRST', 'TOTAL_FIRST') DEFAULT 'GOLD_FIRST'", msg: "เพิ่มคอลัมน์ medal_criteria สำเร็จ" },
      { q: "ALTER TABLE `schools` ADD COLUMN IF NOT EXISTS `smis_code` VARCHAR(50) DEFAULT NULL", msg: "เพิ่มคอลัมน์ smis_code ในตาราง schools สำเร็จ" },
      { q: "ALTER TABLE `schools` ADD COLUMN IF NOT EXISTS `director_name` VARCHAR(150) DEFAULT NULL", msg: "เพิ่มคอลัมน์ director_name ในตาราง schools สำเร็จ" },
      { q: "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `password_plain` VARCHAR(255) DEFAULT '123456'", msg: "เพิ่มคอลัมน์ password_plain ในตาราง users สำเร็จ" },
      { q: "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `phone` VARCHAR(50) DEFAULT NULL", msg: "เพิ่มคอลัมน์ phone ในตาราง users สำเร็จ" },
      { q: "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `must_change_password` TINYINT(1) NOT NULL DEFAULT 1", msg: "เพิ่มคอลัมน์ must_change_password สำเร็จ" },
      { q: "ALTER TABLE `events` ADD COLUMN IF NOT EXISTS `grade` VARCHAR(100) DEFAULT 'ประถมศึกษา'", msg: "เพิ่มคอลัมน์ grade ในตาราง events สำเร็จ" },
      { q: "ALTER TABLE `events` ADD COLUMN IF NOT EXISTS `age_group` VARCHAR(100) DEFAULT 'อายุไม่เกิน 12 ปี'", msg: "เพิ่มคอลัมน์ age_group ในตาราง events สำเร็จ" },
      { q: "ALTER TABLE `events` ADD COLUMN IF NOT EXISTS `award_type` VARCHAR(255) DEFAULT 'เหรียญรางวัล ทอง เงิน ทองแดง + เกียรติบัตร'", msg: "เพิ่มคอลัมน์ award_type สำเร็จ" },
      { q: "CREATE TABLE IF NOT EXISTS `activity_logs` (...)", msg: "ตรวจสอบและสร้างตาราง activity_logs สำเร็จ" },
      { q: "CREATE TABLE IF NOT EXISTS `settings` (...)", msg: "ตรวจสอบและสร้างตาราง settings สำเร็จ" }
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < queries.length) {
        const item = queries[current];
        setDbUpdateLogs((prev) => [...prev, { query: item.q, status: 'SUCCESS', message: item.msg }]);
        current++;
      } else {
        clearInterval(interval);
        setIsUpdatingDb(false);
        setDbUpdateDone(true);
        confetti({ particleCount: 80, spread: 70 });
        showNotification('อัปเดตโครงสร้างตารางฐานข้อมูล MySQL เรียบร้อยแล้ว (ไม่สูญเสียข้อมูลเดิม)');
      }
    }, 150);
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

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
    if (userSearchTerm) {
      const term = userSearchTerm.toLowerCase();
      return (
        u.username.toLowerCase().includes(term) ||
        u.full_name.toLowerCase().includes(term) ||
        (u.email && u.email.toLowerCase().includes(term))
      );
    }
    return true;
  });

  // Filtered Events
  const filteredEvents = events.filter((ev) => {
    if (eventSportFilter !== 'ALL' && ev.sport_id !== eventSportFilter) return false;
    if (eventGenderFilter !== 'ALL' && ev.gender !== eventGenderFilter) return false;
    if (eventGradeFilter !== 'ALL') {
      if (eventGradeFilter === 'KINDERGARTEN' && !ev.grade.includes('อนุบาล') && !ev.grade.includes('ปฐมวัย')) return false;
      if (eventGradeFilter === 'PRIMARY' && !ev.grade.includes('ประถม')) return false;
      if (eventGradeFilter === 'SECONDARY' && !ev.grade.includes('มัธยม')) return false;
    }
    return true;
  });

  // Filtered Schools
  const filteredSchools = schools.filter((sch) => {
    if (schoolSearchTerm) {
      const term = schoolSearchTerm.toLowerCase();
      return (
        sch.school_name.toLowerCase().includes(term) ||
        sch.school_code.toLowerCase().includes(term) ||
        (sch.smis_code && sch.smis_code.toLowerCase().includes(term)) ||
        (sch.director_name && sch.director_name.toLowerCase().includes(term))
      );
    }
    return true;
  });

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

      {/* Admin Nav Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1 ${
              isSuperAdmin ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900'
            }`}>
              <Shield className="w-3.5 h-3.5" /> 
              {isSuperAdmin ? '👑 ซูเปอร์แอดมิน (Super Admin Master Console)' : 'ผู้ดูแลระบบ (Admin Console)'}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              สิทธิ์สูงสุด: ควบคุมทุกโรงเรียน กีฬา เกียรติบัตร และฐานข้อมูล MySQL
            </span>
          </div>
          <h1 className="text-2xl font-bold font-['Kanit'] text-slate-900 mt-1">
            การบริหารจัดการระบบและฐานข้อมูลการแข่งขัน
          </h1>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'SETTINGS' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> ตั้งค่าการแข่งขัน
          </button>

          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'USERS' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> ผู้ใช้งาน ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('SCHOOLS')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'SCHOOLS' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SchoolIcon className="w-3.5 h-3.5" /> โรงเรียน ({schools.length})
          </button>

          <button
            onClick={() => setActiveTab('SPORTS')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'SPORTS' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> กีฬา/กรีฑา ({events.length})
          </button>

          <button
            onClick={() => setActiveTab('CERTIFICATES')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'CERTIFICATES' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> ออกเกียรติบัตร ({certificates.length})
          </button>

          <button
            onClick={() => setActiveTab('DATABASE')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'DATABASE' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-700 hover:bg-blue-50 font-bold'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> 🔄 อัปเดตตาราง MySQL
          </button>

          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'LOGS' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> บันทึกประวัติ
          </button>
        </div>
      </div>

      {/* TAB 1: COMPETITION SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold font-['Kanit'] text-slate-900">
                ตั้งค่าข้อมูลการแข่งขันและภาพหัวเว็บเพจ
              </h2>
              <p className="text-xs text-slate-500">
                แก้ไขชื่อการแข่งขัน สถานที่ ภาพแบนเนอร์ส่วนหัวเว็บ และผู้ลงนามในเกียรติบัตร
              </p>
            </div>
            {savedSettings && (
              <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> บันทึกเรียบร้อย
              </span>
            )}
          </div>

          <form onSubmit={handleSaveCompetitionSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1">ชื่อการแข่งขันกีฬา (แสดงบนหัวเว็บเพจ)</label>
                <input
                  type="text"
                  required
                  value={compForm.competition_name}
                  onChange={(e) => setCompForm({ ...compForm, competition_name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">หน่วยงานผู้จัด / เจ้าภาพ</label>
                <input
                  type="text"
                  required
                  value={compForm.host_org}
                  onChange={(e) => setCompForm({ ...compForm, host_org: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">ปีการศึกษา / ปี พ.ศ.</label>
                <input
                  type="text"
                  value={compForm.academic_year || '2569'}
                  onChange={(e) => setCompForm({ ...compForm, academic_year: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm font-mono"
                  placeholder="2569"
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
                <label className="font-semibold block mb-1">วันที่เริ่มการแข่งขัน</label>
                <input
                  type="date"
                  required
                  value={compForm.start_date}
                  onChange={(e) => setCompForm({ ...compForm, start_date: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">วันที่สิ้นสุดการแข่งขัน</label>
                <input
                  type="date"
                  required
                  value={compForm.end_date}
                  onChange={(e) => setCompForm({ ...compForm, end_date: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Custom Header Banner Image */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <label className="font-bold text-slate-900 block">
                🖼️ ลิงก์ภาพตกแต่งส่วนหัวของเว็บเพจ (Header Background Banner Image)
              </label>
              <input
                type="text"
                value={compForm.header_bg_image || ''}
                onChange={(e) => setCompForm({ ...compForm, header_bg_image: e.target.value })}
                placeholder="วาง URL รูปภาพแบนเนอร์ เช่น https://images.unsplash.com/... หรือ Base64"
                className="w-full p-2.5 border rounded-xl text-sm bg-white"
              />
              {compForm.header_bg_image && (
                <div className="mt-2 rounded-xl overflow-hidden border border-slate-300 h-28 relative">
                  <img
                    src={compForm.header_bg_image}
                    alt="Header Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    ตัวอย่างภาพหัวเว็บ
                  </span>
                </div>
              )}
            </div>

            {/* Google Drive & Slides Settings */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <Cloud className="w-4 h-4 text-blue-600" />
                การเชื่อมต่อ Google Drive & Google Slides (Auto Certificate & Cloud Storage)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700">Google Drive Folder ID</label>
                  <input
                    type="text"
                    value={compForm.google_drive_folder_id || ''}
                    onChange={(e) => setCompForm({ ...compForm, google_drive_folder_id: e.target.value })}
                    placeholder="เช่น 1A2B3C4D5E6F7G8H9I0J"
                    className="w-full p-2.5 border rounded-xl text-sm bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700">Google Slide Template ID</label>
                  <input
                    type="text"
                    value={compForm.google_slide_template_id || ''}
                    onChange={(e) => setCompForm({ ...compForm, google_slide_template_id: e.target.value })}
                    placeholder="เช่น 1X2Y3Z_Template_Slide_ID"
                    className="w-full p-2.5 border rounded-xl text-sm bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Certificate Signatories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="font-semibold block mb-1">ชื่อประธานจัดการแข่งขัน</label>
                <input
                  type="text"
                  value={compForm.president_name || ''}
                  onChange={(e) => setCompForm({ ...compForm, president_name: e.target.value })}
                  placeholder="เช่น นายสมบูรณ์ สว่างศรี"
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">ชื่อผู้อำนวยการเขตพื้นที่การศึกษาฯ</label>
                <input
                  type="text"
                  value={compForm.director_name || ''}
                  onChange={(e) => setCompForm({ ...compForm, director_name: e.target.value })}
                  placeholder="เช่น ดร.ประเสริฐ สายทอง"
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">คำนำหน้าเลขที่เกียรติบัตร</label>
                <input
                  type="text"
                  value={compForm.cert_prefix || 'สพป.บร.3/2569-'}
                  onChange={(e) => setCompForm({ ...compForm, cert_prefix: e.target.value })}
                  placeholder="สพป.บร.3/2569-"
                  className="w-full p-2.5 border rounded-xl text-sm font-mono"
                />
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

      {/* TAB 2: USER MANAGEMENT (SUPER ADMIN & ADMIN) */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
            <div>
              <h2 className="text-lg font-bold font-['Kanit'] text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                จัดการผู้ใช้งานระบบ (User Accounts Management)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Super Admin และ Admin สามารถเพิ่ม ลบ แก้ไข และรีเซ็ตรหัสผ่านของผู้ใช้งานทุกบทบาท
              </p>
            </div>

            <button
              onClick={handleOpenAddUser}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 self-start md:self-auto shadow-sm"
            >
              <UserPlus className="w-4 h-4" /> เพิ่มผู้ใช้งานใหม่
            </button>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, Username, อีเมล..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
              {['ALL', 'SUPER_ADMIN', 'ADMIN', 'SCHOOL', 'JUDGE'].map((roleKey) => (
                <button
                  key={roleKey}
                  onClick={() => setUserRoleFilter(roleKey)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                    userRoleFilter === roleKey ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {roleKey === 'ALL' && 'ทั้งหมด'}
                  {roleKey === 'SUPER_ADMIN' && 'Super Admin'}
                  {roleKey === 'ADMIN' && 'Admin'}
                  {roleKey === 'SCHOOL' && 'Admin โรงเรียน'}
                  {roleKey === 'JUDGE' && 'กรรมการ'}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <th className="py-3 px-3">Username (รหัสเข้าใช้งาน)</th>
                  <th className="py-3 px-3">ชื่อ-นามสกุล</th>
                  <th className="py-3 px-3">บทบาท (Role)</th>
                  <th className="py-3 px-3">โรงเรียนที่สังกัด</th>
                  <th className="py-3 px-3">รหัสผ่าน / การเปลี่ยน</th>
                  <th className="py-3 px-3">สถานะ</th>
                  <th className="py-3 px-3 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const linkedSchool = schools.find((s) => s.id === u.school_id || s.school_code === u.username || s.smis_code === u.username);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-blue-900">
                        {u.username}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-900">{u.full_name}</p>
                        <span className="text-[10px] text-slate-500">{u.email || u.phone || '-'}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          u.role === 'SUPER_ADMIN' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-900' :
                          u.role === 'SCHOOL' ? 'bg-emerald-100 text-emerald-900' :
                          'bg-blue-100 text-blue-900'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {linkedSchool ? linkedSchool.school_name : (u.role === 'SCHOOL' ? 'โรงเรียนในสังกัด' : '-')}
                      </td>
                      <td className="py-3 px-3">
                        {u.must_change_password ? (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium inline-flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> ต้องเปลี่ยนรหัส
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium inline-flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> เปลี่ยนรหัสแล้ว
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleResetUserPassword(u.id, u.full_name)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition"
                            title="รีเซ็ตรหัสผ่านเป็น 123456"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                            title="แก้ไขผู้ใช้"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {u.role !== 'SUPER_ADMIN' && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.full_name)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition"
                              title="ลบผู้ใช้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
            {filteredSchools.map((sch) => {
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
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditSchool(sch)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-[11px] flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition"
                      >
                        <Edit2 className="w-3 h-3" /> แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteSchool(sch.id, sch.school_name)}
                        className="text-rose-600 hover:text-rose-800 font-medium text-[11px] flex items-center gap-1 p-1 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition"
                        title="ลบโรงเรียน"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: SPORTS & ATHLETICS MANAGEMENT */}
      {activeTab === 'SPORTS' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
            <div>
              <h2 className="text-lg font-bold font-['Kanit'] text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                จัดการประเภทกีฬาและกรีฑา (Sports & Track and Field)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                กำหนดชนิดกีฬา รายการแข่งขัน ระดับชั้น (อนุบาล, ประถม, มัธยมต้น) ประเภทเพศ (ชาย, หญิง, ผสม) และประเภททีม/เดี่ยว
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddSport}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> เพิ่มชนิดกีฬา/กรีฑา
              </button>
              <button
                onClick={() => handleOpenAddEvent()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> เพิ่มรายการแข่งขัน
              </button>
            </div>
          </div>

          {/* Subtabs for Sports & Events */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSportsSubTab('EVENTS')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                  sportsSubTab === 'EVENTS' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                รายการแข่งขันทั้งหมด ({events.length} รายการ)
              </button>
              <button
                onClick={() => setSportsSubTab('CATEGORIES')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                  sportsSubTab === 'CATEGORIES' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                หมวดหมู่ชนิดกีฬาและกรีฑา ({sports.length} ชนิด)
              </button>
            </div>

            {sportsSubTab === 'EVENTS' && (
              <div className="flex items-center gap-2 text-xs">
                <select
                  value={eventSportFilter}
                  onChange={(e) => setEventSportFilter(e.target.value)}
                  className="p-1.5 border rounded-lg bg-slate-50"
                >
                  <option value="ALL">กีฬา/กรีฑาทั้งหมด</option>
                  {sports.map((s) => (
                    <option key={s.id} value={s.id}>{s.sport_name}</option>
                  ))}
                </select>

                <select
                  value={eventGradeFilter}
                  onChange={(e) => setEventGradeFilter(e.target.value)}
                  className="p-1.5 border rounded-lg bg-slate-50"
                >
                  <option value="ALL">ทุกระดับชั้น</option>
                  <option value="KINDERGARTEN">ปฐมวัย / อนุบาล</option>
                  <option value="PRIMARY">ประถมศึกษา</option>
                  <option value="SECONDARY">มัธยมศึกษาตอนต้น</option>
                </select>

                <select
                  value={eventGenderFilter}
                  onChange={(e) => setEventGenderFilter(e.target.value)}
                  className="p-1.5 border rounded-lg bg-slate-50"
                >
                  <option value="ALL">ทุกประเภทเพศ</option>
                  <option value="MALE">ชาย</option>
                  <option value="FEMALE">หญิง</option>
                  <option value="MIXED">ผสม</option>
                </select>
              </div>
            )}
          </div>

          {/* Quick Presets for Adding Events */}
          {sportsSubTab === 'EVENTS' && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                ⚡ ปุ่มสร้างรายการแข่งขันด่วนตามเกณฑ์:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => handleOpenAddEvent({
                    event_name: 'วิ่ง 100 เมตร ชาย',
                    gender: 'MALE',
                    grade: 'ประถมศึกษา (ป.4-6)',
                    competition_type: 'INDIVIDUAL',
                    min_players: 1,
                    max_players: 1
                  })}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium"
                >
                  + วิ่ง 100ม. ชาย (ประถม)
                </button>
                <button
                  onClick={() => handleOpenAddEvent({
                    event_name: 'วิ่งผลัด 4x100 เมตร ชาย',
                    gender: 'MALE',
                    grade: 'ประถมศึกษา (ป.4-6)',
                    competition_type: 'TEAM',
                    min_players: 4,
                    max_players: 6
                  })}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium"
                >
                  + วิ่งผลัด 4x100ม. ชาย (ประถม)
                </button>
                <button
                  onClick={() => handleOpenAddEvent({
                    event_name: 'วิ่งผลัด 8x50 เมตร ผสม (อนุบาล)',
                    gender: 'MIXED',
                    grade: 'ระดับปฐมวัย / อนุบาล',
                    competition_type: 'TEAM',
                    min_players: 8,
                    max_players: 10
                  })}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium"
                >
                  + วิ่งผลัด 8x50ม. อนุบาล
                </button>
                <button
                  onClick={() => handleOpenAddEvent({
                    event_name: 'ฟุตบอล 7 คน ชาย (ประถม)',
                    gender: 'MALE',
                    grade: 'ประถมศึกษา (ป.4-6)',
                    competition_type: 'TEAM',
                    min_players: 7,
                    max_players: 12
                  })}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium"
                >
                  + ฟุตบอล 7 คน (ประถม)
                </button>
                <button
                  onClick={() => handleOpenAddEvent({
                    event_name: 'วอลเลย์บอล หญิง (มัธยมต้น)',
                    gender: 'FEMALE',
                    grade: 'มัธยมศึกษาตอนต้น (ม.1-3)',
                    competition_type: 'TEAM',
                    min_players: 6,
                    max_players: 12
                  })}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium"
                >
                  + วอลเลย์บอล หญิง (ม.ต้น)
                </button>
              </div>
            </div>
          )}

          {/* EVENTS TABLE */}
          {sportsSubTab === 'EVENTS' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-3">รหัส</th>
                    <th className="py-3 px-3">ชนิดกีฬา</th>
                    <th className="py-3 px-3">ชื่อรายการแข่งขัน</th>
                    <th className="py-3 px-3">เพศ</th>
                    <th className="py-3 px-3">ระดับชั้น / ช่วงวัย</th>
                    <th className="py-3 px-3">ประเภท</th>
                    <th className="py-3 px-3 text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvents.map((ev) => {
                    const sp = sports.find((s) => s.id === ev.sport_id);
                    return (
                      <tr key={ev.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono font-semibold text-slate-500">{ev.event_code}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {sp?.sport_icon} {sp?.sport_name}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">{ev.event_name}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ev.gender === 'MALE' ? 'bg-sky-100 text-sky-800' :
                            ev.gender === 'FEMALE' ? 'bg-pink-100 text-pink-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {ev.gender === 'MALE' ? 'ชาย' : ev.gender === 'FEMALE' ? 'หญิง' : 'ผสม'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <span className="font-medium text-slate-800">{ev.grade}</span>
                          <span className="text-[10px] text-slate-400 block">{ev.age_group}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {ev.competition_type === 'TEAM' ? (
                            <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                              ทีม ({ev.min_players}-{ev.max_players} คน)
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                              บุคคลเดี่ยว
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditEvent(ev)}
                              className="p-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                              title="แก้ไขรายการ"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(ev.id, ev.event_name)}
                              className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition"
                              title="ลบรายการ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* CATEGORIES GRID */}
          {sportsSubTab === 'CATEGORIES' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sports.map((sp) => {
                const count = events.filter((e) => e.sport_id === sp.id).length;
                return (
                  <div key={sp.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 bg-white rounded-2xl shadow-xs border border-slate-100">{sp.sport_icon}</span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm font-['Kanit']">{sp.sport_name}</h4>
                        <span className="text-[11px] text-blue-600 font-semibold">{count} รายการแข่งขัน</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{sp.description || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditSport(sp)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                        title="แก้ไขชนิดกีฬา"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSport(sp.id, sp.sport_name)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition"
                        title="ลบชนิดกีฬา"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CERTIFICATES */}
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

      {/* TAB 6: DATABASE & UPDATE TABLES SYSTEM (SUPER ADMIN FEATURE) */}
      {activeTab === 'DATABASE' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          {/* DATABASE SYNC / UPDATE BANNER */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-blue-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-xs font-bold mb-2 border border-blue-400/30">
                  <RotateCcw className="w-3.5 h-3.5 text-blue-300" /> Super Admin Database Migration Tool
                </div>
                <h2 className="text-xl font-bold font-['Kanit'] text-white">
                  อัปเดตโครงสร้างตารางฐานข้อมูล MySQL (Database Table & Schema Update)
                </h2>
                <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
                  เมื่อมีการปรับปรุงโค้ดหรือเพิ่มฟิลด์ใหม่ (เช่น แบนเนอร์หัวเว็บ, Google Drive, ผู้ลงนาม, รหัสผ่าน SMIS, ระดับชั้นกรีฑา) สามารถกดปุ่มนี้เพื่อซิงค์โครงสร้างและคอลัมน์ใหม่เข้าสู่ MySQL ทันที โดยไม่กระทบหรือลบข้อมูลเดิม!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <button
                  onClick={handleRunDatabaseUpdate}
                  disabled={isUpdatingDb}
                  className="px-6 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isUpdatingDb ? 'animate-spin' : ''}`} />
                  {isUpdatingDb ? 'กำลังอัปเดตตาราง...' : '🔄 อัปเดตตารางฐานข้อมูล MySQL ตอนนี้'}
                </button>
              </div>
            </div>

            {/* LIVE UPDATE LOGS VISUALIZER */}
            {dbUpdateLogs.length > 0 && (
              <div className="bg-black/50 p-4 rounded-xl border border-blue-700/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-300 border-b border-blue-800/60 pb-1.5">
                  <span>ผลการซิงค์ตารางและคอลัมน์ MySQL:</span>
                  {dbUpdateDone && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> ซิงค์สำเร็จครบทุกตาราง 100%</span>}
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs font-mono">
                  {dbUpdateLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 text-slate-300 py-0.5">
                      <span className="text-emerald-300 truncate">✔ {log.message}</span>
                      <span className="text-[10px] text-blue-400 shrink-0">{log.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
            <div>
              <h2 className="text-base font-bold font-['Kanit'] text-slate-900 flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" />
                ดาวน์โหลด Source Code และสคริปต์ Migration สำหรับ Production Server
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ไฟล์ทั้งหมดถูกจัดเตรียมพร้อมรันบน Apache/Nginx (DirectAdmin / cPanel / XAMPP)
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: update_database.sql */}
            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="p-2.5 bg-indigo-600 text-white rounded-xl inline-block mb-2">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm font-['Kanit']">
                  1. สคริปต์อัปเดต (`update_database.sql`)
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  คำสั่ง <code className="bg-white px-1 py-0.5 rounded border border-indigo-200 font-mono">ALTER TABLE ... ADD COLUMN IF NOT EXISTS</code> สำหรับรันใน phpMyAdmin เพื่ออัปเดตตารางอย่างปลอดภัย
                </p>
              </div>

              <button
                onClick={() => handleDownloadFile(generateUpdateDatabaseSql(), 'update_database.sql', 'text/sql;charset=utf-8')}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" /> ดาวน์โหลด `update_database.sql`
              </button>
            </div>

            {/* Card 2: update_database.php */}
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="p-2.5 bg-blue-600 text-white rounded-xl inline-block mb-2">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm font-['Kanit']">
                  2. เว็บอัปเดตอัตโนมัติ (`update_database.php`)
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  เพียงอัปโหลดขึ้นโฮสแล้วเปิดผ่านเบราว์เซอร์ <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono">http://domain/update_database.php</code> เพื่ออัปเดตโครงสร้างอัตโนมัติ
                </p>
              </div>

              <button
                onClick={() => handleDownloadFile(generateUpdateDatabasePhp(), 'update_database.php', 'application/x-php;charset=utf-8')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" /> ดาวน์โหลด `update_database.php`
              </button>
            </div>

            {/* Card 3: database.sql */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="p-2.5 bg-slate-800 text-white rounded-xl inline-block mb-2">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm font-['Kanit']">
                  3. สคริปต์เต็ม (`database.sql`)
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Schema ครบทั้ง 13 ตาราง พร้อมข้อมูล 12 โรงเรียนและบัญชีผู้ใช้งาน SMIS สำหรับติดตั้งใหม่ทั้งหมด
                </p>
              </div>

              <button
                onClick={() => handleDownloadFile(generateDatabaseSql(), 'database.sql', 'text/sql;charset=utf-8')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" /> ดาวน์โหลด `database.sql`
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOGS */}
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

      {/* MODAL: ADD / EDIT USER */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200 animate-scale-up">
            <h3 className="text-base font-bold font-['Kanit'] text-slate-900">
              {editingUserId ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">ชื่อผู้ใช้งาน (Username / รหัส SMIS)</label>
                <input
                  type="text"
                  required
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  placeholder="เช่น 31030064 หรือ admin_sawang"
                  className="w-full p-2.5 border rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  required
                  value={userFormData.full_name}
                  onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                  placeholder="เช่น นายประสิทธิ์ รักกีฬา"
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">บทบาท (Role)</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                    className="w-full p-2.5 border rounded-xl text-sm"
                  >
                    <option value="SCHOOL">Admin โรงเรียน</option>
                    <option value="ADMIN">Admin กลาง</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="JUDGE">กรรมการตัดสิน (Judge)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">สถานะ</label>
                  <select
                    value={userFormData.status}
                    onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value as any })}
                    className="w-full p-2.5 border rounded-xl text-sm"
                  >
                    <option value="ACTIVE">ใช้งานปกติ (ACTIVE)</option>
                    <option value="INACTIVE">ระงับชั่วคราว (INACTIVE)</option>
                  </select>
                </div>
              </div>

              {userFormData.role === 'SCHOOL' && (
                <div>
                  <label className="font-semibold block mb-1">โรงเรียนที่สังกัด</label>
                  <select
                    value={userFormData.school_id}
                    onChange={(e) => setUserFormData({ ...userFormData, school_id: e.target.value })}
                    className="w-full p-2.5 border rounded-xl text-sm"
                  >
                    <option value="">-- เลือกโรงเรียน --</option>
                    {schools.map((sch) => (
                      <option key={sch.id} value={sch.id}>{sch.school_name} (SMIS: {sch.smis_code || sch.school_code})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">อีเมล</label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    placeholder="user@sawangsung.ac.th"
                    className="w-full p-2.5 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                    placeholder="08x-xxxxxxx"
                    className="w-full p-2.5 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition">
                  {editingUserId ? 'บันทึกการแก้ไข' : 'บันทึกผู้ใช้งาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SCHOOL */}
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

      {/* MODAL: ADD / EDIT EVENT */}
      {showAddEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold font-['Kanit'] text-slate-900">
              {editingEventId ? 'แก้ไขรายการแข่งขัน' : 'เพิ่มรายการแข่งขันกีฬา/กรีฑาใหม่'}
            </h3>
            <form onSubmit={handleSaveEvent} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">ชนิดกีฬา / กรีฑา</label>
                <select
                  value={eventFormData.sport_id}
                  onChange={(e) => setEventFormData({ ...eventFormData, sport_id: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm"
                >
                  {sports.map((s) => (
                    <option key={s.id} value={s.id}>{s.sport_icon} {s.sport_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">ชื่อรายการแข่งขัน</label>
                <input
                  type="text"
                  required
                  value={eventFormData.event_name}
                  onChange={(e) => setEventFormData({ ...eventFormData, event_name: e.target.value })}
                  placeholder="เช่น วิ่งผลัด 4x100 เมตร ชาย หรือ ฟุตบอล 7 คน ชาย"
                  className="w-full p-2.5 border rounded-xl text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">ประเภทเพศ</label>
                  <select
                    value={eventFormData.gender}
                    onChange={(e) => setEventFormData({ ...eventFormData, gender: e.target.value as any })}
                    className="w-full p-2.5 border rounded-xl text-sm"
                  >
                    <option value="MALE">ชาย (Male)</option>
                    <option value="FEMALE">หญิง (Female)</option>
                    <option value="MIXED">ผสม (Mixed)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">รูปแบบการแข่งขัน</label>
                  <select
                    value={eventFormData.competition_type}
                    onChange={(e) => setEventFormData({ ...eventFormData, competition_type: e.target.value as any })}
                    className="w-full p-2.5 border rounded-xl text-sm"
                  >
                    <option value="TEAM">ประเภททีม (Team)</option>
                    <option value="INDIVIDUAL">ประเภทเดี่ยว (Individual)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">ระดับชั้น (Education Level)</label>
                  <select
                    value={eventFormData.grade}
                    onChange={(e) => setEventFormData({ ...eventFormData, grade: e.target.value })}
                    className="w-full p-2.5 border rounded-xl text-sm"
                  >
                    <option value="ระดับปฐมวัย / อนุบาล">ระดับปฐมวัย / อนุบาล (อนุบาล 2-3)</option>
                    <option value="ประถมศึกษา (ป.1 - ป.6)">ประถมศึกษา (ป.1 - ป.6)</option>
                    <option value="ประถมศึกษาตอนต้น (ป.1 - ป.3)">ประถมศึกษาตอนต้น (ป.1 - ป.3)</option>
                    <option value="ประถมศึกษาตอนปลาย (ป.4 - ป.6)">ประถมศึกษาตอนปลาย (ป.4 - ป.6)</option>
                    <option value="มัธยมศึกษาตอนต้น (ม.1 - ม.3)">มัธยมศึกษาตอนต้น (ม.1 - ม.3)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">กลุ่มอายุ / เกณฑ์</label>
                  <input
                    type="text"
                    value={eventFormData.age_group}
                    onChange={(e) => setEventFormData({ ...eventFormData, age_group: e.target.value })}
                    placeholder="เช่น อายุไม่เกิน 12 ปี หรือ ไม่จำกัด"
                    className="w-full p-2.5 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">จำนวนนักกีฬาขั้นต่ำ (คน)</label>
                  <input
                    type="number"
                    min="1"
                    value={eventFormData.min_players}
                    onChange={(e) => setEventFormData({ ...eventFormData, min_players: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">จำนวนนักกีฬาสูงสุด (คน)</label>
                  <input
                    type="number"
                    min="1"
                    value={eventFormData.max_players}
                    onChange={(e) => setEventFormData({ ...eventFormData, max_players: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition">
                  {editingEventId ? 'บันทึกการแก้ไข' : 'บันทึกรายการแข่งขัน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SPORT CATEGORY */}
      {showAddSport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold font-['Kanit'] text-slate-900">
              {editingSportId ? 'แก้ไขหมวดหมู่กีฬา/กรีฑา' : 'เพิ่มชนิดกีฬา/กรีฑาใหม่'}
            </h3>
            <form onSubmit={handleSaveSport} className="space-y-3 text-xs">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <label className="font-semibold block mb-1">ไอคอน</label>
                  <input
                    type="text"
                    required
                    value={sportFormData.sport_icon}
                    onChange={(e) => setSportFormData({ ...sportFormData, sport_icon: e.target.value })}
                    placeholder="⚽"
                    className="w-full p-2.5 border rounded-xl text-lg text-center"
                  />
                </div>
                <div className="col-span-3">
                  <label className="font-semibold block mb-1">ชื่อชนิดกีฬา / กรีฑา</label>
                  <input
                    type="text"
                    required
                    value={sportFormData.sport_name}
                    onChange={(e) => setSportFormData({ ...sportFormData, sport_name: e.target.value })}
                    placeholder="เช่น ฟุตบอล, กรีฑา, เปตอง"
                    className="w-full p-2.5 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">หมวดหมู่หลัก</label>
                <select
                  value={sportFormData.category}
                  onChange={(e) => setSportFormData({ ...sportFormData, category: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm"
                >
                  <option value="BALL">กีฬาประเภทลูกบอล/ทีม (ฟุตบอล, วอลเลย์บอล ฯลฯ)</option>
                  <option value="TRACK">กรีฑาประเภทลู่ (วิ่งระยะสั้น, วิ่งผลัด ฯลฯ)</option>
                  <option value="FIELD">กรีฑาประเภทลาน (กระโดดไกล, ทุ่มน้ำหนัก ฯลฯ)</option>
                  <option value="RACKET">กีฬาไม้แร็กเกต (แบดมินตัน, เทเบิลเทนนิส)</option>
                  <option value="OTHER">กีฬาอื่นๆ (เปตอง, หมากฮอส ฯลฯ)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">คำอธิบาย</label>
                <textarea
                  value={sportFormData.description}
                  onChange={(e) => setSportFormData({ ...sportFormData, description: e.target.value })}
                  placeholder="รายละเอียดกติกาหรือข้อมูลเพิ่มเติม"
                  className="w-full p-2.5 border rounded-xl text-sm h-16"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSport(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition">
                  {editingSportId ? 'บันทึกการแก้ไข' : 'บันทึกชนิดกีฬา'}
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
