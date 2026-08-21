<?php
/**
 * ==============================================================================
 * ไฟล์: school/index.php
 * คำอธิบาย: ระบบจัดการข้อมูลนักเรียน ครูผู้ฝึกสอน และการลงทะเบียนเข้าแข่งขันของโรงเรียน
 * ==============================================================================
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

requireRole(['SCHOOL', 'SUPER_ADMIN', 'ADMIN']);
$user = getCurrentUser();
$pdo = Database::getConnection();
$message = '';
$error = '';

$schoolId = $user['school_id'] ?? null;
if (empty($schoolId)) {
    // ลองค้นหาจากรหัส SMIS / school_code
    $lookup = $pdo->prepare("SELECT id FROM schools WHERE smis_code = ? OR school_code = ? LIMIT 1");
    $lookup->execute([$user['username'], $user['username']]);
    $schoolId = $lookup->fetchColumn();
    
    // หากยังไม่พบ และเป็น Admin หรือผู้ใช้งาน ให้เลือกโรงเรียนแรกเป็นค่าเริ่มต้น
    if (empty($schoolId)) {
        $schoolId = $pdo->query("SELECT id FROM schools LIMIT 1")->fetchColumn();
    }
    $_SESSION['user']['school_id'] = $schoolId;
}

// -------------------------------------------------------------
// 0. แก้ไขข้อมูลโรงเรียน (School Profile Update)
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_update_school'])) {
    $schoolName = trim($_POST['school_name'] ?? '');
    $shortName = trim($_POST['short_name'] ?? '');
    $directorName = trim($_POST['director_name'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $logo = trim($_POST['logo'] ?? '');

    if ($schoolName) {
        $stmt = $pdo->prepare("
            UPDATE schools 
            SET school_name = ?, short_name = ?, director_name = ?, address = ?, phone = ?, logo = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $schoolName,
            $shortName ?: $schoolName,
            $directorName,
            $address,
            $phone,
            $logo ?: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150',
            $schoolId
        ]);
        logActivity('UPDATE', 'schools', "แก้ไขข้อมูลโรงเรียน: $schoolName");
        $message = "บันทึกและปรับปรุงข้อมูลสถานศึกษาเรียบร้อยแล้ว";
    } else {
        $error = "กรุณากรอกชื่อสถานศึกษา";
    }
}

$school = $pdo->prepare("SELECT * FROM schools WHERE id = ?");
$school->execute([$schoolId]);
$schoolData = $school->fetch() ?: [
    'id' => $schoolId,
    'school_name' => 'โรงเรียนของคุณ',
    'smis_code' => 'SMIS0000',
    'director_name' => '-',
    'address' => 'อ.กระสัง จ.บุรีรัมย์',
    'phone' => '-',
    'logo' => 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150'
];

$comp = $pdo->query("SELECT * FROM competitions LIMIT 1")->fetch();
$compId = $comp['id'] ?? 'comp-2026';

// -------------------------------------------------------------
// 1. เพิ่ม / ลบ ข้อมูลนักเรียน
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_student'])) {
    $act = $_POST['action_student'];
    if ($act === 'add') {
        $prefix = trim($_POST['prefix'] ?? 'ด.ช.');
        $first = trim($_POST['first_name'] ?? '');
        $last = trim($_POST['last_name'] ?? '');
        $gender = trim($_POST['gender'] ?? 'MALE');
        $grade = trim($_POST['grade_level'] ?? 'ป.4');
        $stuCode = trim($_POST['student_code'] ?? '');
        $birthDate = trim($_POST['birth_date'] ?? '2014-01-01');

        if ($first && $last) {
            $stId = 'stu-' . uniqid();
            $stmt = $pdo->prepare("
                INSERT INTO students (id, school_id, student_code, prefix, first_name, last_name, gender, birth_date, grade_level, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
            ");
            $stmt->execute([$stId, $schoolId, $stuCode ?: rand(10000, 99999), $prefix, $first, $last, $gender, $birthDate, $grade]);
            $message = "เพิ่มข้อมูลนักเรียน \"$prefix$first $last\" เรียบร้อยแล้ว";
        }
    }
}

if (isset($_GET['delete_student_id'])) {
    $delStId = $_GET['delete_student_id'];
    $pdo->prepare("DELETE FROM registration_students WHERE student_id = ?")->execute([$delStId]);
    $pdo->prepare("DELETE FROM students WHERE id = ? AND school_id = ?")->execute([$delStId, $schoolId]);
    $message = "ลบข้อมูลนักเรียนเรียบร้อยแล้ว";
}

// -------------------------------------------------------------
// 2. เพิ่ม / ลบ ข้อมูลครูผู้ฝึกสอน
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_coach'])) {
    $act = $_POST['action_coach'];
    if ($act === 'add') {
        $cPrefix = trim($_POST['coach_prefix'] ?? 'นาย');
        $cFirst = trim($_POST['coach_first'] ?? '');
        $cLast = trim($_POST['coach_last'] ?? '');
        $cPos = trim($_POST['position'] ?? 'ครูผู้ฝึกสอน');
        $cPhone = trim($_POST['coach_phone'] ?? '');

        if ($cFirst && $cLast) {
            $cId = 'coa-' . uniqid();
            $stmt = $pdo->prepare("
                INSERT INTO coaches (id, school_id, prefix, first_name, last_name, phone, position, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
            ");
            $stmt->execute([$cId, $schoolId, $cPrefix, $cFirst, $cLast, $cPhone, $cPos]);
            $message = "เพิ่มข้อมูลครูผู้ฝึกสอน \"$cPrefix$cFirst $cLast\" เรียบร้อยแล้ว";
        }
    }
}

if (isset($_GET['delete_coach_id'])) {
    $delCId = $_GET['delete_coach_id'];
    $pdo->prepare("DELETE FROM coaches WHERE id = ? AND school_id = ?")->execute([$delCId, $schoolId]);
    $message = "ลบข้อมูลครูผู้ฝึกสอนเรียบร้อยแล้ว";
}

// -------------------------------------------------------------
// 3. ลงทะเบียนเข้าแข่งขัน (Event Registration)
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_register'])) {
    $eventId = trim($_POST['event_id'] ?? '');
    $coachId = trim($_POST['coach_id'] ?? '');
    $studentIds = $_POST['student_ids'] ?? [];

    if ($eventId && !empty($studentIds)) {
        // ตรวจสอบว่าเคยสมัครรายการนี้หรือยัง
        $chk = $pdo->prepare("SELECT id FROM registrations WHERE event_id = ? AND school_id = ?");
        $chk->execute([$eventId, $schoolId]);
        $existing = $chk->fetch();

        if ($existing) {
            $error = "โรงเรียนของท่านได้ลงทะเบียนรายการนี้ไปแล้ว หากต้องการเปลี่ยนรายชื่อ กรุณายกเลิกรายการเดิมก่อน";
        } else {
            try {
                $pdo->beginTransaction();
                $regId = 'reg-' . uniqid();
                $rStmt = $pdo->prepare("
                    INSERT INTO registrations (id, competition_id, event_id, school_id, coach_id, status)
                    VALUES (?, ?, ?, ?, ?, 'REGISTERED')
                ");
                $rStmt->execute([$regId, $compId, $eventId, $schoolId, $coachId ?: null]);

                $rsStmt = $pdo->prepare("INSERT INTO registration_students (id, registration_id, student_id) VALUES (?, ?, ?)");
                foreach ($studentIds as $sId) {
                    $rsStmt->execute(['rs-' . uniqid(), $regId, $sId]);
                }

                $pdo->commit();
                $message = "ลงทะเบียนส่งนักกีฬาเข้าแข่งขันเรียบร้อยแล้ว!";
            } catch (Exception $e) {
                $pdo->rollBack();
                $error = "เกิดข้อผิดพลาดในการลงทะเบียน: " . $e->getMessage();
            }
        }
    } else {
        $error = "กรุณาเลือกรายการแข่งขันและเลือกนักกีฬาอย่างน้อย 1 คน";
    }
}

if (isset($_GET['cancel_reg_id'])) {
    $delRegId = $_GET['cancel_reg_id'];
    $pdo->prepare("DELETE FROM registration_students WHERE registration_id = ?")->execute([$delRegId]);
    $pdo->prepare("DELETE FROM registrations WHERE id = ? AND school_id = ?")->execute([$delRegId, $schoolId]);
    $message = "ยกเลิกการส่งแข่งขันรายการดังกล่าวเรียบร้อยแล้ว";
}

// -------------------------------------------------------------
// ดึงข้อมูลแสดงผล
// -------------------------------------------------------------
// รายชื่อนักเรียน
$students = $pdo->prepare("SELECT * FROM students WHERE school_id = ? ORDER BY grade_level ASC, first_name ASC");
$students->execute([$schoolId]);
$studentList = $students->fetchAll();

// รายชื่อครู
$coaches = $pdo->prepare("SELECT * FROM coaches WHERE school_id = ? ORDER BY first_name ASC");
$coaches->execute([$schoolId]);
$coachList = $coaches->fetchAll();

// รายการแข่งขันทั้งหมดที่เปิดรับ
$events = $pdo->query("
    SELECT e.*, sp.sport_name, sp.sport_icon 
    FROM events e 
    JOIN sports sp ON e.sport_id = sp.id 
    ORDER BY sp.sport_name ASC, e.event_name ASC
")->fetchAll();

// รายการที่โรงเรียนนี้ลงทะเบียนไว้แล้ว
$myRegistrations = $pdo->prepare("
    SELECT r.*, e.event_name, e.event_code, e.age_group, e.grade, sp.sport_name, sp.sport_icon,
           c.first_name as coach_first, c.last_name as coach_last, c.prefix as coach_prefix,
           (SELECT COUNT(*) FROM registration_students rs WHERE rs.registration_id = r.id) as student_count
    FROM registrations r
    JOIN events e ON r.event_id = e.id
    JOIN sports sp ON e.sport_id = sp.id
    LEFT JOIN coaches c ON r.coach_id = c.id
    WHERE r.school_id = ?
    ORDER BY sp.sport_name ASC
");
$myRegistrations->execute([$schoolId]);
$myRegList = $myRegistrations->fetchAll();

// เกียรติบัตรของโรงเรียน
$certs = $pdo->prepare("SELECT * FROM certificates WHERE school_id = ? ORDER BY issue_date DESC, medal ASC");
$certs->execute([$schoolId]);
$certList = $certs->fetchAll();

$pageTitle = 'ระบบบริหารจัดการสำหรับโรงเรียน - ' . htmlspecialchars($schoolData['school_name']);
require_once __DIR__ . '/../includes/header.php';
?>

<div class="space-y-6">
    <!-- School Banner -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-5">
            <img 
                src="<?= htmlspecialchars($schoolData['logo'] ?: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150') ?>" 
                class="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
            >
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        SMIS: <?= htmlspecialchars($schoolData['smis_code']) ?>
                    </span>
                    <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold">
                        🏫 สังกัดกลุ่มโรงเรียนสว่างสูงกระสัง
                    </span>
                </div>
                <h1 class="text-xl sm:text-2xl font-bold font-kanit text-slate-900 leading-tight">
                    <?= htmlspecialchars($schoolData['school_name']) ?>
                </h1>
                <p class="text-xs text-slate-500 mt-1">
                    ผู้อำนวยการ: <b><?= htmlspecialchars($schoolData['director_name'] ?: 'ยังไม่ระบุ') ?></b> 
                    | โทร: <?= htmlspecialchars($schoolData['phone'] ?: '-') ?>
                </p>
            </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
            <button type="button" onclick="document.getElementById('schoolProfileSection').classList.toggle('hidden')" class="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer">
                <span>✏️</span> แก้ไขข้อมูลโรงเรียน
            </button>
            <a href="/school_detail.php?id=<?= urlencode($schoolId) ?>" class="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl border border-blue-200 transition flex items-center gap-1.5 shadow-2xs">
                <span>🏆</span> ดูสรุปผลงาน
            </a>
            <a href="/change-password.php" class="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition">
                🔑 เปลี่ยนรหัสผ่าน
            </a>
        </div>
    </div>

    <!-- School Profile Edit Form Section -->
    <div id="schoolProfileSection" class="<?= isset($_POST['action_update_school']) ? '' : 'hidden' ?> bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-lg space-y-4 animate-fadeIn">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
                <h3 class="font-bold font-kanit text-slate-900 text-base flex items-center gap-2">
                    <span>🏫</span> แก้ไขและปรับปรุงข้อมูลสถานศึกษา
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">
                    แก้ไขชื่อโรงเรียน, ชื่อ-นามสกุลผู้อำนวยการโรงเรียน, ที่อยู่ และเบอร์โทรศัพท์ เพื่อความถูกต้องของเกียรติบัตรและเอกสารทางการ
                </p>
            </div>
            <button type="button" onclick="document.getElementById('schoolProfileSection').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1 bg-slate-100 rounded-lg">
                ปิด ✕
            </button>
        </div>

        <form method="POST" class="space-y-4 text-xs">
            <input type="hidden" name="action_update_school" value="1">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">ชื่อเต็มสถานศึกษา <span class="text-rose-500">*</span></label>
                    <input type="text" name="school_name" required value="<?= htmlspecialchars($schoolData['school_name']) ?>" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-amber-500">
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">ชื่อย่อสถานศึกษา</label>
                    <input type="text" name="short_name" value="<?= htmlspecialchars($schoolData['short_name'] ?? '') ?>" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-500">
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">ชื่อผู้อำนวยการโรงเรียน <span class="text-rose-500">*</span></label>
                    <input type="text" name="director_name" required value="<?= htmlspecialchars($schoolData['director_name'] ?? '') ?>" placeholder="เช่น นายสมเกียรติ สว่างวงศ์" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-amber-500">
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
                    <input type="text" name="phone" value="<?= htmlspecialchars($schoolData['phone'] ?? '') ?>" placeholder="044-xxxxxx หรือ 081-xxxxxxx" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-500">
                </div>

                <div class="sm:col-span-2">
                    <label class="block font-bold text-slate-700 mb-1">ที่อยู่ / ที่ตั้งสถานศึกษา</label>
                    <input type="text" name="address" value="<?= htmlspecialchars($schoolData['address'] ?? '') ?>" placeholder="เช่น หมู่ 4 ต.หนองหว้า อ.กระสัง จ.บุรีรัมย์ 31160" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-500">
                </div>

                <div class="md:col-span-3">
                    <label class="block font-bold text-slate-700 mb-1">URL โลโก้ / ตราประจำโรงเรียน</label>
                    <input type="url" name="logo" value="<?= htmlspecialchars($schoolData['logo'] ?? '') ?>" placeholder="https://..." class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-500">
                </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
                <button type="button" onclick="document.getElementById('schoolProfileSection').classList.add('hidden')" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition">
                    ยกเลิก
                </button>
                <button type="submit" class="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer">
                    💾 บันทึกข้อมูลโรงเรียน
                </button>
            </div>
        </form>
    </div>

    <?php if ($message): ?>
        <div class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 shadow-sm">
            <span class="text-base">✅</span> <?= htmlspecialchars($message) ?>
        </div>
    <?php endif; ?>

    <?php if ($error): ?>
        <div class="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2 shadow-sm">
            <span class="text-base">✕</span> <?= htmlspecialchars($error) ?>
        </div>
    <?php endif; ?>

    <!-- Summary Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-xs text-slate-500 font-medium">นักเรียนในระบบ</p>
            <p class="text-2xl font-bold font-kanit text-slate-900 mt-1"><?= count($studentList) ?> <span class="text-xs font-normal text-slate-400">คน</span></p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-xs text-slate-500 font-medium">ครูผู้ฝึกสอน</p>
            <p class="text-2xl font-bold font-kanit text-slate-900 mt-1"><?= count($coachList) ?> <span class="text-xs font-normal text-slate-400">คน</span></p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-xs text-slate-500 font-medium">รายการที่ส่งแข่งขัน</p>
            <p class="text-2xl font-bold font-kanit text-blue-600 mt-1"><?= count($myRegList) ?> <span class="text-xs font-normal text-slate-400">รายการ</span></p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-xs text-slate-500 font-medium">เกียรติบัตรที่ได้รับ</p>
            <p class="text-2xl font-bold font-kanit text-amber-600 mt-1"><?= count($certList) ?> <span class="text-xs font-normal text-slate-400">ใบ</span></p>
        </div>
    </div>

    <!-- Main 3-Tab Grid -->
    <div class="space-y-6">
        <!-- 1. ลงทะเบียนส่งแข่งขัน (Registration Section) -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                    <h2 class="text-lg font-bold font-kanit text-slate-900 flex items-center gap-2">
                        <span>📝</span> สมัครส่งนักกีฬาเข้าแข่งขัน (Event Registration)
                    </h2>
                    <p class="text-xs text-slate-500">เลือกรายการกีฬา ครูผู้ฝึกสอน และนักเรียนที่ต้องการส่งเข้าแข่งขัน</p>
                </div>
            </div>

            <form method="POST" class="space-y-4 text-xs">
                <input type="hidden" name="action_register" value="save">
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- เลือกรายการแข่งขัน -->
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">เลือกรายการแข่งขัน <span class="text-rose-500">*</span></label>
                        <select name="event_id" required class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold">
                            <option value="">-- เลือกรายการแข่งขัน --</option>
                            <?php foreach ($events as $ev): ?>
                                <option value="<?= htmlspecialchars($ev['id']) ?>">
                                    <?= $ev['sport_icon'] ?> <?= htmlspecialchars($ev['sport_name']) ?> - <?= htmlspecialchars($ev['event_name']) ?> (<?= htmlspecialchars($ev['age_group']) ?>)
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <!-- เลือกครูผู้ฝึกสอน -->
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">ครูผู้ฝึกสอนที่รับผิดชอบ</label>
                        <select name="coach_id" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm">
                            <option value="">-- เลือกครูผู้ฝึกสอน --</option>
                            <?php foreach ($coachList as $c): ?>
                                <option value="<?= htmlspecialchars($c['id']) ?>">
                                    <?= htmlspecialchars($c['prefix'] . $c['first_name'] . ' ' . $c['last_name']) ?> (<?= htmlspecialchars($c['position']) ?>)
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>

                <!-- เลือกนักเรียน -->
                <div>
                    <label class="block font-bold text-slate-700 mb-1">เลือกนักเรียน/นักกีฬาที่ส่งเข้าแข่งขัน <span class="text-rose-500">*</span></label>
                    <?php if (empty($studentList)): ?>
                        <div class="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-xs">
                            ⚠️ ยังไม่มีรายชื่อนักเรียนในระบบ กรุณาเพิ่มรายชื่อนักเรียนด้านล่างก่อนทำการสมัคร
                        </div>
                    <?php else: ?>
                        <div class="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            <?php foreach ($studentList as $st): ?>
                                <label class="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 hover:border-blue-400 cursor-pointer text-xs">
                                    <input type="checkbox" name="student_ids[]" value="<?= htmlspecialchars($st['id']) ?>" class="w-4 h-4 rounded text-blue-600">
                                    <div class="min-w-0">
                                        <span class="font-bold text-slate-800"><?= htmlspecialchars($st['prefix'] . $st['first_name'] . ' ' . $st['last_name']) ?></span>
                                        <span class="text-[10px] text-slate-400 block"><?= htmlspecialchars($st['grade_level']) ?> (<?= $st['gender'] === 'MALE' ? 'ชาย' : 'หญิง' ?>)</span>
                                    </div>
                                </label>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>

                <button type="submit" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer">
                    ➕ บันทึกการส่งแข่งขัน
                </button>
            </form>

            <!-- Table of Registered Events -->
            <div class="pt-4 border-t border-slate-100">
                <h3 class="font-bold font-kanit text-slate-900 text-sm mb-3">รายการแข่งขันที่โรงเรียนส่งเข้าร่วมแล้ว (<?= count($myRegList) ?> รายการ)</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
                            <tr>
                                <th class="p-3 pl-4">รายการแข่งขัน</th>
                                <th class="p-3">ชนิดกีฬา</th>
                                <th class="p-3">รุ่น/ระดับชั้น</th>
                                <th class="p-3">ครูผู้ฝึกสอน</th>
                                <th class="p-3 text-center">จำนวนนักกีฬา</th>
                                <th class="p-3 pr-4 text-right">ยกเลิก</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <?php if (empty($myRegList)): ?>
                                <tr>
                                    <td colspan="6" class="p-6 text-center text-slate-400">ยังไม่ได้ลงทะเบียนส่งแข่งขันในรายการใด</td>
                                </tr>
                            <?php else: ?>
                                <?php foreach ($myRegList as $reg): ?>
                                    <tr class="hover:bg-slate-50 transition">
                                        <td class="p-3 pl-4 font-bold text-slate-900 font-kanit">
                                            <?= htmlspecialchars($reg['event_name']) ?>
                                        </td>
                                        <td class="p-3 text-slate-600">
                                            <?= $reg['sport_icon'] ?> <?= htmlspecialchars($reg['sport_name']) ?>
                                        </td>
                                        <td class="p-3 text-slate-500">
                                            <?= htmlspecialchars($reg['age_group']) ?> (<?= htmlspecialchars($reg['grade']) ?>)
                                        </td>
                                        <td class="p-3 text-slate-700">
                                            <?= $reg['coach_first'] ? htmlspecialchars($reg['coach_prefix'] . $reg['coach_first'] . ' ' . $reg['coach_last']) : '-' ?>
                                        </td>
                                        <td class="p-3 text-center font-bold text-blue-700">
                                            <?= $reg['student_count'] ?> คน
                                        </td>
                                        <td class="p-3 pr-4 text-right">
                                            <a 
                                                href="?cancel_reg_id=<?= urlencode($reg['id']) ?>" 
                                                onclick="return confirm('คุณต้องการยกเลิกการส่งแข่งขันรายการนี้ใช่หรือไม่?')"
                                                class="text-rose-600 hover:text-rose-800 font-semibold"
                                            >
                                                ยกเลิก
                                            </a>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- 2. จัดการนักเรียน & ครูผู้ฝึกสอน -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- เพิ่มนักเรียน -->
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 class="font-bold font-kanit text-slate-900 text-base flex items-center gap-2">
                        <span>🎒</span> จัดการรายชื่อนักเรียน (<?= count($studentList) ?> คน)
                    </h3>
                </div>

                <form method="POST" class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                    <input type="hidden" name="action_student" value="add">
                    <div class="font-bold text-slate-700">➕ เพิ่มนักเรียนใหม่</div>
                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">คำนำหน้า</label>
                            <select name="prefix" class="w-full p-2 bg-white border border-slate-300 rounded-lg">
                                <option value="ด.ช.">ด.ช.</option>
                                <option value="ด.ญ.">ด.ญ.</option>
                                <option value="นาย">นาย</option>
                                <option value="น.ส.">น.ส.</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">ชื่อ <span class="text-rose-500">*</span></label>
                            <input type="text" name="first_name" required placeholder="ชื่อ" class="w-full p-2 bg-white border border-slate-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">นามสกุล <span class="text-rose-500">*</span></label>
                            <input type="text" name="last_name" required placeholder="นามสกุล" class="w-full p-2 bg-white border border-slate-300 rounded-lg">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">เพศ</label>
                            <select name="gender" class="w-full p-2 bg-white border border-slate-300 rounded-lg">
                                <option value="MALE">ชาย</option>
                                <option value="FEMALE">หญิง</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">ระดับชั้น</label>
                            <select name="grade_level" class="w-full p-2 bg-white border border-slate-300 rounded-lg">
                                <option value="ป.1">ป.1</option>
                                <option value="ป.2">ป.2</option>
                                <option value="ป.3">ป.3</option>
                                <option value="ป.4" selected>ป.4</option>
                                <option value="ป.5">ป.5</option>
                                <option value="ป.6">ป.6</option>
                                <option value="ม.1">ม.1</option>
                                <option value="ม.2">ม.2</option>
                                <option value="ม.3">ม.3</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition cursor-pointer">
                        บันทึกนักเรียน
                    </button>
                </form>

                <div class="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
                    <?php foreach ($studentList as $s): ?>
                        <div class="py-2 flex items-center justify-between">
                            <div>
                                <span class="font-bold text-slate-800"><?= htmlspecialchars($s['prefix'] . $s['first_name'] . ' ' . $s['last_name']) ?></span>
                                <span class="text-[11px] text-slate-400 ml-2"><?= htmlspecialchars($s['grade_level']) ?> (<?= $s['gender'] === 'MALE' ? 'ชาย' : 'หญิง' ?>)</span>
                            </div>
                            <a href="?delete_student_id=<?= urlencode($s['id']) ?>" onclick="return confirm('ยืนยันลบนักเรียนคนนี้?')" class="text-rose-500 hover:text-rose-700 text-[11px] font-semibold">
                                🗑️ ลบ
                            </a>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- เพิ่มครูผู้ฝึกสอน -->
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 class="font-bold font-kanit text-slate-900 text-base flex items-center gap-2">
                        <span>👨‍🏫</span> ครูผู้ฝึกสอน (<?= count($coachList) ?> คน)
                    </h3>
                </div>

                <form method="POST" class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                    <input type="hidden" name="action_coach" value="add">
                    <div class="font-bold text-slate-700">➕ เพิ่มครูผู้ฝึกสอน</div>
                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">คำนำหน้า</label>
                            <select name="coach_prefix" class="w-full p-2 bg-white border border-slate-300 rounded-lg">
                                <option value="นาย">นาย</option>
                                <option value="นาง">นาง</option>
                                <option value="น.ส.">น.ส.</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">ชื่อ <span class="text-rose-500">*</span></label>
                            <input type="text" name="coach_first" required placeholder="ชื่อ" class="w-full p-2 bg-white border border-slate-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">นามสกุล <span class="text-rose-500">*</span></label>
                            <input type="text" name="coach_last" required placeholder="นามสกุล" class="w-full p-2 bg-white border border-slate-300 rounded-lg">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">ตำแหน่ง</label>
                            <input type="text" name="position" value="ครูผู้ฝึกสอน" class="w-full p-2 bg-white border border-slate-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">เบอร์โทร</label>
                            <input type="text" name="coach_phone" placeholder="08x-xxxxxxx" class="w-full p-2 bg-white border border-slate-300 rounded-lg">
                        </div>
                    </div>
                    <button type="submit" class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer">
                        บันทึกครูผู้ฝึกสอน
                    </button>
                </form>

                <div class="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
                    <?php foreach ($coachList as $c): ?>
                        <div class="py-2 flex items-center justify-between">
                            <div>
                                <span class="font-bold text-slate-800"><?= htmlspecialchars($c['prefix'] . $c['first_name'] . ' ' . $c['last_name']) ?></span>
                                <span class="text-[11px] text-slate-400 ml-2"><?= htmlspecialchars($c['position']) ?> (<?= htmlspecialchars($c['phone'] ?: '-') ?>)</span>
                            </div>
                            <a href="?delete_coach_id=<?= urlencode($c['id']) ?>" onclick="return confirm('ยืนยันลบครูผู้ฝึกสอนท่านนี้?')" class="text-rose-500 hover:text-rose-700 text-[11px] font-semibold">
                                🗑️ ลบ
                            </a>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>

        <!-- 3. เกียรติบัตรของโรงเรียน -->
        <?php if (!empty($certList)): ?>
            <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 class="font-bold font-kanit text-slate-900 text-base flex items-center gap-2">
                        <span>📜</span> เกียรติบัตรที่ได้รับของโรงเรียน (<?= count($certList) ?> ฉบับ)
                    </h3>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <?php foreach ($certList as $c): ?>
                        <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                            <div>
                                <div class="font-bold text-slate-900 text-xs"><?= htmlspecialchars($c['recipient_name']) ?></div>
                                <div class="text-[11px] text-slate-500"><?= htmlspecialchars($c['award']) ?> &bull; <?= htmlspecialchars($c['event_name']) ?></div>
                            </div>
                            <a href="/verify.php?token=<?= urlencode($c['qr_token'] ?? $c['certificate_no']) ?>" target="_blank" class="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold border border-blue-200">
                                🔍 ดูใบจริง
                            </a>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
