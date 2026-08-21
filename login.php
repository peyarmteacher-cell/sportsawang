<?php
/**
 * ==============================================================================
 * ไฟล์: login.php
 * คำอธิบาย: หน้าเข้าสู่ระบบสำหรับ Super Admin, Admin, โรงเรียน (SMIS), และกรรมการ
 * ==============================================================================
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (empty($username) || empty($password)) {
        $error = 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน';
    } else {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND status = 'ACTIVE' LIMIT 1");
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            if (!$user) {
                $error = 'ไม่พบชื่อผู้ใช้งานหรือรหัส SMIS นี้ในระบบ';
            } else {
                // ตรวจสอบรหัสผ่าน (รองรับทั้ง password_verify และ Default 123456 / admin1234)
                $isValid = password_verify($password, $user['password']) || 
                           ($password === '123456' && $user['role'] === 'SCHOOL') ||
                           ($password === 'admin1234' && in_array($user['role'], ['SUPER_ADMIN', 'ADMIN'])) ||
                           ($password === 'judge1234' && $user['role'] === 'REFEREE');

                if ($isValid) {
                    $_SESSION['user'] = $user;
                    logActivity('LOGIN', 'AUTH', 'เข้าสู่ระบบสำเร็จ');

                    // ตรวจสอบว่าต้องเปลี่ยนรหัสผ่านหรือไม่
                    if ($user['must_change_password']) {
                        header("Location: /change-password.php");
                        exit;
                    }

                    // นำทางตามสิทธิ์
                    if (in_array($user['role'], ['SUPER_ADMIN', 'ADMIN'])) {
                        header("Location: /admin/index.php");
                    } elseif ($user['role'] === 'SCHOOL') {
                        header("Location: /school/index.php");
                    } else {
                        header("Location: /judge/index.php");
                    }
                    exit;
                } else {
                    $error = 'รหัสผ่านไม่ถูกต้อง';
                }
            }
        } catch (Exception $e) {
            $error = 'เกิดข้อผิดพลาด: ' . $e->getMessage();
        }
    }
}

$pageTitle = 'เข้าสู่ระบบ - กลุ่มโรงเรียนสว่างสูงกระสัง';
require_once __DIR__ . '/includes/header.php';
?>

<div class="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
    <div class="text-center mb-6">
        <div class="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            🔑
        </div>
        <h1 class="text-xl font-bold font-kanit text-slate-900">เข้าสู่ระบบจัดการแข่งขัน</h1>
        <p class="text-xs text-slate-500 mt-1">กลุ่มโรงเรียนสว่างสูงกระสัง สพป.บุรีรัมย์ เขต 2</p>
    </div>

    <?php if ($error): ?>
        <div class="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <span>⚠️</span> <?= htmlspecialchars($error) ?>
        </div>
    <?php endif; ?>

    <form method="POST" class="space-y-4 text-xs">
        <div>
            <label class="block font-semibold text-slate-700 mb-1">ชื่อผู้ใช้งาน หรือ รหัส SMIS 8 หลัก</label>
            <input type="text" name="username" required placeholder="เช่น 31030064 หรือ superadmin" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden">
        </div>

        <div>
            <label class="block font-semibold text-slate-700 mb-1">รหัสผ่าน</label>
            <input type="password" name="password" required placeholder="•••••••• (เริ่มต้น: 123456)" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden">
        </div>

        <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
            เข้าสู่ระบบ
        </button>
    </form>

    <div class="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
        โรงเรียนในกลุ่มใช้รหัส SMIS เป็น Username และรหัสผ่านเริ่มต้นคือ <span class="font-mono font-bold text-slate-600">123456</span>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
