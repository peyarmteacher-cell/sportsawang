import {
  Competition,
  School,
  User,
  Student,
  Coach,
  Sport,
  Event,
  Registration,
  RegistrationStudent,
  Result,
  Certificate,
  Setting,
  ActivityLog,
  CertificateTemplate
} from '../types';

export const INITIAL_COMPETITIONS: Competition[] = [
  {
    id: 'comp-2569',
    year: 2569,
    competition_name: 'การแข่งขันกีฬากลุ่มโรงเรียนสว่างสูงกระสัง ประจำปี 2569',
    start_date: '2026-11-15',
    end_date: '2026-11-20',
    venue: 'สนามกีฬาโรงเรียนบ้านสว่าง และ สนามกีฬาโรงเรียนบ้านหนองหว้า',
    status: 'COMPETING',
    host_org: 'กลุ่มโรงเรียนสว่างสูงกระสัง สพป.บุรีรัมย์ เขต 2',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'comp-2568',
    year: 2568,
    competition_name: 'การแข่งขันกีฬากลุ่มโรงเรียนสว่างสูงกระสัง ประจำปี 2568',
    start_date: '2025-11-14',
    end_date: '2025-11-18',
    venue: 'สนามกีฬาโรงเรียนบ้านกระสัง',
    status: 'CLOSED',
    host_org: 'กลุ่มโรงเรียนสว่างสูงกระสัง',
    created_at: '2025-08-01T08:00:00.000Z'
  }
];

export const INITIAL_SCHOOLS: School[] = [
  {
    id: 'sch-01',
    competition_id: 'comp-2569',
    school_code: '1031730001',
    school_name: 'โรงเรียนบ้านหนองหว้า',
    short_name: 'บ้านหนองหว้า',
    address: 'หมู่ 4 ต.หนองหว้า อ.กระสัง จ.บุรีรัมย์ 31160',
    phone: '044-689123',
    logo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=128&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    director_name: 'นายสมเกียรติ สว่างวงศ์',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'sch-02',
    competition_id: 'comp-2569',
    school_code: '1031730002',
    school_name: 'โรงเรียนบ้านสระสะแก',
    short_name: 'บ้านสระสะแก',
    address: 'หมู่ 2 ต.สระสะแก อ.กระสัง จ.บุรีรัมย์ 31160',
    phone: '044-689124',
    logo: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=128&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    director_name: 'นางวราภรณ์ มั่นคง',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'sch-03',
    competition_id: 'comp-2569',
    school_code: '1031730003',
    school_name: 'โรงเรียนบ้านสว่าง',
    short_name: 'บ้านสว่าง',
    address: 'หมู่ 1 ต.สว่าง อ.กระสัง จ.บุรีรัมย์ 31160',
    phone: '044-689125',
    logo: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=128&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    director_name: 'นายประสิทธิ์ พรหมรักษ์',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'sch-04',
    competition_id: 'comp-2569',
    school_code: '1031730004',
    school_name: 'โรงเรียนบ้านกระสัง',
    short_name: 'บ้านกระสัง',
    address: 'หมู่ 3 ต.กระสัง อ.กระสัง จ.บุรีรัมย์ 31160',
    phone: '044-689126',
    logo: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=128&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    director_name: 'นางกนกพร ใจกล้า',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'sch-05',
    competition_id: 'comp-2569',
    school_code: '1031730005',
    school_name: 'โรงเรียนบ้านสูงเนิน',
    short_name: 'บ้านสูงเนิน',
    address: 'หมู่ 5 ต.สูงเนิน อ.กระสัง จ.บุรีรัมย์ 31160',
    phone: '044-689127',
    logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=128&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    director_name: 'นายธีรยุทธ ศรีสุข',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'sch-06',
    competition_id: 'comp-2569',
    school_code: '1031730006',
    school_name: 'โรงเรียนบ้านโคกยาง',
    short_name: 'บ้านโคกยาง',
    address: 'หมู่ 7 ต.โคกยาง อ.กระสัง จ.บุรีรัมย์ 31160',
    phone: '044-689128',
    logo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=128&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    director_name: 'นายเอกชัย บุญรักษา',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'sch-07',
    competition_id: 'comp-2569',
    school_code: '1031730007',
    school_name: 'โรงเรียนบ้านตาจิตร',
    short_name: 'บ้านตาจิตร',
    address: 'หมู่ 6 ต.ตาจิตร อ.กระสัง จ.บุรีรัมย์ 31160',
    phone: '044-689129',
    logo: 'https://images.unsplash.com/photo-1562774053-701939374585?w=128&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    director_name: 'นางพิมลวรรณ สุวรรณโชติ',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'sch-08',
    competition_id: 'comp-2569',
    school_code: '1031730008',
    school_name: 'โรงเรียนบ้านหนองบัว',
    short_name: 'บ้านหนองบัว',
    address: 'หมู่ 8 ต.หนองบัว อ.กระสัง จ.บุรีรัมย์ 31160',
    phone: '044-689130',
    logo: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=128&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    director_name: 'นายมนัส ปัญญารัตน์',
    created_at: '2026-08-01T08:00:00.000Z'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-01',
    username: 'superadmin',
    password_hash: '$2y$10$wT8fH2pS/k5vY...', // admin1234
    full_name: 'ศุภกร รัตนสวัสดิ์ (Super Admin)',
    email: 'superadmin@sawangsung.ac.th',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    phone: '081-2345678',
    last_login: '2026-08-20T18:30:00.000Z',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'user-02',
    username: 'admin',
    password_hash: '$2y$10$wT8fH2pS/k5vY...', // admin1234
    full_name: 'อภิชาติ วงศ์สว่าง (ฝ่ายจัดการแข่งขัน)',
    email: 'admin@sawangsung.ac.th',
    role: 'ADMIN',
    status: 'ACTIVE',
    phone: '089-8765432',
    last_login: '2026-08-20T17:45:00.000Z',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'user-03',
    school_id: 'sch-01',
    username: 'school_nongwa',
    password_hash: '$2y$10$wT8fH2pS/k5vY...', // pass1234
    full_name: 'ครูสมชาย ดีเลิศ (รร.บ้านหนองหว้า)',
    email: 'nongwa@school.ac.th',
    role: 'SCHOOL',
    status: 'ACTIVE',
    phone: '086-1122334',
    last_login: '2026-08-20T16:20:00.000Z',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'user-04',
    school_id: 'sch-02',
    username: 'school_srasakae',
    password_hash: '$2y$10$wT8fH2pS/k5vY...', // pass1234
    full_name: 'ครูสุวรรณา แจ่มใส (รร.บ้านสระสะแก)',
    email: 'srasakae@school.ac.th',
    role: 'SCHOOL',
    status: 'ACTIVE',
    phone: '084-5566778',
    last_login: '2026-08-20T15:10:00.000Z',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'user-05',
    username: 'referee1',
    password_hash: '$2y$10$wT8fH2pS/k5vY...', // judge1234
    full_name: 'อาจารย์พิชัย ยุติธรรม (ประธานผู้ตัดสินกีฬาฟุตบอล/กรีฑา)',
    email: 'referee1@sawangsung.ac.th',
    role: 'JUDGE',
    status: 'ACTIVE',
    phone: '082-9988776',
    last_login: '2026-08-20T18:00:00.000Z',
    created_at: '2026-08-01T08:00:00.000Z'
  }
];

