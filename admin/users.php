<?php
/**
 * ==============================================================================
 * ไฟล์: admin/users.php
 * คำอธิบาย: จัดการบัญชีผู้ใช้งานระบบ (User Accounts Management)
 * ==============================================================================
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

requireRole(['SUPER_ADMIN', 'ADMIN']);
$pdo = Database::getConnection();
$message = '';
$error = '';

// Handle Password Reset to 123456
if (isset($_GET['reset_id'])) {
    $userId = $_GET['reset_id'];
    $defaultHash = password_hash('123456', PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("UPDATE users SET password = ?, must_change_password = 1 WHERE id = ?");
    $stmt->execute([$defaultHash, $userId]);
    logActivity('RESET_USER_PASS', 'USERS', "รีเซ็ตรหัสผ่าน User ID $userId เป็น 123456");
    $message = "รีเซ็ตรหัสผ่านของผู้ใช้งานเป็น 123456 เรียบร้อยแล้ว (ระบบจะบังคับเปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบ)";
}

// Handle Add / Edit User
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_user'])) {
    $username = trim($_POST['username'] ?? '');
    $fullName = trim($_POST['full_name'] ?? '');
    $role = trim($_POST['role'] ?? 'SCHOOL');
    $schoolId = trim($_POST['school_id'] ?? '') ?: null;
    $password = trim($_POST['password'] ?? '123456');

    if ($username && $fullName) {
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $newId = 'user-' . uniqid();
        try {
            $email = $username . '@sawang.ac.th';
            $stmt = $pdo->prepare("INSERT INTO users (id, school_id, username, password, full_name, email, role, status, must_change_password) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 1)");
            $stmt->execute([$newId, $schoolId, $username, $hash, $fullName, $email, $role]);
            logActivity('ADD_USER', 'USERS', "เพิ่มผู้ใช้งาน: $username ($fullName)");
            $message = "เพิ่มผู้ใช้งาน \"$username\" เรียบร้อยแล้ว (รหัสผ่าน: $password)";
        } catch (Exception $e) {
            $error = "ไม่สามารถเพิ่มผู้ใช้งานได้: " . $e->getMessage();
        }
    }
}

$users = $pdo->query("
    SELECT u.*, s.school_name
    FROM users u
    LEFT JOIN schools s ON u.school_id = s.id
    ORDER BY u.role ASC, u.username ASC
")->fetchAll();

$schools = $pdo->query("SELECT id, school_name FROM schools ORDER BY school_name ASC")->fetchAll();

$pageTitle = 'จัดการบัญชีผู้ใช้งาน - Admin Console';
require_once __DIR__ . '/../includes/header.php';
?>

<div class="space-y-6">
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-xl font-bold font-kanit text-slate-900 flex items-center gap-2">
                <span>👥</span> จัดการบัญชีผู้ใช้งานระบบ (User Accounts)
            </h1>
            <p class="text-xs text-slate-500 mt-0.5">
                บัญชีผู้ดูแลระบบ (Admin) และบัญชีตัวแทน 12 โรงเรียน (Username = SMIS)
            </p>
        </div>
        <div class="flex items-center gap-2">
            <button onclick="document.getElementById('modalAddUser').classList.remove('hidden')" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer">
                <span>➕</span> เพิ่มผู้ใช้งานใหม่
            </button>
            <a href="/admin/index.php" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition">
                &larr; กลับหน้าหลัก
            </a>
        </div>
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

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                    <tr>
                        <th class="p-3.5 pl-6">Username (SMIS)</th>
                        <th class="p-3.5">ชื่อ-นามสกุล / สังกัด</th>
                        <th class="p-3.5">สิทธิ์ผู้ใช้งาน (Role)</th>
                        <th class="p-3.5 text-center">สถานะรหัสผ่าน</th>
                        <th class="p-3.5 pr-6 text-right">จัดการ</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php foreach ($users as $u): ?>
                        <tr class="hover:bg-slate-50/80 transition">
                            <td class="p-3.5 pl-6 font-mono font-bold text-slate-900">
                                <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                                    <?= htmlspecialchars($u['username']) ?>
                                </span>
                            </td>
                            <td class="p-3.5 font-medium text-slate-800">
                                <div class="font-bold font-kanit text-slate-900"><?= htmlspecialchars($u['full_name']) ?></div>
                                <div class="text-[11px] text-slate-400"><?= htmlspecialchars($u['school_name'] ?? 'ศูนย์กลาง / คณะกรรมการ') ?></div>
                            </td>
                            <td class="p-3.5">
                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold <?= $u['role'] === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-900' : ($u['role'] === 'ADMIN' ? 'bg-blue-100 text-blue-900' : 'bg-emerald-100 text-emerald-900') ?>">
                                    <?= $u['role'] ?>
                                </span>
                            </td>
                            <td class="p-3.5 text-center">
                                <?php if ($u['must_change_password']): ?>
                                    <span class="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                                        🔒 รหัสตั้งต้น (123456)
                                    </span>
                                <?php else: ?>
                                    <span class="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                                        ✓ เปลี่ยนรหัสผ่านแล้ว
                                    </span>
                                <?php endif; ?>
                            </td>
                            <td class="p-3.5 pr-6 text-right">
                                <a 
                                    href="?reset_id=<?= urlencode($u['id']) ?>" 
                                    onclick="return confirm('ต้องการรีเซ็ตรหัสผ่านของ <?= addslashes($u['username']) ?> เป็น 123456 ใช่หรือไม่?')"
                                    class="text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 font-medium transition"
                                >
                                    🔄 รีเซ็ตรหัส (123456)
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Modal เพิ่มผู้ใช้งาน -->
<div id="modalAddUser" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="font-bold font-kanit text-slate-900 text-base flex items-center gap-2">
                <span>👤</span> เพิ่มผู้ใช้งานใหม่
            </h3>
            <button onclick="document.getElementById('modalAddUser').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">&times;</button>
        </div>
        <form method="POST" class="space-y-3 text-xs">
            <input type="hidden" name="action_user" value="add">

            <div>
                <label class="block font-bold text-slate-700 mb-1">ชื่อผู้ใช้งาน (Username) <span class="text-rose-500">*</span></label>
                <input type="text" name="username" required placeholder="เช่น admin_referee หรือรหัส SMIS" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm">
            </div>

            <div>
                <label class="block font-bold text-slate-700 mb-1">ชื่อ-นามสกุล <span class="text-rose-500">*</span></label>
                <input type="text" name="full_name" required placeholder="เช่น อาจารย์ประสิทธิ์ ชัยชนะ" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">สิทธิ์ (Role)</label>
                    <select name="role" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                        <option value="SCHOOL">SCHOOL (โรงเรียน)</option>
                        <option value="ADMIN">ADMIN (กรรมการ)</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN (ประธาน)</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">รหัสผ่านเริ่มต้น</label>
                    <input type="text" name="password" value="123456" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm">
                </div>
            </div>

            <div>
                <label class="block font-bold text-slate-700 mb-1">สังกัดโรงเรียน (ถ้ามี)</label>
                <select name="school_id" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                    <option value="">-- ไม่ระบุ (ส่วนกลาง) --</option>
                    <?php foreach ($schools as $s): ?>
                        <option value="<?= $s['id'] ?>"><?= htmlspecialchars($s['school_name']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="pt-3 flex gap-2">
                <button type="button" onclick="document.getElementById('modalAddUser').classList.add('hidden')" class="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer">ยกเลิก</button>
                <button type="submit" class="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md cursor-pointer">บันทึก</button>
            </div>
        </form>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
