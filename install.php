<?php
/**
 * ==============================================================================
 * ไฟล์: install.php
 * คำอธิบาย: ตัวติดตั้งฐานข้อมูลอัตโนมัติผ่านหน้าเว็บ (Web Auto-Installer)
 * รันไฟล์นี้ผ่านเบราว์เซอร์: http://localhost/install.php
 * ==============================================================================
 */

require_once __DIR__ . '/config/database.php';

$message = '';
$status = 'READY';
$details = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST' || isset($_GET['auto'])) {
    try {
        $pdo = null;
        // 1. ลองเชื่อมต่อ Database ที่ระบุโดยตรงก่อน (รองรับ Shared Hosting เช่น cPanel / DirectAdmin / Plesk)
        try {
            $pdo = new PDO("mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
            $details[] = "✅ เชื่อมต่อไปยังฐานข้อมูล `" . DB_NAME . "` สำเร็จ";
        } catch (PDOException $e) {
            // 2. หากยังไม่มี Database และผู้ใช้มีสิทธิ์ Root/Admin ให้ลองสร้าง Database
            $rootDsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=utf8mb4";
            $pdo = new PDO($rootDsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
            $pdo->exec("USE `" . DB_NAME . "`;");
            $details[] = "✅ ตรวจสอบ/สร้างฐานข้อมูล `" . DB_NAME . "` สำเร็จ";
        }

        // 3. รันคำสั่ง SQL จาก database.sql
        $sqlPath = __DIR__ . '/database.sql';
        if (!file_exists($sqlPath)) {
            throw new Exception("ไม่พบไฟล์ database.sql ในไดเรกทอรี " . __DIR__);
        }

        $sqlContent = file_get_contents($sqlPath);
        $pdo->exec($sqlContent);
        $details[] = "✅ ติดตั้งโครงสร้างตาราง (13 ตาราง) และข้อมูลนำเข้าโรงเรียนกลุ่มสว่างสูงกระสัง 12 แห่งเรียบร้อยแล้ว";

        $status = 'SUCCESS';
        $message = 'ระบบติดตั้งฐานข้อมูล MySQL สมบูรณ์ 100% พร้อมใช้งานทันที!';
    } catch (Exception $e) {
        $status = 'ERROR';
        $message = 'เกิดข้อผิดพลาดในการติดตั้ง: ' . $e->getMessage();
        $details[] = "❌ " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ติดตั้งระบบฐานข้อมูล MySQL - กลุ่มโรงเรียนสว่างสูงกระสัง</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;600;700&family=Prompt:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Prompt', sans-serif; }
        h1, h2, h3, h4, .font-kanit { font-family: 'Kanit', sans-serif; }
    </style>
</head>
<body class="bg-slate-100 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 text-center">
            <div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
            </div>
            <h1 class="text-xl font-bold font-kanit">ติดตั้งระบบฐานข้อมูลกีฬาอัตโนมัติ</h1>
            <p class="text-xs text-blue-100 mt-1">กลุ่มโรงเรียนสว่างสูงกระสัง สพป.บุรีรัมย์ เขต 2 (PHP 8.x + MySQL)</p>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-5">
            <!-- Server Config Info -->
            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
                <div class="font-bold text-slate-700 flex items-center justify-between border-b pb-2">
                    <span>การตั้งค่าเชื่อมต่อ (จาก config/database.php):</span>
                    <span class="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">PDO Driver</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-slate-600">
                    <div><b>Host:</b> <?= htmlspecialchars(DB_HOST) ?>:<?= htmlspecialchars(DB_PORT) ?></div>
                    <div><b>Database:</b> <?= htmlspecialchars(DB_NAME) ?></div>
                    <div><b>User:</b> <?= htmlspecialchars(DB_USER) ?></div>
                    <div><b>Charset:</b> <?= htmlspecialchars(DB_CHARSET) ?></div>
                </div>
            </div>

            <?php if ($status === 'SUCCESS'): ?>
                <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl space-y-2">
                    <div class="flex items-center gap-2 font-bold text-sm">
                        <svg class="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <span><?= $message ?></span>
                    </div>
                    <div class="text-xs space-y-1 pl-7 text-emerald-700">
                        <?php foreach ($details as $d): ?>
                            <div><?= $d ?></div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div class="pt-2">
                    <a href="index.php" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20">
                        เข้าสู่หน้าหลักของระบบ (index.php) &rarr;
                    </a>
                </div>
            <?php elseif ($status === 'ERROR'): ?>
                <div class="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl space-y-2">
                    <div class="flex items-center gap-2 font-bold text-sm">
                        <span>⚠️ <?= $message ?></span>
                    </div>
                    <p class="text-xs text-rose-600">กรุณาตรวจสอบว่า Service MySQL เปิดอยู่ และค่า User/Password ในไฟล์ <code>config/database.php</code> ถูกต้อง</p>
                </div>

                <form method="POST">
                    <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2">
                        ลองติดตั้งใหม่อีกครั้ง
                    </button>
                </form>
            <?php else: ?>
                <div class="text-xs text-slate-600 space-y-2">
                    <p class="font-semibold text-slate-800">รายการที่จะดำเนินการเมื่อกดติดตั้ง:</p>
                    <ul class="list-disc pl-5 space-y-1 text-slate-500">
                        <li>สร้าง Database <code class="bg-slate-100 px-1 rounded"><?= DB_NAME ?></code> (Collation: utf8mb4_unicode_ci)</li>
                        <li>สร้างตารางทั้งหมด 13 ตาราง (Competitions, Schools, Users, Events, Results ฯลฯ)</li>
                        <li>นำเข้าข้อมูลโรงเรียนในกลุ่มสว่างสูงกระสังทั้ง 12 แห่ง</li>
                        <li>สร้างบัญชีผู้ใช้งาน SMIS (รหัสเริ่มต้น: <code class="font-bold text-blue-600">123456</code>)</li>
                    </ul>
                </div>

                <form method="POST" class="pt-2">
                    <button type="submit" class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2">
                        <span>🚀</span> เริ่มการติดตั้งฐานข้อมูลอัตโนมัติทันที
                    </button>
                </form>
            <?php endif; ?>
        </div>

        <div class="bg-slate-50 p-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            ระบบบริหารจัดการแข่งขันกีฬา &bull; รองรับ PHP 8.x / MySQL 8.x / MariaDB
        </div>
    </div>
</body>
</html>