export const INITIAL_SPORTS: Sport[] = [
  {
    id: 'sp-01',
    sport_name: 'ฟุตบอล (Football)',
    sport_icon: '⚽',
    description: 'การแข่งขันฟุตบอล 7 คน และ 11 คน สนามหญ้ามาตรฐาน',
    category: 'BALL',
    status: 'ACTIVE',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'sp-02',
    sport_name: 'วอลเลย์บอล (Volleyball)',
    sport_icon: '🏐',
    description: 'การแข่งขันวอลเลย์บอลในร่ม 6 คน',
    category: 'BALL',
    status: 'ACTIVE',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'sp-03',
    sport_name: 'กรีฑา (Athletics)',
    sport_icon: '🏃',
    description: 'การแข่งขันวิ่ง 50ม. 100ม. 4x100ม. กระโดดไกล ทุ่มน้ำหนัก',
    category: 'TRACK',
    status: 'ACTIVE',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'sp-04',
    sport_name: 'เซปักตะกร้อ (Sepak Takraw)',
    sport_icon: '🏸',
    description: 'การแข่งขันเซปักตะกร้อ 3 คน',
    category: 'BALL',
    status: 'ACTIVE',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'sp-05',
    sport_name: 'เปตอง (Petanque)',
    sport_icon: '⚪',
    description: 'การแข่งขันเปตอง ประเภทเดี่ยว คู่ และทีม 3 คน',
    category: 'TRADITIONAL',
    status: 'ACTIVE',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'sp-06',
    sport_name: 'แบดมินตัน (Badminton)',
    sport_icon: '🏸',
    description: 'การแข่งขันแบดมินตัน เดี่ยวและคู่',
    category: 'RACQUET',
    status: 'ACTIVE',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'sp-07',
    sport_name: 'เทเบิลเทนนิส (Table Tennis)',
    sport_icon: '🏓',
    description: 'การแข่งขันปิงปอง เดี่ยวและคู่',
    category: 'RACQUET',
    status: 'ACTIVE',
    created_at: '2026-08-01T08:00:00.000Z'
  }
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'ev-01',
    competition_id: 'comp-2569',
    sport_id: 'sp-01',
    event_code: 'FB-M-P5',
    event_name: 'ฟุตบอลชาย 7 คน รุ่น ป.4 - ป.6',
    gender: 'MALE',
    age_group: 'ประถมศึกษาตอนปลาย',
    grade: 'ป.4-6',
    competition_type: 'TEAM',
    award_type: 'เหรียญรางวัล ทอง เงิน ทองแดง พร้อมเกียรติบัตร',
    max_players: 12,
    min_players: 7,
    status: 'COMPLETED',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'ev-02',
    competition_id: 'comp-2569',
    sport_id: 'sp-02',
    event_code: 'VB-F-P6',
    event_name: 'วอลเลย์บอลหญิง รุ่น ป.4 - ป.6',
    gender: 'FEMALE',
    age_group: 'ประถมศึกษาตอนปลาย',
    grade: 'ป.4-6',
    competition_type: 'TEAM',
    award_type: 'เหรียญรางวัล ทอง เงิน ทองแดง พร้อมเกียรติบัตร',
    max_players: 10,
    min_players: 6,
    status: 'COMPLETED',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'ev-03',
    competition_id: 'comp-2569',
    sport_id: 'sp-03',
    event_code: 'ATH-M-100M-P6',
    event_name: 'วิ่ง 100 เมตร ชาย รุ่น ป.4 - ป.6',
    gender: 'MALE',
    age_group: 'ประถมศึกษาตอนปลาย',
    grade: 'ป.4-6',
    competition_type: 'INDIVIDUAL',
    award_type: 'เหรียญรางวัล ทอง เงิน ทองแดง พร้อมเกียรติบัตร',
    max_players: 1,
    min_players: 1,
    status: 'COMPLETED',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'ev-04',
    competition_id: 'comp-2569',
    sport_id: 'sp-03',
    event_code: 'ATH-F-100M-P6',
    event_name: 'วิ่ง 100 เมตร หญิง รุ่น ป.4 - ป.6',
    gender: 'FEMALE',
    age_group: 'ประถมศึกษาตอนปลาย',
    grade: 'ป.4-6',
    competition_type: 'INDIVIDUAL',
    award_type: 'เหรียญรางวัล ทอง เงิน ทองแดง พร้อมเกียรติบัตร',
    max_players: 1,
    min_players: 1,
    status: 'COMPLETED',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'ev-05',
    competition_id: 'comp-2569',
    sport_id: 'sp-03',
    event_code: 'ATH-M-4X100M-P6',
    event_name: 'วิ่งผลัด 4x100 เมตร ชาย รุ่น ป.4 - ป.6',
    gender: 'MALE',
    age_group: 'ประถมศึกษาตอนปลาย',
    grade: 'ป.4-6',
    competition_type: 'TEAM',
    award_type: 'เหรียญรางวัล ทอง เงิน ทองแดง พร้อมเกียรติบัตร',
    max_players: 4,
    min_players: 4,
    status: 'COMPLETED',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'ev-06',
    competition_id: 'comp-2569',
    sport_id: 'sp-04',
    event_code: 'TK-M-P6',
    event_name: 'เซปักตะกร้อชาย รุ่น ป.4 - ป.6',
    gender: 'MALE',
    age_group: 'ประถมศึกษาตอนปลาย',
    grade: 'ป.4-6',
    competition_type: 'TEAM',
    award_type: 'เหรียญรางวัล ทอง เงิน ทองแดง พร้อมเกียรติบัตร',
    max_players: 5,
    min_players: 3,
    status: 'OPEN',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'ev-07',
    competition_id: 'comp-2569',
    sport_id: 'sp-05',
    event_code: 'PT-MIX-P6',
    event_name: 'เปตองทีมผสม รุ่น ป.4 - ป.6',
    gender: 'MIXED',
    age_group: 'ประถมศึกษาตอนปลาย',
    grade: 'ป.4-6',
    competition_type: 'TEAM',
    award_type: 'เหรียญรางวัล ทอง เงิน ทองแดง พร้อมเกียรติบัตร',
    max_players: 3,
    min_players: 3,
    status: 'OPEN',
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'ev-08',
    competition_id: 'comp-2569',
    sport_id: 'sp-06',
    event_code: 'BD-M-P6',
    event_name: 'แบดมินตันชายเดี่ยว รุ่น ป.4 - ป.6',
    gender: 'MALE',
    age_group: 'ประถมศึกษาตอนปลาย',
    grade: 'ป.4-6',
    competition_type: 'INDIVIDUAL',
    award_type: 'เหรียญรางวัล ทอง เงิน ทองแดง พร้อมเกียรติบัตร',
    max_players: 1,
    min_players: 1,
    status: 'OPEN',
    created_at: '2026-08-01T08:00:00.000Z'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  // School 1 Students (บ้านหนองหว้า)
  {
    id: 'stu-01',
    competition_id: 'comp-2569',
    school_id: 'sch-01',
    student_code: 'STD-690101',
    prefix: 'เด็กชาย',
    first_name: 'ธีรดนย์',
    last_name: 'สายสืบวงษ์',
    gender: 'MALE',
    birth_date: '2014-05-12',
    grade: 'ป.5',
    class_room: '1',
    status: 'ACTIVE',
    created_at: '2026-08-05T08:00:00.000Z'
  },
  {
    id: 'stu-02',
    competition_id: 'comp-2569',
    school_id: 'sch-01',
    student_code: 'STD-690102',
    prefix: 'เด็กชาย',
    first_name: 'กิตติภูมิ',
    last_name: 'สุขสำราญ',
    gender: 'MALE',
    birth_date: '2014-07-21',
    grade: 'ป.5',
    class_room: '1',
    status: 'ACTIVE',
    created_at: '2026-08-05T08:00:00.000Z'
  },
  {
    id: 'stu-03',
    competition_id: 'comp-2569',
    school_id: 'sch-01',
    student_code: 'STD-690103',
    prefix: 'เด็กชาย',
    first_name: 'ชยพล',
    last_name: 'คงเจริญ',
    gender: 'MALE',
    birth_date: '2014-02-14',
    grade: 'ป.5',
    class_room: '2',
    status: 'ACTIVE',
    created_at: '2026-08-05T08:00:00.000Z'
  },
  {
    id: 'stu-04',
    competition_id: 'comp-2569',
    school_id: 'sch-01',
    student_code: 'STD-690104',
    prefix: 'เด็กหญิง',
    first_name: 'ณัฐณิชา',
    last_name: 'ปรีชาชาญ',
    gender: 'FEMALE',
    birth_date: '2013-11-09',
    grade: 'ป.6',
    class_room: '1',
    status: 'ACTIVE',
    created_at: '2026-08-05T08:00:00.000Z'
  },
  {
    id: 'stu-05',
    competition_id: 'comp-2569',
    school_id: 'sch-01',
    student_code: 'STD-690105',
    prefix: 'เด็กหญิง',
    first_name: 'พิมพ์มาดา',
    last_name: 'ศิริรัตน์',
    gender: 'FEMALE',
    birth_date: '2013-09-18',
    grade: 'ป.6',
    class_room: '1',
    status: 'ACTIVE',
    created_at: '2026-08-05T08:00:00.000Z'
  },
  // School 2 Students (บ้านสระสะแก)
  {
    id: 'stu-06',
    competition_id: 'comp-2569',
    school_id: 'sch-02',
    student_code: 'STD-690201',
    prefix: 'เด็กชาย',
    first_name: 'ภานุวัฒน์',
    last_name: 'จันทร์เกษม',
    gender: 'MALE',
    birth_date: '2014-04-03',
    grade: 'ป.5',
    class_room: '1',
    status: 'ACTIVE',
    created_at: '2026-08-05T08:00:00.000Z'
  },
  {
    id: 'stu-07',
    competition_id: 'comp-2569',
    school_id: 'sch-02',
    student_code: 'STD-690202',
    prefix: 'เด็กชาย',
    first_name: 'อภิสิทธิ์',
    last_name: 'บุญมี',
    gender: 'MALE',
    birth_date: '2014-08-19',
    grade: 'ป.5',
    class_room: '2',
    status: 'ACTIVE',
    created_at: '2026-08-05T08:00:00.000Z'
  },
  {
    id: 'stu-08',
    competition_id: 'comp-2569',
    school_id: 'sch-02',
    student_code: 'STD-690203',
    prefix: 'เด็กหญิง',
    first_name: 'กานต์พิชชา',
    last_name: 'วงค์แก้ว',
    gender: 'FEMALE',
    birth_date: '2013-12-05',
    grade: 'ป.6',
    class_room: '1',
    status: 'ACTIVE',
    created_at: '2026-08-05T08:00:00.000Z'
  },
  // School 3 Students (บ้านสว่าง)
  {
    id: 'stu-09',
    competition_id: 'comp-2569',
    school_id: 'sch-03',
    student_code: 'STD-690301',
    prefix: 'เด็กชาย',
    first_name: 'ธนภูมิ',
    last_name: 'แสงสุริยา',
    gender: 'MALE',
    birth_date: '2013-10-10',
    grade: 'ป.6',
    class_room: '1',
    status: 'ACTIVE',
    created_at: '2026-08-05T08:00:00.000Z'
  },
  {
    id: 'stu-10',
    competition_id: 'comp-2569',
    school_id: 'sch-03',
    student_code: 'STD-690302',
    prefix: 'เด็กหญิง',
    first_name: 'สุดารัตน์',
    last_name: 'มีทรัพย์',
    gender: 'FEMALE',
    birth_date: '2013-08-25',
    grade: 'ป.6',
    class_room: '1',
    status: 'ACTIVE',
    created_at: '2026-08-05T08:00:00.000Z'
  },
  // School 4 Students (บ้านกระสัง)
  {
    id: 'stu-11',
    competition_id: 'comp-2569',
    school_id: 'sch-04',
    student_code: 'STD-690401',
    prefix: 'เด็กชาย',
    first_name: 'วรภพ',
    last_name: 'ศิริผล',
    gender: 'MALE',
    birth_date: '2013-06-30',
    grade: 'ป.6',
    class_room: '1',
    status: 'ACTIVE',
    created_at: '2026-08-05T08:00:00.000Z'
  }
];

