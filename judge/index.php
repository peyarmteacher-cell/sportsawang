<?php
/**
 * ==============================================================================
 * ไฟล์: judge/index.php
 * คำอธิบาย: ระบบบันทึกผลการแข่งขันและคะแนนสำหรับกรรมการผู้ตัดสิน
 * ==============================================================================
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

requireRole(['REFEREE', 'SUPER_ADMIN', 'ADMIN']);
$user = getCurrentUser();
$pdo = Database::getConnection();

$message = '';
$events = $pdo->query("SELECT e.*, s.sport_name FROM events e JOIN sports s ON e.sport_id = s.id ORDER BY e.event_code ASC")->fetchAll();
$schools = $pdo->query("SELECT * FROM schools ORDER BY school_name ASC")->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $eventId = $_POST['event_id'];
    $schoolId = $_POST['school_id'];
    $rank = (int)$_POST['rank'];
    $medal = $_POST['medal'];
    $score = $_POST['score'] ?? '';
    $award = $_POST['award'] ?? 'ชนะเลิศเหรียญทอง';

    try {
        $stmt = $pdo->prepare("
            INSERT INTO results (id, competition_id, event_id, school_id, rank, award, medal, score, recorded_by, status)
            VALUES (?, 'comp-2026', ?, ?, ?, ?, ?, ?, ?, 'OFFICIAL')
        ");
        $stmt->execute([
            'res-' . uniqid(),
            $eventId,
            $schoolId,
            $rank,
            $award,
            $medal,
            $score,
            $user['full_name']
        ]);
        logActivity('RECORD_RESULT', 'JUDGE', "บันทึกผลการแข่งขัน Event $eventId อันดับ $rank");
        $message = "บันทึกผลการแข่งขันสำเร็จและอัปเดตตารางเหรียญรางวัลแล้ว!";
    } catch (Exception $e) {
        $message = "เกิดข้อผิดพลาด: " . $e->getMessage();
    }
}

$pageTitle = 'บันทึกผลการแข่งขัน - กรรมการผู้ตัดสิน';
require_once __DIR__ . '/../includes/header.php';
?>

<div class="max-w-2xl mx-auto space-y-6">
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h1 class="text-xl font-bold font-kanit text-slate-900 flex items-center gap-2">
            <span>⚖️</span> บันทึกผลการแข่งขัน (Referee Scoring Portal)
        </h1>
        <p class="text-xs text-slate-500 mt-1">บันทึกผลการแข่งขัน คะแนน และเหรียญรางวัล เพื่อสรุปเหรียญแบบ Real-time</p>
    </div>

    <?php if ($message): ?>
        <div class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl">
            <?= htmlspecialchars($message) ?>
        </div>
    <?php endif; ?>

    <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <form method="POST" class="space-y-4 text-xs">
            <div>
                <label class="block font-semibold text-slate-700 mb-1">รายการแข่งขัน (Event)</label>
                <select name="event_id" required class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm">
                    <?php foreach ($events as $ev): ?>
                        <option value="<?= htmlspecialchars($ev['id']) ?>">
                            [<?= htmlspecialchars($ev['sport_name']) ?>] <?= htmlspecialchars($ev['event_name']) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div>
                <label class="block font-semibold text-slate-700 mb-1">โรงเรียนผู้ได้รับรางวัล</label>
                <select name="school_id" required class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm">
                    <?php foreach ($schools as $sch): ?>
                        <option value="<?= htmlspecialchars($sch['id']) ?>">
                            <?= htmlspecialchars($sch['school_name']) ?> (SMIS: <?= htmlspecialchars($sch['smis_code']) ?>)
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">อันดับ (Rank)</label>
                    <select name="rank" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm">
                        <option value="1">อันดับ 1 (ชนะเลิศ)</option>
                        <option value="2">อันดับ 2 (รองชนะเลิศอันดับ 1)</option>
                        <option value="3">อันดับ 3 (รองชนะเลิศอันดับ 2)</option>
                        <option value="4">อันดับ 4 (ชมเชย)</option>
                    </select>
                </div>
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">เหรียญรางวัล</label>
                    <select name="medal" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm">
                        <option value="GOLD">🥇 เหรียญทอง (GOLD)</option>
                        <option value="SILVER">🥈 เหรียญเงิน (SILVER)</option>
                        <option value="BRONZE">🥉 เหรียญทองแดง (BRONZE)</option>
                        <option value="NONE">ไม่มีเหรียญ (เข้าร่วม)</option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block font-semibold text-slate-700 mb-1">ชื่อรางวัล / ข้อความบนเกียรติบัตร</label>
                <input type="text" name="award" value="ชนะเลิศเหรียญทอง" required class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm">
            </div>

            <div>
                <label class="block font-semibold text-slate-700 mb-1">คะแนน / สถิติ (ถ้ามี)</label>
                <input type="text" name="score" placeholder="เช่น 3 - 1 หรือ 11.24 วินาที" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm">
            </div>

            <button type="submit" class="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-purple-600/20">
                บันทึกผลการแข่งขันและส่งมอบคะแนน
            </button>
        </form>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
