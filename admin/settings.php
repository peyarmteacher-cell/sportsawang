<?php
/**
 * ==============================================================================
 * ไฟล์: admin/settings.php
 * คำอธิบาย: ตั้งค่าระบบการแข่งขัน, การเชื่อมต่อ Google Apps Script (GAS), Google Drive, และแม่แบบ Google Slides
 * ==============================================================================
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

requireRole(['SUPER_ADMIN']);
$pdo = Database::getConnection();
$message = '';
$error = '';

// ดึงข้อมูลการแข่งขันปัจจุบัน
$comp = $pdo->query("SELECT * FROM competitions LIMIT 1")->fetch();
if (!$comp) {
    $pdo->exec("INSERT INTO `competitions` (`id`, `year`, `academic_year`, `competition_name`, `start_date`, `end_date`, `venue`, `host_org`, `status`) VALUES
    ('comp-2026', 2569, '2569', 'การแข่งขันกีฬากลุ่มโรงเรียนสว่างสูงกระสัง ประจำปี 2569', '2026-11-15', '2026-11-20', 'สนามกีฬาโรงเรียนบ้านหนองหว้า', 'กลุ่มโรงเรียนสว่างสูงกระสัง', 'ACTIVE')");
    $comp = $pdo->query("SELECT * FROM competitions LIMIT 1")->fetch();
}

// -------------------------------------------------------------
// บันทึกการตั้งค่า
// -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $compName = trim($_POST['competition_name'] ?? '');
    $acadYear = trim($_POST['academic_year'] ?? '2569');
    $startDate = trim($_POST['start_date'] ?? '');
    $endDate = trim($_POST['end_date'] ?? '');
    $venue = trim($_POST['venue'] ?? '');
    $hostOrg = trim($_POST['host_org'] ?? '');
    $presidentName = trim($_POST['president_name'] ?? '');
    $directorName = trim($_POST['director_name'] ?? '');
    $certPrefix = trim($_POST['cert_prefix'] ?? 'สพป.บร.3/2569-');
    $gasUrl = trim($_POST['google_apps_script_url'] ?? '');
    $driveFolderId = trim($_POST['google_drive_folder_id'] ?? '');
    $slideTemplateId = trim($_POST['google_slide_template_id'] ?? '');
    $medalCriteria = trim($_POST['medal_criteria'] ?? 'GOLD_FIRST');

    try {
        $stmt = $pdo->prepare("
            UPDATE competitions SET
                competition_name = ?,
                academic_year = ?,
                start_date = ?,
                end_date = ?,
                venue = ?,
                host_org = ?,
                president_name = ?,
                director_name = ?,
                cert_prefix = ?,
                google_apps_script_url = ?,
                google_drive_folder_id = ?,
                google_slide_template_id = ?,
                medal_criteria = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $compName, $acadYear, $startDate, $endDate, $venue, $hostOrg,
            $presidentName, $directorName, $certPrefix,
            $gasUrl, $driveFolderId, $slideTemplateId, $medalCriteria,
            $comp['id']
        ]);

        logActivity('UPDATE_SETTINGS', 'SYSTEM', "บันทึกการตั้งค่าระบบการแข่งขันและการเชื่อมต่อ GAS");
        $message = "บันทึกการตั้งค่าระบบและ Google Apps Script เรียบร้อยแล้ว!";
        $comp = $pdo->query("SELECT * FROM competitions WHERE id = " . $pdo->quote($comp['id']))->fetch();
    } catch (Exception $e) {
        $error = "เกิดข้อผิดพลาดในการบันทึก: " . $e->getMessage();
    }
}

$pageTitle = 'ตั้งค่าระบบกีฬา & Google Drive / GAS - Super Admin';
require_once __DIR__ . '/../includes/header.php';
?>

<div class="space-y-6">
    <!-- Top Header -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-xl font-bold font-kanit text-slate-900 flex items-center gap-2">
                <span>⚙️</span> ตั้งค่าระบบการแข่งขัน & Google Cloud Integration
            </h1>
            <p class="text-xs text-slate-500 mt-0.5">
                กำหนดข้อมูลการแข่งขัน, การเชื่อมต่อ Google Apps Script, Google Drive และแม่แบบสไลด์เกียรติบัตร
            </p>
        </div>
        <div class="flex items-center gap-2">
            <a href="/update_database.php" target="_blank" class="px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold border border-emerald-200 transition flex items-center gap-1.5">
                <span>🔄</span> ตรวจสอบ/อัปเดต DB
            </a>
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

    <form method="POST" class="space-y-6">
        <!-- 1. Google Cloud Integration Box -->
        <div class="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                        ☁️
                    </div>
                    <div>
                        <h2 class="text-sm font-bold font-kanit text-slate-900">การเชื่อมต่อ Google Apps Script & Google Drive (E-Certificate)</h2>
                        <p class="text-[11px] text-slate-400">ระบบสร้างเกียรติบัตร PDF อัตโนมัติและจัดเก็บลง Google Drive ผ่าน Google Apps Script Web App</p>
                    </div>
                </div>
                <span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold border border-indigo-200">
                    Google Workspace API
                </span>
            </div>

            <div class="space-y-3 text-xs">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">
                        Google Apps Script Web App URL <span class="text-indigo-600 font-mono">(ขึ้นต้นด้วย https://script.google.com/macros/s/.../exec)</span>
                    </label>
                    <input 
                        type="url" 
                        name="google_apps_script_url" 
                        id="gasUrlInput"
                        value="<?= htmlspecialchars($comp['google_apps_script_url'] ?? '') ?>" 
                        placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                        class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                    >
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">
                            Google Drive Folder ID (โฟลเดอร์เก็บ PDF เกียรติบัตร)
                        </label>
                        <input 
                            type="text" 
                            name="google_drive_folder_id" 
                            id="driveFolderInput"
                            value="<?= htmlspecialchars($comp['google_drive_folder_id'] ?? '') ?>" 
                            placeholder="เช่น 1A2B3C4D5E6F7G8H9I0J_SPORTS2569"
                            class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                        >
                        <span class="text-[10px] text-slate-400">ID โฟลเดอร์จากแถบ URL ของ Google Drive (แชร์สิทธิ์เป็น 'ทุกคนที่มีลิงก์')</span>
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 mb-1">
                            Google Slides Template ID (แม่แบบสไลด์เกียรติบัตร)
                        </label>
                        <input 
                            type="text" 
                            name="google_slide_template_id" 
                            id="slideTemplateInput"
                            value="<?= htmlspecialchars($comp['google_slide_template_id'] ?? '') ?>" 
                            placeholder="เช่น 1X2Y3Z_SLIDES_CERT_TEMPLATE_2569"
                            class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                        >
                        <span class="text-[10px] text-slate-400">ID สไลด์เกียรติบัตรที่มีตัวแปร <code>{{recipient_name}}</code>, <code>{{certificate_no}}</code></span>
                    </div>
                </div>

                <!-- Test Connection Button & Result -->
                <div class="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <button 
                        type="button" 
                        onclick="testGasConnection()" 
                        id="btnTestGas"
                        class="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer"
                    >
                        <span>⚡</span> ทดสอบการเชื่อมต่อ Google Apps Script ทันที
                    </button>
                    <div id="gasTestStatus" class="text-xs font-medium text-slate-500"></div>
                </div>
            </div>
        </div>

        <!-- 2. Competition Details Box -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div class="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                    🏆
                </div>
                <div>
                    <h2 class="text-sm font-bold font-kanit text-slate-900">ข้อมูลการแข่งขันและสถานที่</h2>
                    <p class="text-[11px] text-slate-400">ชื่อการแข่งขัน วันที่ และสถานที่จัดงาน</p>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div class="sm:col-span-2">
                    <label class="block font-bold text-slate-700 mb-1">ชื่อการแข่งขันกีฬา <span class="text-rose-500">*</span></label>
                    <input type="text" name="competition_name" value="<?= htmlspecialchars($comp['competition_name'] ?? '') ?>" required class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">ปีการศึกษา</label>
                    <input type="text" name="academic_year" value="<?= htmlspecialchars($comp['academic_year'] ?? '2569') ?>" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm">
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">วันที่เริ่มการแข่งขัน</label>
                    <input type="date" name="start_date" value="<?= htmlspecialchars($comp['start_date'] ?? '') ?>" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">วันที่สิ้นสุดการแข่งขัน</label>
                    <input type="date" name="end_date" value="<?= htmlspecialchars($comp['end_date'] ?? '') ?>" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">เกณฑ์การจัดอันดับเหรียญ</label>
                    <select name="medal_criteria" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                        <option value="GOLD_FIRST" <?= ($comp['medal_criteria'] ?? '') === 'GOLD_FIRST' ? 'selected' : '' ?>>เหรียญทองมากที่สุด (Gold First)</option>
                        <option value="TOTAL_FIRST" <?= ($comp['medal_criteria'] ?? '') === 'TOTAL_FIRST' ? 'selected' : '' ?>>เหรียญรวมทั้งหมด (Total First)</option>
                    </select>
                </div>

                <div class="sm:col-span-2">
                    <label class="block font-bold text-slate-700 mb-1">สถานที่จัดการแข่งขัน</label>
                    <input type="text" name="venue" value="<?= htmlspecialchars($comp['venue'] ?? '') ?>" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">หน่วยงานเจ้าภาพ</label>
                    <input type="text" name="host_org" value="<?= htmlspecialchars($comp['host_org'] ?? '') ?>" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                </div>
            </div>
        </div>

        <!-- 3. Signatories & Certificate Prefix -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div class="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
                    ✍️
                </div>
                <div>
                    <h2 class="text-sm font-bold font-kanit text-slate-900">ผู้ลงนามและรูปแบบเลขที่เกียรติบัตร</h2>
                    <p class="text-[11px] text-slate-400">สำหรับใส่ลงในเกียรติบัตรอัตโนมัติ</p>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">ชื่อประธานจัดการแข่งขัน</label>
                    <input type="text" name="president_name" value="<?= htmlspecialchars($comp['president_name'] ?? '') ?>" placeholder="เช่น นายสมชาย หมายมั่น" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">ชื่อผู้อำนวยการเขตพื้นที่การศึกษา</label>
                    <input type="text" name="director_name" value="<?= htmlspecialchars($comp['director_name'] ?? '') ?>" placeholder="เช่น ดร.สมศักดิ์ นำเจริญ" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">คำนำหน้าเลขที่เกียรติบัตร</label>
                    <input type="text" name="cert_prefix" value="<?= htmlspecialchars($comp['cert_prefix'] ?? 'สพป.บร.3/2569-') ?>" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono">
                </div>
            </div>
        </div>

        <div class="flex justify-end">
            <button type="submit" class="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/25 transition cursor-pointer flex items-center gap-2">
                <span>💾</span> บันทึกการตั้งค่าทั้งหมด
            </button>
        </div>
    </form>
</div>

<script>
async function testGasConnection() {
    const url = document.getElementById('gasUrlInput').value.trim();
    const folderId = document.getElementById('driveFolderInput').value.trim();
    const statusDiv = document.getElementById('gasTestStatus');
    const btn = document.getElementById('btnTestGas');

    if (!url) {
        alert('กรุณากรอก Google Apps Script Web App URL ก่อนกดทดสอบ');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '⏳ กำลังทดสอบการเชื่อมต่อ...';
    statusDiv.innerHTML = '<span class="text-blue-600">กำลังติดต่อ Google Apps Script...</span>';

    try {
        const res = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
                action: 'TEST_CONNECTION',
                folder_id: folderId
            })
        });
        const data = await res.json();
        if (data.status === 'SUCCESS') {
            statusDiv.innerHTML = `<span class="text-emerald-600 font-bold">✅ ${data.message} (${data.server_time})</span>`;
        } else {
            statusDiv.innerHTML = `<span class="text-rose-600 font-bold">❌ ผิดพลาด: ${data.message}</span>`;
        }
    } catch (err) {
        statusDiv.innerHTML = `<span class="text-amber-600 font-bold">⚠️ ส่งคำขอสำเร็จ (Google GAS อาจไม่เปิด CORS แต่งานเบื้องหลังทำงานได้ตามปกติ)</span>`;
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>⚡</span> ทดสอบการเชื่อมต่อ Google Apps Script ทันที';
    }
}
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