export const INITIAL_COACHES: Coach[] = [
  {
    id: 'coa-01',
    competition_id: 'comp-2569',
    school_id: 'sch-01',
    prefix: 'นาย',
    first_name: 'วิชัย',
    last_name: 'ชำนาญกีฬา',
    position: 'ครูผู้ฝึกสอนฟุตบอล/กรีฑา',
    phone: '081-9988771',
    status: 'ACTIVE',
    created_at: '2026-08-02T08:00:00.000Z'
  },
  {
    id: 'coa-02',
    competition_id: 'comp-2569',
    school_id: 'sch-01',
    prefix: 'นางสาว',
    first_name: 'อรทัย',
    last_name: 'ใจสว่าง',
    position: 'ผู้ช่วยผู้ฝึกสอนวอลเลย์บอล',
    phone: '082-1144772',
    status: 'ACTIVE',
    created_at: '2026-08-02T08:00:00.000Z'
  },
  {
    id: 'coa-03',
    competition_id: 'comp-2569',
    school_id: 'sch-02',
    prefix: 'นาย',
    first_name: 'สมพงษ์',
    last_name: 'เกียรติภูมิ',
    position: 'ครูผู้ฝึกสอนกีฬา',
    phone: '083-4455663',
    status: 'ACTIVE',
    created_at: '2026-08-02T08:00:00.000Z'
  },
  {
    id: 'coa-04',
    competition_id: 'comp-2569',
    school_id: 'sch-03',
    prefix: 'นาย',
    first_name: 'ประยุทธ',
    last_name: 'พลังไทย',
    position: 'ครูชำนาญการ พลศึกษา',
    phone: '084-7788994',
    status: 'ACTIVE',
    created_at: '2026-08-02T08:00:00.000Z'
  },
  {
    id: 'coa-05',
    competition_id: 'comp-2569',
    school_id: 'sch-04',
    prefix: 'นาย',
    first_name: 'สุรศักดิ์',
    last_name: 'มงคลทรัพย์',
    position: 'ครูผู้ฝึกสอนฟุตบอล',
    phone: '085-1239875',
    status: 'ACTIVE',
    created_at: '2026-08-02T08:00:00.000Z'
  }
];

