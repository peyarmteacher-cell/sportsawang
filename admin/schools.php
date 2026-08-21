<?php
/**
 * ==============================================================================
 * ไฟล์: admin/schools.php
 * คำอธิบาย: จัดการรายชื่อโรงเรียนและรีเซ็ตรหัสผ่าน SMIS ของ 12 โรงเรียน
 * ==============================================================================
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

requireRole(['SUPER_ADMIN', 'ADMIN']);
$pdo = Database::getConnection();
$message = '';

// Handle Password Reset
if (isset($_GET['reset_password_id'])) {
    $schId = $_GET['reset_password_id'];
    $defaultHash = password_hash('123456', PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("UPDATE users SET password = ?, must_change_password = 1 WHERE school_id = ?");
    $stmt->execute([$defaultHash, $schId]);
    logActivity('RESET_PASSWORD', 'SCHOOL', "รีเซ็ตรหัสผ่านโรงเรียน $schId เป็น 123456");
    $message = "รีเซ็ตรหัสผ่านของโรงเรียนเป็น 123456 เรียบร้อยแล้ว (บังคับเปลี่ยนรหัสเมื่อเข้าสู่ระบบ)";
}

$schools = $pdo->query("
    SELECT s.*, u.username AS smis_user, u.must_change_password
    FROM schools s
    LEFT JOIN users u ON s.id = u.school_id
    ORDER BY s.school_name ASC
")->fetchAll();

$pageTitle = 'จัดการรายชื่อโรงเรียนและบัญชี SMIS - Admin';
require_once __DIR__ . '/../includes/header.php';
?>

<div class="space-y-6">
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
            <h1 class="text-xl font-bold font-kanit text-slate-900 flex items-center gap-2">
                <span>🏫</span> จัดการรายชื่อโรงเรียนและบัญชีผู้ใช้งาน SMIS (<?= count($schools) ?> แห่ง)
            </h1>
            <p class="text-xs text-slate-500 mt-0.5">กลุ่มโรงเรียนสว่างสูงกระสัง &bull; Username คือรหัส SMIS, รหัสผ่านเริ่มต้นคือ 123456</p>
        </div>
        <a href="/admin/index.php" class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl">
            &larr; กลับหน้าควบคุม
        </a>
    </div>

    <?php if ($message): ?>
        <div class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <span>✅</span> <?= htmlspecialchars($message) ?>
        </div>
    <?php endif; ?>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <?php foreach ($schools as $sch): ?>
            <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div class="flex items-start gap-3">
                    <img src="<?= htmlspecialchars($sch['logo']) ?>" class="w-12 h-12 rounded-xl object-cover border shrink-0">
                    <div class="min-w-0 flex-1">
                        <h3 class="font-bold font-kanit text-slate-900 text-sm truncate"><?= htmlspecialchars($sch['school_name']) ?></h3>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                                SMIS: <?= htmlspecialchars($sch['smis_code']) ?>
                            </span>
                            <?php if ($sch['must_change_password']): ?>
                                <span class="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                                    🔒 รหัสเริ่มต้น
                                </span>
                            <?php else: ?>
                                <span class="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                                    ✓ เปลี่ยนรหัสแล้ว
                                </span>
                            <?php endif; ?>
                        </div>
                        <p class="text-xs text-slate-500 mt-2">ผอ. <?= htmlspecialchars($sch['director_name'] ?? '-') ?></p>
                        <p class="text-[11px] text-slate-400">โทร: <?= htmlspecialchars($sch['phone'] ?? '-') ?></p>
                    </div>
                </div>

                <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <a 
                        href="?reset_password_id=<?= urlencode($sch['id']) ?>" 
                        onclick="return confirm('คุณต้องการรีเซ็ตรหัสผ่านของโรงเรียน <?= addslashes($sch['school_name']) ?> กลับเป็น 123456 ใช่หรือไม่?')"
                        class="text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 font-medium transition"
                    >
                        🔄 รีเซ็ตรหัส (123456)
                    </a>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
