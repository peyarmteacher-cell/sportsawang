<?php
/**
 * ==============================================================================
 * ไฟล์: admin/index.php
 * คำอธิบาย: แผงควบคุมหลักสำหรับ Super Admin / ผู้จัดการแข่งขัน (Full Admin Console)
 * ==============================================================================
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

requireRole(['SUPER_ADMIN', 'ADMIN']);
$user = getCurrentUser();
$pdo = Database::getConnection();

// ดึงสถิติต่างๆ
$schoolCount = $pdo->query("SELECT COUNT(*) FROM schools")->fetchColumn();
$sportCount = $pdo->query("SELECT COUNT(*) FROM sports")->fetchColumn();
$eventCount = $pdo->query("SELECT COUNT(*) FROM events")->fetchColumn();
$studentCount = $pdo->query("SELECT COUNT(*) FROM students")->fetchColumn();
$coachCount = $pdo->query("SELECT COUNT(*) FROM coaches")->fetchColumn();
$regCount = $pdo->query("SELECT COUNT(*) FROM registrations")->fetchColumn();
$resultCount = $pdo->query("SELECT COUNT(*) FROM results WHERE status = 'CONFIRMED'")->fetchColumn();
$certCount = $pdo->query("SELECT COUNT(*) FROM certificates")->fetchColumn();

// ประวัติกิจกรรม
$recentLogs = $pdo->query("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 8")->fetchAll();

$pageTitle = 'Admin Dashboard - กลุ่มโรงเรียนสว่างสูงกระสัง';
require_once __DIR__ . '/../includes/header.php';
?>

<div class="space-y-6">
    <!-- Top Welcome Header -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
            <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                    <?= $user['role'] === 'SUPER_ADMIN' ? '👑 SUPER ADMIN CONSOLE' : '🛡️ ADMIN CONSOLE' ?>
                </span>
                <span class="text-xs text-slate-400 font-mono">ระบบ PHP 8.x + MySQL</span>
            </div>
            <h1 class="text-xl sm:text-2xl font-bold font-kanit text-slate-900">
                ศูนย์บริหารจัดการแข่งขันกีฬากลุ่มโรงเรียนสว่างสูงกระสัง
            </h1>
            <p class="text-xs text-slate-500">
                ผู้ดูแลระบบ: <b class="text-slate-800"><?= htmlspecialchars($user['full_name']) ?></b> (<?= htmlspecialchars($user['username']) ?>)
            </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
            <a href="/admin/settings.php" class="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5">
                <span>⚙️</span> ตั้งค่าระบบ & GAS
            </a>
            <a href="/update_database.php" target="_blank" class="px-3.5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold border border-emerald-200 transition flex items-center gap-1.5">
                <span>🔄</span> อัปเดต DB
            </a>
        </div>
    </div>

    <!-- Quick Management Modules Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. จัดการกีฬาและรายการ -->
        <a href="/admin/events.php" class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition group flex flex-col justify-between space-y-4">
            <div class="flex items-start justify-between">
                <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                    🏆
                </div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    <?= $sportCount ?> ชนิดกีฬา
                </span>
            </div>
            <div>
                <h3 class="font-bold font-kanit text-slate-900 text-base group-hover:text-indigo-600 transition">จัดการกีฬา & รายการแข่งขัน</h3>
                <p class="text-xs text-slate-400 mt-1">เพิ่ม/แก้ไข ชนิดกีฬา รุ่นอายุ ระดับชั้น และรายการแข่งขัน (<?= $eventCount ?> รายการ)</p>
            </div>
            <div class="text-xs font-bold text-indigo-600 flex items-center gap-1 pt-2 border-t border-slate-100">
                เข้าสู่หน้าจัดการกีฬา &rarr;
            </div>
        </a>

        <!-- 2. จัดการโรงเรียน & SMIS -->
        <a href="/admin/schools.php" class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition group flex flex-col justify-between space-y-4">
            <div class="flex items-start justify-between">
                <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                    🏫
                </div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    <?= $schoolCount ?> โรงเรียน
                </span>
            </div>
            <div>
                <h3 class="font-bold font-kanit text-slate-900 text-base group-hover:text-blue-600 transition">จัดการโรงเรียน & SMIS</h3>
                <p class="text-xs text-slate-400 mt-1">ข้อมูลสถานศึกษา 12 แห่ง และรีเซ็ตรหัสผ่านเริ่มต้น (123456)</p>
            </div>
            <div class="text-xs font-bold text-blue-600 flex items-center gap-1 pt-2 border-t border-slate-100">
                เข้าสู่ระบบโรงเรียน &rarr;
            </div>
        </a>

        <!-- 3. จัดการและออกเกียรติบัตร -->
        <a href="/admin/certificates.php" class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md transition group flex flex-col justify-between space-y-4">
            <div class="flex items-start justify-between">
                <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                    📜
                </div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                    <?= $certCount ?> ฉบับ
                </span>
            </div>
            <div>
                <h3 class="font-bold font-kanit text-slate-900 text-base group-hover:text-amber-600 transition">ออกเกียรติบัตร E-Certificate</h3>
                <p class="text-xs text-slate-400 mt-1">สร้างเกียรติบัตรพร้อม QR Code สแกนตรวจสอบ และจัดเก็บลง Google Drive</p>
            </div>
            <div class="text-xs font-bold text-amber-600 flex items-center gap-1 pt-2 border-t border-slate-100">
                จัดการเกียรติบัตร &rarr;
            </div>
        </a>

        <!-- 4. ตั้งค่าระบบ & GAS Integration -->
        <a href="/admin/settings.php" class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition group flex flex-col justify-between space-y-4">
            <div class="flex items-start justify-between">
                <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                    ☁️
                </div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Google Drive / GAS
                </span>
            </div>
            <div>
                <h3 class="font-bold font-kanit text-slate-900 text-base group-hover:text-slate-900 transition">ตั้งค่าระบบ & Google GAS</h3>
                <p class="text-xs text-slate-400 mt-1">เชื่อมต่อ Web App URL, โฟลเดอร์ Drive, แม่แบบ Google Slides</p>
            </div>
            <div class="text-xs font-bold text-slate-700 flex items-center gap-1 pt-2 border-t border-slate-100">
                เปิดหน้าตั้งค่า &rarr;
            </div>
        </a>
    </div>

    <!-- Stats Summary Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-xs text-slate-500 font-medium">โรงเรียนในกลุ่ม</p>
            <p class="text-2xl font-bold font-kanit text-slate-900 mt-1"><?= $schoolCount ?> <span class="text-xs font-normal text-slate-400">แห่ง</span></p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-xs text-slate-500 font-medium">รายการแข่งขัน</p>
            <p class="text-2xl font-bold font-kanit text-blue-600 mt-1"><?= $eventCount ?> <span class="text-xs font-normal text-slate-400">รายการ</span></p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-xs text-slate-500 font-medium">นักเรียน/นักกีฬา</p>
            <p class="text-2xl font-bold font-kanit text-emerald-600 mt-1"><?= $studentCount ?> <span class="text-xs font-normal text-slate-400">คน</span></p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-xs text-slate-500 font-medium">เกียรติบัตรที่ออกแล้ว</p>
            <p class="text-2xl font-bold font-kanit text-amber-600 mt-1"><?= $certCount ?> <span class="text-xs font-normal text-slate-400">ใบ</span></p>
        </div>
    </div>

    <!-- Audit Logs -->
    <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 class="text-sm font-bold font-kanit text-slate-900 flex items-center gap-2">
                <span>📋</span> บันทึกกิจกรรมของระบบ (Audit Activity Logs)
            </h2>
            <span class="text-[11px] text-slate-400">8 รายการล่าสุด</span>
        </div>
        <div class="divide-y divide-slate-100 text-xs">
            <?php if (empty($recentLogs)): ?>
                <p class="py-4 text-center text-slate-400">ยังไม่มีประวัติกิจกรรมในระบบ</p>
            <?php else: ?>
                <?php foreach ($recentLogs as $log): ?>
                    <div class="py-2.5 flex items-center justify-between">
                        <div>
                            <span class="font-bold text-slate-800 font-mono">[<?= htmlspecialchars($log['action']) ?>]</span>
                            <span class="text-slate-600 ml-1"><?= htmlspecialchars($log['details'] ?? '') ?></span>
                            <span class="text-slate-400 ml-2">โดย <?= htmlspecialchars($log['username']) ?></span>
                        </div>
                        <span class="text-slate-400 font-mono text-[11px]"><?= htmlspecialchars($log['created_at']) ?></span>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