export const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: 'reg-01',
    competition_id: 'comp-2569',
    event_id: 'ev-01', // ฟุตบอลชาย
    school_id: 'sch-01', // บ้านหนองหว้า
    coach_id: 'coa-01',
    registration_status: 'APPROVED',
    submitted_at: '2026-08-10T10:00:00.000Z',
    approved_at: '2026-08-11T09:00:00.000Z',
    approved_by: 'admin',
    created_at: '2026-08-10T09:30:00.000Z'
  },
  {
    id: 'reg-02',
    competition_id: 'comp-2569',
    event_id: 'ev-01', // ฟุตบอลชาย
    school_id: 'sch-02', // บ้านสระสะแก
    coach_id: 'coa-03',
    registration_status: 'APPROVED',
    submitted_at: '2026-08-10T11:00:00.000Z',
    approved_at: '2026-08-11T09:00:00.000Z',
    approved_by: 'admin',
    created_at: '2026-08-10T10:45:00.000Z'
  },
  {
    id: 'reg-03',
    competition_id: 'comp-2569',
    event_id: 'ev-01', // ฟุตบอลชาย
    school_id: 'sch-03', // บ้านสว่าง
    coach_id: 'coa-04',
    registration_status: 'APPROVED',
    submitted_at: '2026-08-10T13:00:00.000Z',
    approved_at: '2026-08-11T09:00:00.000Z',
    approved_by: 'admin',
    created_at: '2026-08-10T12:00:00.000Z'
  },
  {
    id: 'reg-04',
    competition_id: 'comp-2569',
    event_id: 'ev-02', // วอลเลย์บอลหญิง
    school_id: 'sch-01',
    coach_id: 'coa-02',
    registration_status: 'APPROVED',
    submitted_at: '2026-08-10T14:00:00.000Z',
    approved_at: '2026-08-11T09:00:00.000Z',
    approved_by: 'admin',
    created_at: '2026-08-10T13:30:00.000Z'
  },
  {
    id: 'reg-05',
    competition_id: 'comp-2569',
    event_id: 'ev-02', // วอลเลย์บอลหญิง
    school_id: 'sch-02',
    coach_id: 'coa-03',
    registration_status: 'APPROVED',
    submitted_at: '2026-08-10T15:00:00.000Z',
    approved_at: '2026-08-11T09:00:00.000Z',
    approved_by: 'admin',
    created_at: '2026-08-10T14:20:00.000Z'
  },
  {
    id: 'reg-06',
    competition_id: 'comp-2569',
    event_id: 'ev-03', // วิ่ง 100ม. ชาย
    school_id: 'sch-03', // บ้านสว่าง
    coach_id: 'coa-04',
    registration_status: 'APPROVED',
    submitted_at: '2026-08-10T16:00:00.000Z',
    approved_at: '2026-08-11T09:00:00.000Z',
    approved_by: 'admin',
    created_at: '2026-08-10T15:30:00.000Z'
  },
  {
    id: 'reg-07',
    competition_id: 'comp-2569',
    event_id: 'ev-03', // วิ่ง 100ม. ชาย
    school_id: 'sch-01', // บ้านหนองหว้า
    coach_id: 'coa-01',
    registration_status: 'APPROVED',
    submitted_at: '2026-08-10T16:30:00.000Z',
    approved_at: '2026-08-11T09:00:00.000Z',
    approved_by: 'admin',
    created_at: '2026-08-10T16:15:00.000Z'
  }
];

