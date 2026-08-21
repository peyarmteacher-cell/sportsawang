<?php
/**
 * ==============================================================================
 * ไฟล์: admin/index.php
 * คำอธิบาย: แผงควบคุมหลักสำหรับ Super Admin / ผู้จัดการแข่งขัน
 * ==============================================================================
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

requireRole(['SUPER_ADMIN', 'ADMIN']);
$user = getCurrentUser();

$pdo = Database::getConnection();

// ดึงสถิติต่างๆ
$schoolCount = $pdo->query("SELECT COUNT(*) FROM schools")->fetchColumn();
$eventCount = $pdo->query("SELECT COUNT(*) FROM events")->fetchColumn();
$studentCount = $pdo->query("SELECT COUNT(*) FROM students")->fetchColumn();
$certCount = $pdo->query("SELECT COUNT(*) FROM certificates")->fetchColumn();
$recentLogs = $pdo->query("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 8")->fetchAll();

$pageTitle = 'Admin Dashboard - กลุ่มโรงเรียนสว่างสูงกระสัง';
require_once __DIR__ . '/../includes/header.php';
?>

<div class="space-y-6">
    <!-- Top Bar -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 class="text-xl font-bold font-kanit text-slate-900 flex items-center gap-2">
                <span>🛡️</span> ศูนย์ควบคุมระบบจัดการแข่งขัน (Admin Dashboard)
            </h1>
            <p class="text-xs text-slate-500 mt-0.5">
                ยินดีต้อนรับ <?= htmlspecialchars($user['full_name']) ?> (<?= $user['role'] ?>)
            </p>
        </div>
        <div class="flex items-center gap-2">
            <a href="/admin/schools.php" class="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold border border-blue-200 transition">
                🏫 จัดการโรงเรียน & SMIS
            </a>
            <a href="/admin/events.php" class="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold border border-indigo-200 transition">
                🏆 จัดการรายการกีฬา
            </a>
            <a href="/admin/certificates.php" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition">
                📜 ออกเกียรติบัตร
            </a>
        </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
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

    <!-- Activity Logs -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <h2 class="text-base font-bold font-kanit text-slate-900 flex items-center gap-2">
            <span>📋</span> ประวัติการทำรายการล่าสุด (Audit Logs)
        </h2>
        <div class="divide-y divide-slate-100 text-xs">
            <?php foreach ($recentLogs as $log): ?>
                <div class="py-2.5 flex items-center justify-between">
                    <div>
                        <span class="font-bold text-slate-800">[<?= htmlspecialchars($log['action']) ?>]</span>
                        <span class="text-slate-600 ml-1"><?= htmlspecialchars($log['details'] ?? '') ?></span>
                        <span class="text-slate-400 ml-2">โดย <?= htmlspecialchars($log['username']) ?></span>
                    </div>
                    <span class="text-slate-400 font-mono text-[11px]"><?= htmlspecialchars($log['created_at']) ?></span>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
