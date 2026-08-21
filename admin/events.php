<?php
/**
 * ==============================================================================
 * ไฟล์: admin/events.php
 * คำอธิบาย: จัดการชนิดกีฬาและรายการแข่งขัน (Sports & Events Management)
 * ==============================================================================
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

requireRole(['SUPER_ADMIN', 'ADMIN']);
$pdo = Database::getConnection();
$message = '';
$error = '';

// ตรวจสอบค่า competition_id
$comp = $pdo->query("SELECT * FROM competitions LIMIT 1")->fetch();
$compId = $comp['id'] ?? 'comp-2026';

// -------------------------------------------------------------
// 1. จัดการชนิดกีฬา (Add / Edit / Delete Sport)
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_sport'])) {
    $action = $_POST['action_sport'];
    $sportName = trim($_POST['sport_name'] ?? '');
    $sportIcon = trim($_POST['sport_icon'] ?? '🏆');
    $category = trim($_POST['category'] ?? 'BALL_SPORTS');
    $description = trim($_POST['description'] ?? '');
    $sportId = trim($_POST['sport_id'] ?? '');

    if ($action === 'add' && $sportName) {
        $newId = 'sp-' . uniqid();
        $stmt = $pdo->prepare("INSERT INTO sports (id, sport_name, sport_icon, description, category, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')");
        $stmt->execute([$newId, $sportName, $sportIcon, $description, $category]);
        logActivity('ADD_SPORT', 'SPORTS', "เพิ่มชนิดกีฬา: $sportName");
        $message = "เพิ่มชนิดกีฬา \"$sportName\" เรียบร้อยแล้ว";
    } elseif ($action === 'edit' && $sportId && $sportName) {
        $stmt = $pdo->prepare("UPDATE sports SET sport_name = ?, sport_icon = ?, description = ?, category = ? WHERE id = ?");
        $stmt->execute([$sportName, $sportIcon, $description, $category, $sportId]);
        logActivity('EDIT_SPORT', 'SPORTS', "แก้ไขชนิดกีฬา: $sportName");
        $message = "บันทึกการแก้ไขชนิดกีฬา \"$sportName\" เรียบร้อยแล้ว";
    }
}

if (isset($_GET['delete_sport_id'])) {
    $delSportId = $_GET['delete_sport_id'];
    $stmt = $pdo->prepare("DELETE FROM sports WHERE id = ?");
    $stmt->execute([$delSportId]);
    logActivity('DELETE_SPORT', 'SPORTS', "ลบชนิดกีฬา ID: $delSportId");
    $message = "ลบชนิดกีฬาเรียบร้อยแล้ว";
}

// -------------------------------------------------------------
// 2. จัดการรายการแข่งขัน (Add / Edit / Delete Event)
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_event'])) {
    $action = $_POST['action_event'];
    $sportId = trim($_POST['sport_id'] ?? '');
    $eventCode = trim($_POST['event_code'] ?? '');
    $eventName = trim($_POST['event_name'] ?? '');
    $gender = trim($_POST['gender'] ?? 'MALE');
    $ageGroup = trim($_POST['age_group'] ?? 'อายุไม่เกิน 12 ปี');
    $grade = trim($_POST['grade'] ?? 'ประถมศึกษา');
    $competitionType = trim($_POST['competition_type'] ?? 'TEAM');
    $awardType = trim($_POST['award_type'] ?? 'เหรียญทอง/เงิน/ทองแดง + เกียรติบัตร');
    $maxPlayers = intval($_POST['max_players'] ?? 12);
    $minPlayers = intval($_POST['min_players'] ?? 1);
    $eventId = trim($_POST['event_id'] ?? '');

    if ($action === 'add' && $eventName && $sportId) {
        $newId = 'ev-' . uniqid();
        if (!$eventCode) {
            $eventCode = 'EV-' . rand(100, 999);
        }
        $stmt = $pdo->prepare("INSERT INTO events (id, competition_id, sport_id, event_code, event_name, gender, age_group, grade, competition_type, award_type, max_players, min_players, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')");
        $stmt->execute([$newId, $compId, $sportId, $eventCode, $eventName, $gender, $ageGroup, $grade, $competitionType, $awardType, $maxPlayers, $minPlayers]);
        logActivity('ADD_EVENT', 'EVENTS', "เพิ่มรายการแข่งขัน: $eventName ($eventCode)");
        $message = "เพิ่มรายการแข่งขัน \"$eventName\" เรียบร้อยแล้ว";
    } elseif ($action === 'edit' && $eventId && $eventName) {
        $stmt = $pdo->prepare("UPDATE events SET sport_id = ?, event_code = ?, event_name = ?, gender = ?, age_group = ?, grade = ?, competition_type = ?, award_type = ?, max_players = ?, min_players = ? WHERE id = ?");
        $stmt->execute([$sportId, $eventCode, $eventName, $gender, $ageGroup, $grade, $competitionType, $awardType, $maxPlayers, $minPlayers, $eventId]);
        logActivity('EDIT_EVENT', 'EVENTS', "แก้ไขรายการแข่งขัน: $eventName ($eventCode)");
        $message = "บันทึกการแก้ไขรายการแข่งขัน \"$eventName\" เรียบร้อยแล้ว";
    }
}

if (isset($_GET['delete_event_id'])) {
    $delEventId = $_GET['delete_event_id'];
    $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
    $stmt->execute([$delEventId]);
    logActivity('DELETE_EVENT', 'EVENTS', "ลบรายการแข่งขัน ID: $delEventId");
    $message = "ลบรายการแข่งขันเรียบร้อยแล้ว";
}

// -------------------------------------------------------------
// ดึงข้อมูลสำหรับแสดงผล
// -------------------------------------------------------------
$sports = $pdo->query("SELECT * FROM sports ORDER BY sport_name ASC")->fetchAll();
$selectedSport = $_GET['filter_sport'] ?? 'ALL';

$sqlEvents = "
    SELECT e.*, s.sport_name, s.sport_icon,
           (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as reg_count
    FROM events e
    JOIN sports s ON e.sport_id = s.id
";
if ($selectedSport !== 'ALL') {
    $sqlEvents .= " WHERE e.sport_id = " . $pdo->quote($selectedSport);
}
$sqlEvents .= " ORDER BY s.sport_name ASC, e.event_name ASC";
$events = $pdo->query($sqlEvents)->fetchAll();

$pageTitle = 'จัดการชนิดกีฬาและรายการแข่งขัน - Admin Console';
require_once __DIR__ . '/../includes/header.php';
?>

<div class="space-y-6">
    <!-- Header Bar -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 class="text-xl font-bold font-kanit text-slate-900 flex items-center gap-2">
                <span>🏆</span> จัดการชนิดกีฬาและรายการแข่งขัน (Sports & Events)
            </h1>
            <p class="text-xs text-slate-500 mt-0.5">
                กำหนดประเภทกีฬา รายการแข่งขัน รุ่นอายุ ระดับชั้น เพศ และจำนวนผู้เล่น
            </p>
        </div>
        <div class="flex items-center gap-2">
            <button onclick="document.getElementById('modalSport').classList.remove('hidden')" class="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold border border-blue-200 transition flex items-center gap-1.5 cursor-pointer">
                <span>➕</span> เพิ่มชนิดกีฬา
            </button>
            <button onclick="document.getElementById('modalEvent').classList.remove('hidden')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer">
                <span>➕</span> เพิ่มรายการแข่งขัน
            </button>
        </div>
    </div>

    <?php if ($message): ?>
        <div class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 shadow-sm">
            <span class="text-base">✅</span> <?= htmlspecialchars($message) ?>
        </div>
    <?php endif; ?>

    <!-- Sports Quick Grid -->
    <div class="space-y-3">
        <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold font-kanit text-slate-800 flex items-center gap-2">
                <span>🏅</span> ชนิดกีฬาทั้งหมด (<?= count($sports) ?> ชนิด)
            </h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <a href="?filter_sport=ALL" class="p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center <?= $selectedSport === 'ALL' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300' ?>">
                <span class="text-xl mb-1">🌐</span>
                <span class="text-xs font-bold font-kanit">ทั้งหมด</span>
                <span class="text-[10px] opacity-80"><?= count($events) ?> รายการ</span>
            </a>
            <?php foreach ($sports as $sp): 
                $countInSport = count(array_filter($events, fn($e) => $e['sport_id'] === $sp['id']));
                $isActive = $selectedSport === $sp['id'];
            ?>
                <div class="relative group rounded-2xl border p-3 text-center transition <?= $isActive ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-300' ?>">
                    <a href="?filter_sport=<?= urlencode($sp['id']) ?>" class="block">
                        <span class="text-2xl mb-1 block"><?= htmlspecialchars($sp['sport_icon'] ?: '🏆') ?></span>
                        <span class="text-xs font-bold font-kanit text-slate-900 block truncate"><?= htmlspecialchars($sp['sport_name']) ?></span>
                        <span class="text-[10px] text-slate-400 block"><?= htmlspecialchars($sp['category']) ?></span>
                    </a>
                    <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px]">
                        <button onclick='editSport(<?= json_encode($sp) ?>)' class="text-blue-600 hover:text-blue-800 font-medium">แก้ไข</button>
                        <span class="text-slate-300">|</span>
                        <a href="?delete_sport_id=<?= urlencode($sp['id']) ?>" onclick="return confirm('ยืนยันลบชนิดกีฬา <?= addslashes($sp['sport_name']) ?> หรือไม่?')" class="text-rose-600 hover:text-rose-800 font-medium">ลบ</a>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Events Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div class="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
            <h2 class="text-sm font-bold font-kanit text-slate-800 flex items-center gap-2">
                <span>📋</span> รายการแข่งขันทั้งหมด (<?= count($events) ?> รายการ)
            </h2>
            <div class="text-xs text-slate-500">
                คลิกปุ่ม <b>"แก้ไข"</b> เพื่อเปลี่ยนข้อมูลรุ่นอายุ เพศ จำนวนคน หรือประเภทการแข่งขัน
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                    <tr>
                        <th class="p-3.5 pl-6">รหัส / ชนิดกีฬา</th>
                        <th class="p-3.5">ชื่อรายการแข่งขัน</th>
                        <th class="p-3.5">เพศ / รุ่นอายุ</th>
                        <th class="p-3.5">ระดับชั้น</th>
                        <th class="p-3.5 text-center">ประเภท / จำนวนคน</th>
                        <th class="p-3.5 text-center">ทีมสมัคร</th>
                        <th class="p-3.5 pr-6 text-right">จัดการ</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php if (empty($events)): ?>
                        <tr>
                            <td colspan="7" class="p-8 text-center text-slate-400">
                                📭 ยังไม่มีรายการแข่งขันในหมวดหมู่นี้ กรุณากดปุ่ม "+ เพิ่มรายการแข่งขัน"
                            </td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($events as $ev): ?>
                            <tr class="hover:bg-slate-50/80 transition">
                                <td class="p-3.5 pl-6 font-mono">
                                    <span class="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold border border-slate-200">
                                        <?= htmlspecialchars($ev['event_code']) ?>
                                    </span>
                                    <div class="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1">
                                        <span><?= $ev['sport_icon'] ?></span>
                                        <span><?= htmlspecialchars($ev['sport_name']) ?></span>
                                    </div>
                                </td>
                                <td class="p-3.5 font-bold font-kanit text-slate-900 text-sm">
                                    <?= htmlspecialchars($ev['event_name']) ?>
                                    <div class="text-[10px] font-normal text-slate-400 mt-0.5">
                                        <?= htmlspecialchars($ev['award_type']) ?>
                                    </div>
                                </td>
                                <td class="p-3.5">
                                    <span class="px-2 py-0.5 rounded text-[10px] font-bold <?= $ev['gender'] === 'MALE' ? 'bg-blue-50 text-blue-700' : ($ev['gender'] === 'FEMALE' ? 'bg-rose-50 text-rose-700' : 'bg-purple-50 text-purple-700') ?>">
                                        <?= $ev['gender'] === 'MALE' ? 'ชาย' : ($ev['gender'] === 'FEMALE' ? 'หญิง' : 'ผสม') ?>
                                    </span>
                                    <span class="text-slate-600 block mt-1"><?= htmlspecialchars($ev['age_group']) ?></span>
                                </td>
                                <td class="p-3.5 text-slate-600">
                                    <?= htmlspecialchars($ev['grade']) ?>
                                </td>
                                <td class="p-3.5 text-center">
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-medium <?= $ev['competition_type'] === 'TEAM' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700' ?>">
                                        <?= $ev['competition_type'] === 'TEAM' ? 'ประเภททีม' : 'ประเภทเดี่ยว' ?>
                                    </span>
                                    <div class="text-[10px] text-slate-400 mt-1">
                                        <?= $ev['min_players'] ?> - <?= $ev['max_players'] ?> คน
                                    </div>
                                </td>
                                <td class="p-3.5 text-center">
                                    <span class="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700 text-[11px]">
                                        <?= $ev['reg_count'] ?> โรงเรียน
                                    </span>
                                </td>
                                <td class="p-3.5 pr-6 text-right space-x-2">
                                    <button onclick='editEvent(<?= json_encode($ev) ?>)' class="text-indigo-600 hover:text-indigo-900 font-semibold cursor-pointer">แก้ไข</button>
                                    <a href="?delete_event_id=<?= urlencode($ev['id']) ?>" onclick="return confirm('ยืนยันลบรายการ <?= addslashes($ev['event_name']) ?> หรือไม่?')" class="text-rose-600 hover:text-rose-900 font-semibold">ลบ</a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- ========================================================================= -->
<!-- Modal: เพิ่ม / แก้ไข ชนิดกีฬา -->
<!-- ========================================================================= -->
<div id="modalSport" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 id="modalSportTitle" class="font-bold font-kanit text-slate-900 text-base flex items-center gap-2">
                <span>🏅</span> เพิ่มชนิดกีฬาใหม่
            </h3>
            <button onclick="document.getElementById('modalSport').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">&times;</button>
        </div>
        <form method="POST" class="space-y-3 text-xs">
            <input type="hidden" name="action_sport" id="sportFormAction" value="add">
            <input type="hidden" name="sport_id" id="sportFormId" value="">

            <div>
                <label class="block font-bold text-slate-700 mb-1">ชื่อชนิดกีฬา <span class="text-rose-500">*</span></label>
                <input type="text" name="sport_name" id="sportFormName" required placeholder="เช่น ฟุตบอล 7 คน, วอลเลย์บอล, กรีฑา" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">อิโมจิไอคอน</label>
                    <input type="text" name="sport_icon" id="sportFormIcon" value="🏆" placeholder="⚽, 🏐, 🏃, 🏓" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-center text-base">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">หมวดหมู่</label>
                    <select name="category" id="sportFormCategory" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                        <option value="BALL_SPORTS">กีฬาประเภทลูกบอล</option>
                        <option value="ATHLETICS">กรีฑา (ลู่/ลาน)</option>
                        <option value="RACKET_SPORTS">กีฬาประเภทแร็กเกต</option>
                        <option value="TRADITIONAL">กีฬาพื้นบ้าน/ไทย</option>
                        <option value="ESPORTS">อีสปอร์ต/หมากกระดาน</option>
                        <option value="OTHER">อื่นๆ</option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block font-bold text-slate-700 mb-1">คำอธิบายเพิ่มเติม</label>
                <textarea name="description" id="sportFormDesc" rows="2" placeholder="ระเบียบกติกาหรือรายละเอียดสังเขป" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"></textarea>
            </div>

            <div class="pt-3 flex gap-2">
                <button type="button" onclick="document.getElementById('modalSport').classList.add('hidden')" class="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer">ยกเลิก</button>
                <button type="submit" class="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md cursor-pointer">บันทึกข้อมูล</button>
            </div>
        </form>
    </div>
</div>

<!-- ========================================================================= -->
<!-- Modal: เพิ่ม / แก้ไข รายการแข่งขัน -->
<!-- ========================================================================= -->
<div id="modalEvent" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 id="modalEventTitle" class="font-bold font-kanit text-slate-900 text-base flex items-center gap-2">
                <span>➕</span> เพิ่มรายการแข่งขันใหม่
            </h3>
            <button onclick="document.getElementById('modalEvent').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">&times;</button>
        </div>
        <form method="POST" class="space-y-3 text-xs">
            <input type="hidden" name="action_event" id="eventFormAction" value="add">
            <input type="hidden" name="event_id" id="eventFormId" value="">

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="sm:col-span-2">
                    <label class="block font-bold text-slate-700 mb-1">สังกัดชนิดกีฬา <span class="text-rose-500">*</span></label>
                    <select name="sport_id" id="eventFormSportId" required class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm">
                        <?php foreach ($sports as $s): ?>
                            <option value="<?= htmlspecialchars($s['id']) ?>">
                                <?= $s['sport_icon'] ?> <?= htmlspecialchars($s['sport_name']) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">รหัสรายการ</label>
                    <input type="text" name="event_code" id="eventFormCode" placeholder="เช่น FB-01" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm">
                </div>
            </div>

            <div>
                <label class="block font-bold text-slate-700 mb-1">ชื่อรายการแข่งขัน <span class="text-rose-500">*</span></label>
                <input type="text" name="event_name" id="eventFormName" required placeholder="เช่น วิ่ง 100 เมตร ชาย, ฟุตบอล 7 คน ชาย รุ่น 12 ปี" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-semibold">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">เพศ</label>
                    <select name="gender" id="eventFormGender" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                        <option value="MALE">ชาย</option>
                        <option value="FEMALE">หญิง</option>
                        <option value="MIXED">ผสม (ชาย/หญิง)</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">รุ่นอายุ</label>
                    <input type="text" name="age_group" id="eventFormAge" value="อายุไม่เกิน 12 ปี" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">ระดับชั้น</label>
                    <input type="text" name="grade" id="eventFormGrade" value="ประถมศึกษา" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">ประเภทการแข่งขัน</label>
                    <select name="competition_type" id="eventFormType" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                        <option value="TEAM">ประเภททีม</option>
                        <option value="INDIVIDUAL">ประเภทเดี่ยว</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">ผู้เล่นขั้นต่ำ (คน)</label>
                    <input type="number" name="min_players" id="eventFormMin" value="1" min="1" max="50" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">ผู้เล่นสูงสุด (คน)</label>
                    <input type="number" name="max_players" id="eventFormMax" value="12" min="1" max="50" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                </div>
            </div>

            <div>
                <label class="block font-bold text-slate-700 mb-1">รางวัลที่จะได้รับ</label>
                <input type="text" name="award_type" id="eventFormAward" value="เหรียญทอง/เงิน/ทองแดง + เกียรติบัตร" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
            </div>

            <div class="pt-3 flex gap-2">
                <button type="button" onclick="document.getElementById('modalEvent').classList.add('hidden')" class="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer">ยกเลิก</button>
                <button type="submit" class="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md cursor-pointer">บันทึกรายการ</button>
            </div>
        </form>
    </div>
</div>

<script>
function editSport(sp) {
    document.getElementById('modalSportTitle').innerText = '✏️ แก้ไขชนิดกีฬา: ' + sp.sport_name;
    document.getElementById('sportFormAction').value = 'edit';
    document.getElementById('sportFormId').value = sp.id;
    document.getElementById('sportFormName').value = sp.sport_name;
    document.getElementById('sportFormIcon').value = sp.sport_icon || '🏆';
    document.getElementById('sportFormCategory').value = sp.category || 'BALL_SPORTS';
    document.getElementById('sportFormDesc').value = sp.description || '';
    document.getElementById('modalSport').classList.remove('hidden');
}

function editEvent(ev) {
    document.getElementById('modalEventTitle').innerText = '✏️ แก้ไขรายการแข่งขัน: ' + ev.event_name;
    document.getElementById('eventFormAction').value = 'edit';
    document.getElementById('eventFormId').value = ev.id;
    document.getElementById('eventFormSportId').value = ev.sport_id;
    document.getElementById('eventFormCode').value = ev.event_code;
    document.getElementById('eventFormName').value = ev.event_name;
    document.getElementById('eventFormGender').value = ev.gender;
    document.getElementById('eventFormAge').value = ev.age_group;
    document.getElementById('eventFormGrade').value = ev.grade;
    document.getElementById('eventFormType').value = ev.competition_type;
    document.getElementById('eventFormMin').value = ev.min_players;
    document.getElementById('eventFormMax').value = ev.max_players;
    document.getElementById('eventFormAward').value = ev.award_type;
    document.getElementById('modalEvent').classList.remove('hidden');
}
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