export const INITIAL_REGISTRATION_STUDENTS: RegistrationStudent[] = [
  { id: 'rs-01', registration_id: 'reg-01', student_id: 'stu-01', jersey_number: 10, created_at: '2026-08-10T10:00:00.000Z' },
  { id: 'rs-02', registration_id: 'reg-01', student_id: 'stu-02', jersey_number: 7, created_at: '2026-08-10T10:00:00.000Z' },
  { id: 'rs-03', registration_id: 'reg-01', student_id: 'stu-03', jersey_number: 9, created_at: '2026-08-10T10:00:00.000Z' },

  { id: 'rs-04', registration_id: 'reg-02', student_id: 'stu-06', jersey_number: 10, created_at: '2026-08-10T11:00:00.000Z' },
  { id: 'rs-05', registration_id: 'reg-02', student_id: 'stu-07', jersey_number: 8, created_at: '2026-08-10T11:00:00.000Z' },

  { id: 'rs-06', registration_id: 'reg-04', student_id: 'stu-04', jersey_number: 4, created_at: '2026-08-10T14:00:00.000Z' },
  { id: 'rs-07', registration_id: 'reg-04', student_id: 'stu-05', jersey_number: 5, created_at: '2026-08-10T14:00:00.000Z' },

  { id: 'rs-08', registration_id: 'reg-05', student_id: 'stu-08', jersey_number: 6, created_at: '2026-08-10T15:00:00.000Z' },

  { id: 'rs-09', registration_id: 'reg-06', student_id: 'stu-09', jersey_number: 1, created_at: '2026-08-10T16:00:00.000Z' },
  { id: 'rs-10', registration_id: 'reg-07', student_id: 'stu-01', jersey_number: 2, created_at: '2026-08-10T16:30:00.000Z' }
];

