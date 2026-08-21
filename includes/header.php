<?php
/**
 * ==============================================================================
 * ไฟล์: includes/header.php
 * คำอธิบาย: ส่วนหัว Navbar และ Assets พื้นฐาน (Tailwind + Google Fonts)
 * ==============================================================================
 */
require_once __DIR__ . '/auth.php';
$user = getCurrentUser();
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?? 'ระบบบริหารจัดการแข่งขันกีฬากลุ่มโรงเรียนสว่างสูงกระสัง' ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;600;700&family=Prompt:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Prompt', sans-serif; }
        h1, h2, h3, h4, h5, .font-kanit { font-family: 'Kanit', sans-serif; }
    </style>
</head>
<body class="bg-slate-100 min-h-screen text-slate-800 flex flex-col justify-between">
    <!-- Navbar -->
    <nav class="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <!-- Logo & Brand -->
                <div class="flex items-center gap-3">
                    <a href="/index.php" class="flex items-center gap-2">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-lg shadow-sm">
                            🏆
                        </div>
                        <div>
                            <span class="font-bold text-base font-kanit tracking-wide block leading-tight">กลุ่มโรงเรียนสว่างสูงกระสัง</span>
                            <span class="text-[10px] text-blue-400 block font-normal">สพป.บุรีรัมย์ เขต 2 &bull; ประจำปี 2569</span>
                        </div>
                    </a>
                </div>

                <!-- Nav Links -->
                <div class="flex items-center gap-4 text-xs font-medium">
                    <a href="/index.php" class="hover:text-blue-400 transition">หน้าหลัก/สรุปเหรียญ</a>
                    <a href="/verify.php" class="hover:text-blue-400 transition">ตรวจสอบเกียรติบัตร QR</a>

                    <?php if ($user): ?>
                        <?php if (in_array($user['role'], ['SUPER_ADMIN', 'ADMIN'])): ?>
                            <a href="/admin/index.php" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold transition">Admin Console</a>
                        <?php elseif ($user['role'] === 'SCHOOL'): ?>
                            <a href="/school/index.php" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-bold transition">ระบบโรงเรียน</a>
                        <?php elseif ($user['role'] === 'REFEREE'): ?>
                            <a href="/judge/index.php" class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-bold transition">บันทึกคะแนน</a>
                        <?php endif; ?>

                        <div class="flex items-center gap-2 pl-3 border-l border-slate-700">
                            <span class="text-slate-300"><?= htmlspecialchars($user['full_name']) ?></span>
                            <a href="/logout.php" class="text-rose-400 hover:text-rose-300 font-semibold">ออกจากระบบ</a>
                        </div>
                    <?php else: ?>
                        <a href="/login.php" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold shadow-sm transition">
                            เข้าสู่ระบบ
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </nav>
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
