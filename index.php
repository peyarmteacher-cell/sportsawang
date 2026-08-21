<?php
/**
 * ==============================================================================
 * ไฟล์: index.php
 * คำอธิบาย: หน้าแรก Public Portal แสดงสรุปเหรียญรางวัล ผลการแข่งขัน และทำเนียบสถานศึกษา
 * ==============================================================================
 */
require_once __DIR__ . '/config/database.php';
$pageTitle = 'สรุปผลการแข่งขันและตารางเหรียญรางวัล - กลุ่มโรงเรียนสว่างสูงกระสัง';

try {
    $pdo = Database::getConnection();

    // 1. ดึงข้อมูลการแข่งขัน
    $comp = $pdo->query("SELECT * FROM competitions WHERE status != 'ARCHIVED' LIMIT 1")->fetch() ?: [
        'competition_name' => 'การแข่งขันกีฬากลุ่มโรงเรียนสว่างสูงกระสัง 2569',
        'venue' => 'สนามกีฬาโรงเรียนบ้านหนองหว้า',
        'start_date' => '2026-11-15',
        'end_date' => '2026-11-20'
    ];

    // 2. ดึงตารางสรุปเหรียญรางวัล 12 โรงเรียน
    $medalSql = "
        SELECT 
            s.id,
            s.school_name,
            s.short_name,
            s.logo,
            s.smis_code,
            s.director_name,
            s.phone,
            COALESCE(SUM(CASE WHEN r.medal = 'GOLD' THEN 1 ELSE 0 END), 0) AS gold_count,
            COALESCE(SUM(CASE WHEN r.medal = 'SILVER' THEN 1 ELSE 0 END), 0) AS silver_count,
            COALESCE(SUM(CASE WHEN r.medal = 'BRONZE' THEN 1 ELSE 0 END), 0) AS bronze_count,
            (COALESCE(SUM(CASE WHEN r.medal = 'GOLD' THEN 1 ELSE 0 END), 0) * 5 +
             COALESCE(SUM(CASE WHEN r.medal = 'SILVER' THEN 1 ELSE 0 END), 0) * 3 +
             COALESCE(SUM(CASE WHEN r.medal = 'BRONZE' THEN 1 ELSE 0 END), 0) * 1) AS total_points,
            COUNT(r.id) AS total_medals
        FROM schools s
        LEFT JOIN results r ON s.id = r.school_id AND r.status = 'OFFICIAL'
        GROUP BY s.id
        ORDER BY gold_count DESC, silver_count DESC, bronze_count DESC, total_points DESC, s.school_name ASC
    ";
    $standings = $pdo->query($medalSql)->fetchAll();

    // 3. ดึงรายการกีฬา
    $sports = $pdo->query("SELECT * FROM sports WHERE status = 'ACTIVE'")->fetchAll();

    // 4. ดึงผลการแข่งขันล่าสุด 6 รายการ
    $recentResults = $pdo->query("
        SELECT e.id as event_id, e.event_name, e.event_code, sp.sport_name, sp.sport_icon,
               MAX(CASE WHEN r.medal = 'GOLD' THEN sch.school_name END) as gold_school,
               MAX(CASE WHEN r.medal = 'SILVER' THEN sch.school_name END) as silver_school,
               MAX(CASE WHEN r.medal = 'BRONZE' THEN sch.school_name END) as bronze_school,
               MAX(r.score) as score,
               MAX(r.recorded_at) as recorded_at
        FROM events e
        JOIN sports sp ON e.sport_id = sp.id
        JOIN results r ON e.id = r.event_id AND r.status = 'OFFICIAL'
        JOIN schools sch ON r.school_id = sch.id
        GROUP BY e.id, e.event_name, e.event_code, sp.sport_name, sp.sport_icon
        ORDER BY recorded_at DESC
        LIMIT 6
    ")->fetchAll();

} catch (Exception $e) {
    header("Location: /install.php");
    exit;
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="space-y-8">
    <!-- Hero Banner -->
    <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div class="relative z-10 max-w-3xl space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-md text-amber-300">
                <span>🏆 ประจำปีการศึกษา 2569</span>
                <span>&bull;</span>
                <span><?= count($standings) ?> โรงเรียนเข้าร่วม</span>
                <span>&bull;</span>
                <span class="text-emerald-300">● สรุปผล Real-time</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-bold font-kanit leading-tight">
                <?= htmlspecialchars($comp['competition_name']) ?>
            </h1>
            <p class="text-xs sm:text-sm text-slate-300">
                📍 สถานที่: <?= htmlspecialchars($comp['venue']) ?> | 🗓️ วันที่: <?= htmlspecialchars($comp['start_date']) ?> ถึง <?= htmlspecialchars($comp['end_date']) ?>
            </p>
        </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl font-bold">🥇</div>
            <div>
                <p class="text-xs text-slate-500">เหรียญทองทั้งหมด</p>
                <p class="text-xl font-bold font-kanit text-slate-900"><?= array_sum(array_column($standings, 'gold_count')) ?></p>
            </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center text-xl font-bold">🥈</div>
            <div>
                <p class="text-xs text-slate-500">เหรียญเงินทั้งหมด</p>
                <p class="text-xl font-bold font-kanit text-slate-900"><?= array_sum(array_column($standings, 'silver_count')) ?></p>
            </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-xl font-bold">🥉</div>
            <div>
                <p class="text-xs text-slate-500">เหรียญทองแดง</p>
                <p class="text-xl font-bold font-kanit text-slate-900"><?= array_sum(array_column($standings, 'bronze_count')) ?></p>
            </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">🏫</div>
            <div>
                <p class="text-xs text-slate-500">โรงเรียนในกลุ่ม</p>
                <p class="text-xl font-bold font-kanit text-slate-900"><?= count($standings) ?> แห่ง</p>
            </div>
        </div>
    </div>

    <!-- Medal Standings Table -->
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
                <h2 class="text-lg font-bold font-kanit text-slate-900">ตารางสรุปเหรียญรางวัลรวม (Official Medal Tally)</h2>
                <p class="text-xs text-slate-500">เรียงตามจำนวนเหรียญทอง &gt; เหรียญเงิน &gt; เหรียญทองแดง &gt; คะแนนรวม (คลิก "ดูรายละเอียด" เพื่อดูผลงานและรายชื่อนักกีฬา)</p>
            </div>
            <span class="text-xs font-mono bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold self-start sm:self-auto flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Updates
            </span>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                    <tr>
                        <th class="py-3.5 px-4 text-center w-16">อันดับ</th>
                        <th class="py-3.5 px-4">โรงเรียน</th>
                        <th class="py-3.5 px-4 text-center text-amber-600">🥇 ทอง</th>
                        <th class="py-3.5 px-4 text-center text-slate-500">🥈 เงิน</th>
                        <th class="py-3.5 px-4 text-center text-orange-600">🥉 ทองแดง</th>
                        <th class="py-3.5 px-4 text-center font-bold">รวมเหรียญ</th>
                        <th class="py-3.5 px-4 text-center text-blue-600 font-bold">คะแนนรวม</th>
                        <th class="py-3.5 px-4 text-center">รายละเอียด</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php foreach ($standings as $index => $sch): ?>
                        <tr class="hover:bg-slate-50/80 transition">
                            <td class="py-3.5 px-4 text-center font-bold text-slate-700">
                                <?php if ($index === 0): ?>
                                    <span class="w-7 h-7 bg-amber-400 text-amber-950 rounded-full inline-flex items-center justify-center font-bold shadow-xs">1</span>
                                <?php elseif ($index === 1): ?>
                                    <span class="w-7 h-7 bg-slate-300 text-slate-900 rounded-full inline-flex items-center justify-center font-bold shadow-xs">2</span>
                                <?php elseif ($index === 2): ?>
                                    <span class="w-7 h-7 bg-amber-700 text-white rounded-full inline-flex items-center justify-center font-bold shadow-xs">3</span>
                                <?php else: ?>
                                    <span class="text-slate-500 font-semibold"><?= $index + 1 ?></span>
                                <?php endif; ?>
                            </td>
                            <td class="py-3.5 px-4">
                                <div class="flex items-center gap-3">
                                    <img src="<?= htmlspecialchars($sch['logo'] ?: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150') ?>" alt="" class="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0">
                                    <div>
                                        <div class="font-bold text-slate-900 text-sm"><?= htmlspecialchars($sch['school_name']) ?></div>
                                        <div class="text-[11px] font-mono text-slate-400">SMIS: <?= htmlspecialchars($sch['smis_code']) ?></div>
                                    </div>
                                </div>
                            </td>
                            <td class="py-3.5 px-4 text-center font-bold text-amber-600 text-sm bg-amber-50/30"><?= $sch['gold_count'] ?></td>
                            <td class="py-3.5 px-4 text-center font-bold text-slate-600 text-sm bg-slate-50/50"><?= $sch['silver_count'] ?></td>
                            <td class="py-3.5 px-4 text-center font-bold text-orange-700 text-sm bg-orange-50/30"><?= $sch['bronze_count'] ?></td>
                            <td class="py-3.5 px-4 text-center font-bold text-slate-900 text-sm"><?= $sch['total_medals'] ?></td>
                            <td class="py-3.5 px-4 text-center font-bold text-blue-700 text-sm bg-blue-50/40"><?= $sch['total_points'] ?></td>
                            <td class="py-3.5 px-4 text-center">
                                <a 
                                    href="/school_detail.php?id=<?= urlencode($sch['id']) ?>" 
                                    class="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 font-semibold text-xs rounded-xl border border-blue-200 transition shadow-2xs"
                                >
                                    <span>🔍</span> ดูรายละเอียด
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Recent Official Results Section -->
    <?php if (!empty($recentResults)): ?>
        <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 class="text-lg font-bold font-kanit text-slate-900 flex items-center gap-2">
                    <span>⚡</span> ผลการแข่งขันอย่างเป็นทางการล่าสุด
                </h2>
                <span class="text-xs text-slate-400">6 รายการล่าสุด</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <?php foreach ($recentResults as $res): ?>
                    <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition shadow-2xs space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-indigo-700 flex items-center gap-1">
                                <span><?= $res['sport_icon'] ?></span> <?= htmlspecialchars($res['sport_name']) ?>
                            </span>
                            <span class="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border"><?= htmlspecialchars($res['event_code']) ?></span>
                        </div>
                        <h4 class="font-bold font-kanit text-slate-900 text-sm leading-snug"><?= htmlspecialchars($res['event_name']) ?></h4>
                        
                        <div class="pt-2 border-t border-slate-200/60 space-y-1 text-xs">
                            <div class="flex items-center justify-between">
                                <span class="text-amber-800 font-medium">🥇 ทอง:</span>
                                <span class="font-bold text-slate-900 truncate"><?= htmlspecialchars($res['gold_school'] ?: '-') ?></span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-slate-600 font-medium">🥈 เงิน:</span>
                                <span class="text-slate-800 truncate"><?= htmlspecialchars($res['silver_school'] ?: '-') ?></span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-orange-800 font-medium">🥉 ทองแดง:</span>
                                <span class="text-slate-800 truncate"><?= htmlspecialchars($res['bronze_school'] ?: '-') ?></span>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    <?php endif; ?>

    <!-- Schools Directory Cards -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
                <h2 class="text-lg font-bold font-kanit text-slate-900 flex items-center gap-2">
                    <span>🏫</span> ทำเนียบสถานศึกษา กลุ่มโรงเรียนสว่างสูงกระสัง (<?= count($standings) ?> แห่ง)
                </h2>
                <p class="text-xs text-slate-500">คลิกที่โรงเรียนเพื่อดูสรุปผลงาน รายชื่อผู้ฝึกสอน และนักกีฬาที่ได้รับรางวัล</p>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <?php foreach ($standings as $s): ?>
                <div class="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between space-y-3">
                    <div class="flex items-start gap-3">
                        <img 
                            src="<?= htmlspecialchars($s['logo'] ?: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150') ?>" 
                            class="w-12 h-12 rounded-xl object-cover border shrink-0 shadow-2xs"
                        >
                        <div class="min-w-0 flex-1">
                            <h4 class="font-bold font-kanit text-slate-900 text-sm leading-snug truncate"><?= htmlspecialchars($s['school_name']) ?></h4>
                            <span class="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 mt-1 inline-block">
                                SMIS: <?= htmlspecialchars($s['smis_code']) ?>
                            </span>
                        </div>
                    </div>

                    <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        <div class="flex items-center gap-1.5 text-slate-700 font-semibold">
                            <span>🥇 <?= $s['gold_count'] ?></span>
                            <span>🥈 <?= $s['silver_count'] ?></span>
                            <span>🥉 <?= $s['bronze_count'] ?></span>
                        </div>
                        <a 
                            href="/school_detail.php?id=<?= urlencode($s['id']) ?>" 
                            class="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5"
                        >
                            ผลงาน &rarr;
                        </a>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Sports List -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
        <h2 class="text-lg font-bold font-kanit text-slate-900 flex items-center gap-2">
            <span>🏅</span> ชนิดกีฬาที่เปิดแข่งขันทั้งหมด
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <?php foreach ($sports as $sp): ?>
                <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 transition shadow-2xs">
                    <h3 class="font-bold text-slate-900 font-kanit text-sm flex items-center gap-1.5">
                        <span><?= $sp['sport_icon'] ?: '🏆' ?></span>
                        <span><?= htmlspecialchars($sp['sport_name']) ?></span>
                    </h3>
                    <p class="text-xs text-slate-500 mt-1"><?= htmlspecialchars($sp['description'] ?? '') ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