export const INITIAL_RESULTS: Result[] = [
  // Event 1: Football
  {
    id: 'res-01',
    competition_id: 'comp-2569',
    event_id: 'ev-01',
    school_id: 'sch-01', // บ้านหนองหว้า
    rank: 1,
    award: 'ชนะเลิศ',
    medal: 'GOLD',
    score: '3 - 1',
    note: 'แข่งขันรอบชิงชนะเลิศ ชนะ 3 ประตูต่อ 1',
    recorded_by: 'อาจารย์พิชัย ยุติธรรม (JUDGE)',
    recorded_at: '2026-08-18T16:30:00.000Z',
    status: 'CONFIRMED',
    created_at: '2026-08-18T16:30:00.000Z'
  },
  {
    id: 'res-02',
    competition_id: 'comp-2569',
    event_id: 'ev-01',
    school_id: 'sch-02', // บ้านสระสะแก
    rank: 2,
    award: 'รองชนะเลิศอันดับ 1',
    medal: 'SILVER',
    score: '1 - 3',
    note: 'รอบชิงชนะเลิศ',
    recorded_by: 'อาจารย์พิชัย ยุติธรรม (JUDGE)',
    recorded_at: '2026-08-18T16:30:00.000Z',
    status: 'CONFIRMED',
    created_at: '2026-08-18T16:30:00.000Z'
  },
  {
    id: 'res-03',
    competition_id: 'comp-2569',
    event_id: 'ev-01',
    school_id: 'sch-03', // บ้านสว่าง
    rank: 3,
    award: 'รองชนะเลิศอันดับ 2',
    medal: 'BRONZE',
    score: '2 - 0',
    note: 'รอบชิงอันดับ 3 ชนะ 2 ประตูต่อ 0',
    recorded_by: 'อาจารย์พิชัย ยุติธรรม (JUDGE)',
    recorded_at: '2026-08-18T15:00:00.000Z',
    status: 'CONFIRMED',
    created_at: '2026-08-18T15:00:00.000Z'
  },

  // Event 2: Volleyball
  {
    id: 'res-04',
    competition_id: 'comp-2569',
    event_id: 'ev-02',
    school_id: 'sch-02', // บ้านสระสะแก
    rank: 1,
    award: 'ชนะเลิศ',
    medal: 'GOLD',
    score: '2 - 0 เซต (25-21, 25-19)',
    note: 'รอบชิงชนะเลิศ',
    recorded_by: 'อาจารย์พิชัย ยุติธรรม (JUDGE)',
    recorded_at: '2026-08-19T14:30:00.000Z',
    status: 'CONFIRMED',
    created_at: '2026-08-19T14:30:00.000Z'
  },
  {
    id: 'res-05',
    competition_id: 'comp-2569',
    event_id: 'ev-02',
    school_id: 'sch-01', // บ้านหนองหว้า
    rank: 2,
    award: 'รองชนะเลิศอันดับ 1',
    medal: 'SILVER',
    score: '0 - 2 เซต',
    note: 'รอบชิงชนะเลิศ',
    recorded_by: 'อาจารย์พิชัย ยุติธรรม (JUDGE)',
    recorded_at: '2026-08-19T14:30:00.000Z',
    status: 'CONFIRMED',
    created_at: '2026-08-19T14:30:00.000Z'
  },

  // Event 3: 100M Running
  {
    id: 'res-06',
    competition_id: 'comp-2569',
    event_id: 'ev-03',
    school_id: 'sch-03', // บ้านสว่าง
    rank: 1,
    award: 'ชนะเลิศ',
    medal: 'GOLD',
    score: '12.45 วินาที',
    note: 'สถิติใหม่กลุ่มโรงเรียน',
    recorded_by: 'อาจารย์พิชัย ยุติธรรม (JUDGE)',
    recorded_at: '2026-08-19T11:00:00.000Z',
    status: 'CONFIRMED',
    created_at: '2026-08-19T11:00:00.000Z'
  },
  {
    id: 'res-07',
    competition_id: 'comp-2569',
    event_id: 'ev-03',
    school_id: 'sch-01', // บ้านหนองหว้า
    rank: 2,
    award: 'รองชนะเลิศอันดับ 1',
    medal: 'SILVER',
    score: '12.80 วินาที',
    note: 'รอบชิงชนะเลิศ',
    recorded_by: 'อาจารย์พิชัย ยุติธรรม (JUDGE)',
    recorded_at: '2026-08-19T11:00:00.000Z',
    status: 'CONFIRMED',
    created_at: '2026-08-19T11:00:00.000Z'
  }
];

