<?php
/**
 * ==============================================================================
 * ไฟล์: school/index.php
 * คำอธิบาย: แผงควบคุมโรงเรียน - ตรวจสอบสถานะการลงทะเบียนและนักกีฬา
 * ==============================================================================
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

requireRole(['SCHOOL', 'SUPER_ADMIN', 'ADMIN']);
$user = getCurrentUser();
$pdo = Database::getConnection();

$schoolId = $user['school_id'];
$school = $pdo->prepare("SELECT * FROM schools WHERE id = ?");
$school->execute([$schoolId]);
$schoolData = $school->fetch() ?: ['school_name' => 'โรงเรียนของคุณ'];

// ดึงจำนวนนักเรียนและรายการที่ลงทะเบียน
$studentCount = $pdo->prepare("SELECT COUNT(*) FROM students WHERE school_id = ?");
$studentCount->execute([$schoolId]);
$totalStudents = $studentCount->fetchColumn();

$regCount = $pdo->prepare("SELECT COUNT(*) FROM registrations WHERE school_id = ?");
$regCount->execute([$schoolId]);
$totalRegs = $regCount->fetchColumn();

$pageTitle = 'ระบบโรงเรียน - กลุ่มโรงเรียนสว่างสูงกระสัง';
require_once __DIR__ . '/../includes/header.php';
?>

<div class="space-y-6">
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
            <img src="<?= htmlspecialchars($schoolData['logo'] ?? '') ?>" class="w-14 h-14 rounded-2xl object-cover border">
            <div>
                <h1 class="text-xl font-bold font-kanit text-slate-900"><?= htmlspecialchars($schoolData['school_name'] ?? '') ?></h1>
                <p class="text-xs text-slate-500 font-mono">รหัส SMIS: <?= htmlspecialchars($schoolData['smis_code'] ?? '') ?></p>
            </div>
        </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-xs text-slate-500 font-medium">นักเรียนในสังกัด</p>
            <p class="text-2xl font-bold font-kanit text-slate-900 mt-1"><?= $totalStudents ?> <span class="text-xs font-normal text-slate-400">คน</span></p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-xs text-slate-500 font-medium">รายการกีฬาที่ส่งแข่งขัน</p>
            <p class="text-2xl font-bold font-kanit text-blue-600 mt-1"><?= $totalRegs ?> <span class="text-xs font-normal text-slate-400">รายการ</span></p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p class="text-xs text-slate-500 font-medium">สถานะเอกสาร</p>
            <p class="text-sm font-bold text-emerald-600 mt-2">✓ อนุมัติเรียบร้อย</p>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