export const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-01',
    competition_id: 'comp-2569',
    certificate_no: 'สสก.2569-00001',
    recipient_type: 'STUDENT',
    recipient_id: 'stu-01',
    recipient_name: 'เด็กชายธีรดนย์ สายสืบวงษ์',
    school_id: 'sch-01',
    school_name: 'โรงเรียนบ้านหนองหว้า',
    event_id: 'ev-01',
    event_name: 'ฟุตบอลชาย 7 คน รุ่น ป.4 - ป.6',
    sport_name: 'ฟุตบอล (Football)',
    result_id: 'res-01',
    award: 'รางวัลชนะเลิศ (เหรียญทอง 🥇)',
    medal: 'GOLD',
    issue_date: '2026-11-20',
    template_type: 'STUDENT',
    drive_file_id: '1aBcDeFgHiJkLmNoPqRsTuVwXyZ_001',
    drive_url: 'https://drive.google.com/file/d/sample001/view',
    qr_token: 'TOKEN_SSK69_CERT_00001_8F3A29B',
    status: 'ISSUED',
    created_at: '2026-08-20T10:00:00.000Z'
  },
  {
    id: 'cert-02',
    competition_id: 'comp-2569',
    certificate_no: 'สสก.2569-00002',
    recipient_type: 'STUDENT',
    recipient_id: 'stu-02',
    recipient_name: 'เด็กชายกิตติภูมิ สุขสำราญ',
    school_id: 'sch-01',
    school_name: 'โรงเรียนบ้านหนองหว้า',
    event_id: 'ev-01',
    event_name: 'ฟุตบอลชาย 7 คน รุ่น ป.4 - ป.6',
    sport_name: 'ฟุตบอล (Football)',
    result_id: 'res-01',
    award: 'รางวัลชนะเลิศ (เหรียญทอง 🥇)',
    medal: 'GOLD',
    issue_date: '2026-11-20',
    template_type: 'STUDENT',
    drive_file_id: '1aBcDeFgHiJkLmNoPqRsTuVwXyZ_002',
    drive_url: 'https://drive.google.com/file/d/sample002/view',
    qr_token: 'TOKEN_SSK69_CERT_00002_9C4B18D',
    status: 'ISSUED',
    created_at: '2026-08-20T10:00:00.000Z'
  },
  {
    id: 'cert-03',
    competition_id: 'comp-2569',
    certificate_no: 'สสก.2569-00003',
    recipient_type: 'COACH',
    recipient_id: 'coa-01',
    recipient_name: 'นายวิชัย ชำนาญกีฬา',
    school_id: 'sch-01',
    school_name: 'โรงเรียนบ้านหนองหว้า',
    event_id: 'ev-01',
    event_name: 'ฟุตบอลชาย 7 คน รุ่น ป.4 - ป.6',
    sport_name: 'ฟุตบอล (Football)',
    result_id: 'res-01',
    award: 'ครูผู้ฝึกสอนนักกีฬา รางวัลชนะเลิศ (เหรียญทอง 🥇)',
    medal: 'GOLD',
    issue_date: '2026-11-20',
    template_type: 'COACH',
    drive_file_id: '1aBcDeFgHiJkLmNoPqRsTuVwXyZ_003',
    drive_url: 'https://drive.google.com/file/d/sample003/view',
    qr_token: 'TOKEN_SSK69_CERT_00003_3D8E52A',
    status: 'ISSUED',
    created_at: '2026-08-20T10:00:00.000Z'
  },
  {
    id: 'cert-04',
    competition_id: 'comp-2569',
    certificate_no: 'สสก.2569-00004',
    recipient_type: 'STUDENT',
    recipient_id: 'stu-06',
    recipient_name: 'เด็กชายภานุวัฒน์ จันทร์เกษม',
    school_id: 'sch-02',
    school_name: 'โรงเรียนบ้านสระสะแก',
    event_id: 'ev-01',
    event_name: 'ฟุตบอลชาย 7 คน รุ่น ป.4 - ป.6',
    sport_name: 'ฟุตบอล (Football)',
    result_id: 'res-02',
    award: 'รางวัลรองชนะเลิศอันดับ 1 (เหรียญเงิน 🥈)',
    medal: 'SILVER',
    issue_date: '2026-11-20',
    template_type: 'STUDENT',
    drive_file_id: '1aBcDeFgHiJkLmNoPqRsTuVwXyZ_004',
    drive_url: 'https://drive.google.com/file/d/sample004/view',
    qr_token: 'TOKEN_SSK69_CERT_00004_7E2A91C',
    status: 'ISSUED',
    created_at: '2026-08-20T10:00:00.000Z'
  },
  {
    id: 'cert-05',
    competition_id: 'comp-2569',
    certificate_no: 'สสก.2569-00005',
    recipient_type: 'STUDENT',
    recipient_id: 'stu-09',
    recipient_name: 'เด็กชายธนภูมิ แสงสุริยา',
    school_id: 'sch-03',
    school_name: 'โรงเรียนบ้านสว่าง',
    event_id: 'ev-03',
    event_name: 'วิ่ง 100 เมตร ชาย รุ่น ป.4 - ป.6',
    sport_name: 'กรีฑา (Athletics)',
    result_id: 'res-06',
    award: 'รางวัลชนะเลิศ (เหรียญทอง 🥇)',
    medal: 'GOLD',
    issue_date: '2026-11-20',
    template_type: 'STUDENT',
    drive_file_id: '1aBcDeFgHiJkLmNoPqRsTuVwXyZ_005',
    drive_url: 'https://drive.google.com/file/d/sample005/view',
    qr_token: 'TOKEN_SSK69_CERT_00005_1F5C83E',
    status: 'ISSUED',
    created_at: '2026-08-20T10:00:00.000Z'
  }
];

export const INITIAL_SETTINGS: Setting[] = [
  {
    id: 'set-01',
    setting_key: 'MEDAL_RANKING_CRITERIA',
    setting_value: 'GOLD_FIRST', // GOLD_FIRST, TOTAL_FIRST
    description: 'เกณฑ์การจัดอันดับเหรียญ (GOLD_FIRST: ทอง -> เงิน -> ทองแดง -> รวม)',
    updated_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'set-02',
    setting_key: 'CERTIFICATE_PREFIX',
    setting_value: 'สสก.2569-',
    description: 'คำนำหน้าเลขที่เกียรติบัตร',
    updated_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'set-03',
    setting_key: 'CERTIFICATE_COUNTER',
    setting_value: '5',
    description: 'ลำดับเลขที่เกียรติบัตรล่าสุด (สำหรับระบบ Auto-Increment Transaction)',
    updated_at: '2026-08-20T10:00:00.000Z'
  },
  {
    id: 'set-04',
    setting_key: 'GOOGLE_DRIVE_SYNC_ENABLED',
    setting_value: 'true',
    description: 'เปิดใช้งานการบันทึกเกียรติบัตรและรายงานลง Google Drive',
    updated_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'set-05',
    setting_key: 'GOOGLE_DRIVE_FOLDER_NAME',
    setting_value: 'การแข่งขันกีฬากลุ่มโรงเรียนสว่างสูงกระสัง 2569',
    description: 'ชื่อโฟลเดอร์หลักใน Google Drive',
    updated_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'set-06',
    setting_key: 'SIGNATORY_1_NAME',
    setting_value: 'นายสมเกียรติ สว่างวงศ์',
    description: 'ชื่อผู้ลงนาม 1 (ประธานกลุ่มโรงเรียนสว่างสูงกระสัง)',
    updated_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'set-07',
    setting_key: 'SIGNATORY_1_POS',
    setting_value: 'ประธานกลุ่มโรงเรียนสว่างสูงกระสัง',
    description: 'ตำแหน่งผู้ลงนาม 1',
    updated_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'set-08',
    setting_key: 'SIGNATORY_2_NAME',
    setting_value: 'นายอดุลย์ พัฒนกุล',
    description: 'ชื่อผู้ลงนาม 2 (ผู้อำนวยการ สพป.บุรีรัมย์ เขต 2)',
    updated_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'set-09',
    setting_key: 'SIGNATORY_2_POS',
    setting_value: 'ผู้อำนวยการสำนักงานเขตพื้นที่การศึกษาประถมศึกษาบุรีรัมย์ เขต 2',
    description: 'ตำแหน่งผู้ลงนาม 2',
    updated_at: '2026-08-01T08:00:00.000Z'
  }
];

export const INITIAL_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'tmpl-student',
    name: 'เทมเพลตเกียรติบัตรนักกีฬา (นักเรียน)',
    type: 'STUDENT',
    title_text: 'เกียรติบัตรนี้ให้ไว้เพื่อแสดงว่า',
    body_format: 'ได้รับรางวัล {{AWARD}}\nการแข่งขัน {{EVENT}}\nการแข่งขันกีฬากลุ่มโรงเรียนสว่างสูงกระสัง ประจำปี ๒๕๖๙',
    signatory_name: 'นายสมเกียรติ สว่างวงศ์',
    signatory_position: 'ประธานกลุ่มโรงเรียนสว่างสูงกระสัง',
    signatory_name_2: 'นายอดุลย์ พัฒนกุล',
    signatory_position_2: 'ผู้อำนวยการ สพป.บุรีรัมย์ เขต ๒',
    logo_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=120&auto=format&fit=crop&q=80',
    border_theme: 'ROYAL_GOLD'
  },
  {
    id: 'tmpl-coach',
    name: 'เทมเพลตเกียรติบัตรครูผู้ฝึกสอน',
    type: 'COACH',
    title_text: 'เกียรติบัตรนี้ให้ไว้เพื่อแสดงว่า',
    body_format: 'เป็นครูผู้ฝึกสอนนักกีฬา ได้รับรางวัล {{AWARD}}\nการแข่งขัน {{EVENT}}\nการแข่งขันกีฬากลุ่มโรงเรียนสว่างสูงกระสัง ประจำปี ๒๕๖๙',
    signatory_name: 'นายสมเกียรติ สว่างวงศ์',
    signatory_position: 'ประธานกลุ่มโรงเรียนสว่างสูงกระสัง',
    signatory_name_2: 'นายอดุลย์ พัฒนกุล',
    signatory_position_2: 'ผู้อำนวยการ สพป.บุรีรัมย์ เขต ๒',
    logo_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=120&auto=format&fit=crop&q=80',
    border_theme: 'BLUE_ELEGANT'
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-01',
    user_id: 'user-05',
    user_name: 'อาจารย์พิชัย ยุติธรรม (JUDGE)',
    action: 'RECORD_RESULT',
    table_name: 'results',
    record_id: 'res-01',
    ip_address: '192.168.1.105',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    created_at: '2026-08-18T16:30:00.000Z'
  },
  {
    id: 'log-02',
    user_id: 'user-01',
    user_name: 'ศุภกร รัตนสวัสดิ์ (SUPER_ADMIN)',
    action: 'BATCH_GENERATE_CERTIFICATES',
    table_name: 'certificates',
    record_id: 'cert-batch-01',
    ip_address: '192.168.1.50',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    created_at: '2026-08-20T10:00:00.000Z'
  }
];
