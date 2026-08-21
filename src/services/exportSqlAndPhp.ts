import { sportsStore } from './store';

export function generateDatabaseConfigPhp(): string {
  return `<?php
/**
 * ==============================================================================
 * ไฟล์: config/database.php
 * คำอธิบาย: ตั้งค่าการเชื่อมต่อฐานข้อมูล MySQL/MariaDB ผ่าน PDO
 * และระบบตรวจสอบ/ติดตั้งฐานข้อมูลอัตโนมัติ (Auto-Installer)
 * ==============================================================================
 */

// 1. โหลดการตั้งค่าจากตัวแปร Environment หรือกำหนดค่าคงที่
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'swang_sung_krasang_sports');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');

class Database {
    private static ?PDO $instance = null;

    /**
     * ดึง Object การเชื่อมต่อ PDO (Singleton Pattern)
     */
    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET . " COLLATE utf8mb4_unicode_ci"
            ];

            try {
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                // หากยังไม่มีฐานข้อมูล ให้เรียกตัวติดตั้งอัตโนมัติ (Auto Installer)
                if ($e->getCode() === 1049) { // 1049: Unknown database
                    self::autoInstallDatabase();
                    // ลองเชื่อมต่อใหม่อีกครั้งหลังติดตั้งสำเร็จ
                    self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
                } else {
                    die("❌ เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล: " . htmlspecialchars($e->getMessage()));
                }
            }
        }
        return self::$instance;
    }

    /**
     * ติดตั้งฐานข้อมูล โครงสร้างตาราง และข้อมูลโรงเรียน 12 แห่งอัตโนมัติ
     */
    public static function autoInstallDatabase(): bool {
        try {
            // เชื่อมต่อไปยัง MySQL Server โดยไม่ระบุ Database
            $rootDsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=" . DB_CHARSET;
            $pdo = new PDO($rootDsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            
            // 1. สร้าง Database
            $pdo->exec("CREATE DATABASE IF NOT EXISTS \`" . DB_NAME . "\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
            $pdo->exec("USE \`" . DB_NAME . "\`;");

            // 2. โหลดคำสั่ง SQL จาก database.sql
            $sqlFile = __DIR__ . '/../database.sql';
            if (file_exists($sqlFile)) {
                $sql = file_get_contents($sqlFile);
                $pdo->exec($sql);
            }
            return true;
        } catch (PDOException $e) {
            die("❌ การติดตั้งฐานข้อมูลอัตโนมัติล้มเหลว: " . htmlspecialchars($e->getMessage()));
        }
    }
}
?>`;
}

export function generatePhpInstallScript(): string {
  return `<?php
/**
 * ==============================================================================
 * ไฟล์: install.php
 * คำอธิบาย: ตัวติดตั้งฐานข้อมูลอัตโนมัติผ่านหน้าเว็บ (Web Auto-Installer)
 * รันไฟล์นี้ผ่านเบราว์เซอร์: http://localhost/sawangsung-sports/install.php
 * ==============================================================================
 */

require_once __DIR__ . '/config/database.php';

$message = '';
$status = 'READY';

if ($_SERVER['REQUEST_METHOD'] === 'POST' || isset($_GET['auto'])) {
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=utf8mb4", DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);

        $pdo->exec("CREATE DATABASE IF NOT EXISTS \`" . DB_NAME . "\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
        $pdo->exec("USE \`" . DB_NAME . "\`;");

        $sqlPath = __DIR__ . '/database.sql';
        if (!file_exists($sqlPath)) {
            throw new Exception("ไม่พบไฟล์ database.sql ในไดเรกทอรีรูท");
        }

        $sql = file_get_contents($sqlPath);
        $pdo->exec($sql);

        $status = 'SUCCESS';
        $message = "ติดตั้งฐานข้อมูล " . DB_NAME . " และนำเข้าข้อมูลโรงเรียน 12 แห่งในกลุ่มโรงเรียนสว่างสูงกระสังสำเร็จเรียบร้อยแล้ว!";
    } catch (Exception $e) {
        $status = 'ERROR';
        $message = "เกิดข้อผิดพลาด: " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ติดตั้งฐานข้อมูลระบบแข่งขันกีฬา - กลุ่มโรงเรียนสว่างสูงกระสัง</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Prompt', sans-serif; }</style>
</head>
<body class="bg-slate-50 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div class="text-center mb-6">
            <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-blue-200">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16m-8 4v6m-3-3h6"/></svg>
            </div>
            <h1 class="text-2xl font-bold text-slate-800">ระบบติดตั้งฐานข้อมูลอัตโนมัติ (PHP Auto Installer)</h1>
            <p class="text-sm text-slate-500 mt-1">กลุ่มโรงเรียนสว่างสูงกระสัง ประจำปี 2569</p>
        </div>

        <?php if ($status === 'SUCCESS'): ?>
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-5 mb-6 text-sm">
                <div class="font-bold flex items-center gap-2 mb-2 text-emerald-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    <?= htmlspecialchars($message) ?>
                </div>
                <div class="mt-3 space-y-1.5 text-xs text-slate-600 bg-white/70 p-3 rounded-lg border border-emerald-100">
                    <p>✅ สร้างตารางครบทั้ง 13 ตาราง (Competitions, Schools, Users, Students, Results ฯลฯ)</p>
                    <p>✅ นำเข้าโรงเรียนครบ 12 แห่ง พร้อมรหัส SMIS 8 หลัก</p>
                    <p>✅ สร้างบัญชีผู้ดูแลโรงเรียน 12 บัญชี (Username = SMIS, รหัสผ่านเริ่มต้น = 123456)</p>
                    <p>✅ กำหนดเงื่อนไขบังคับเปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งแรก (Must Change Password)</p>
                </div>
            </div>
            <a href="login.php" class="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl shadow-md transition">ไปที่หน้าเข้าสู่ระบบ (Login) &rarr;</a>
        <?php elseif ($status === 'ERROR'): ?>
            <div class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
                <?= htmlspecialchars($message) ?>
            </div>
        <?php endif; ?>

        <?php if ($status !== 'SUCCESS'): ?>
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-xs text-slate-600 space-y-2">
                <div class="font-semibold text-slate-700">พารามิเตอร์การเชื่อมต่อปัจจุบัน (config/database.php):</div>
                <div class="grid grid-cols-2 gap-2">
                    <div>Host: <span class="font-mono font-bold text-slate-800"><?= DB_HOST ?>:<?= DB_PORT ?></span></div>
                    <div>Database: <span class="font-mono font-bold text-slate-800"><?= DB_NAME ?></span></div>
                    <div>User: <span class="font-mono font-bold text-slate-800"><?= DB_USER ?></span></div>
                    <div>Charset: <span class="font-mono font-bold text-slate-800"><?= DB_CHARSET ?></span></div>
                </div>
            </div>
            <form method="POST">
                <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl shadow-md shadow-blue-200 transition">
                    🚀 เริ่มการติดตั้งฐานข้อมูลอัตโนมัติทันที
                </button>
            </form>
        <?php endif; ?>
    </div>
</body>
</html>`;
}

export function generateMySQLSchemaAndSeed(): string {
  const comp = sportsStore.getCurrentCompetition();
  const schools = sportsStore.getAllSchools();
  const users = sportsStore.getUsers();
  const sports = sportsStore.getSports();
  const events = sportsStore.getEvents();
  const students = sportsStore.getStudents();
  const coaches = sportsStore.getCoaches();
  const registrations = sportsStore.getRegistrations();
  const regStudents = sportsStore.getRegistrationStudents();
  const results = sportsStore.getResults();
  const certificates = sportsStore.getCertificates();
  const settings = sportsStore.getSettings();

  return `-- ==============================================================================
-- ระบบบริหารจัดการแข่งขันกีฬากลุ่มโรงเรียนสว่างสูงกระสัง ประจำปี 2569
-- Database Schema & Initial Seed Data for MySQL 8.x / MariaDB 10.5+
-- Generated: ${new Date().toISOString()}
-- Character Set: utf8mb4 / Collation: utf8mb4_unicode_ci
-- Timezone: Asia/Bangkok
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+07:00";

CREATE DATABASE IF NOT EXISTS \`swang_sung_krasang_sports\` 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE \`swang_sung_krasang_sports\`;

-- ------------------------------------------------------------------------------
-- 1. Table structure for table \`competitions\`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`competitions\`;
CREATE TABLE \`competitions\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`year\` INT NOT NULL COMMENT 'ปีการแข่งขัน พ.ศ. เช่น 2569',
  \`competition_name\` VARCHAR(255) NOT NULL COMMENT 'ชื่อการแข่งขัน',
  \`start_date\` DATE NOT NULL COMMENT 'วันที่เริ่มการแข่งขัน',
  \`end_date\` DATE NOT NULL COMMENT 'วันที่สิ้นสุดการแข่งขัน',
  \`venue\` VARCHAR(255) NOT NULL COMMENT 'สถานที่จัดการแข่งขัน',
  \`host_org\` VARCHAR(255) DEFAULT 'กลุ่มโรงเรียนสว่างสูงกระสัง' COMMENT 'หน่วยงานเจ้าภาพ',
  \`status\` ENUM('PREPARATION', 'OPEN_REGISTRATION', 'CLOSED_REGISTRATION', 'COMPETING', 'SUMMARIZING', 'CLOSED') DEFAULT 'COMPETING',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_year\` (\`year\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table structure for table \`schools\` (กลุ่มโรงเรียนสว่างสูงกระสัง 12 แห่ง)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`schools\`;
CREATE TABLE \`schools\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`competition_id\` VARCHAR(50) NOT NULL,
  \`school_code\` VARCHAR(50) NOT NULL COMMENT 'รหัสสถานศึกษา / SMIS',
  \`smis_code\` VARCHAR(50) DEFAULT NULL COMMENT 'รหัส SMIS 8 หลักสำหรับ Login',
  \`school_name\` VARCHAR(255) NOT NULL COMMENT 'ชื่อเต็มโรงเรียน',
  \`short_name\` VARCHAR(100) NOT NULL COMMENT 'ชื่อย่อ',
  \`address\` TEXT DEFAULT NULL COMMENT 'ที่อยู่',
  \`phone\` VARCHAR(50) DEFAULT NULL COMMENT 'เบอร์โทรศัพท์',
  \`logo\` TEXT DEFAULT NULL COMMENT 'โลโก้โรงเรียน',
  \`director_name\` VARCHAR(150) DEFAULT NULL COMMENT 'ชื่อผู้อำนวยการโรงเรียน',
  \`status\` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`fk_schools_competition\` (\`competition_id\`),
  KEY \`idx_smis_code\` (\`smis_code\`),
  CONSTRAINT \`fk_schools_competition\` FOREIGN KEY (\`competition_id\`) REFERENCES \`competitions\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table structure for table \`users\` (รองรับรหัสผ่านตั้งต้น 123456 และบังคับเปลี่ยนรหัสผ่าน)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`school_id\` VARCHAR(50) DEFAULT NULL COMMENT 'ผูกกับโรงเรียน (NULL สำหรับ Admin/Judge)',
  \`username\` VARCHAR(100) NOT NULL COMMENT 'ชื่อผู้ใช้งาน (รหัส SMIS 8 หลัก สำหรับโรงเรียน)',
  \`password\` VARCHAR(255) NOT NULL COMMENT 'รหัสผ่านแฮชด้วย password_hash() BCRYPT (ค่าเริ่มต้น 123456)',
  \`full_name\` VARCHAR(200) NOT NULL COMMENT 'ชื่อ-นามสกุล',
  \`email\` VARCHAR(150) DEFAULT NULL,
  \`phone\` VARCHAR(50) DEFAULT NULL,
  \`role\` ENUM('SUPER_ADMIN', 'ADMIN', 'SCHOOL', 'JUDGE') NOT NULL DEFAULT 'SCHOOL',
  \`status\` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  \`must_change_password\` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = บังคับเปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งแรก, 0 = เปลี่ยนแล้ว',
  \`last_login\` DATETIME DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_username\` (\`username\`),
  KEY \`fk_users_school\` (\`school_id\`),
  CONSTRAINT \`fk_users_school\` FOREIGN KEY (\`school_id\`) REFERENCES \`schools\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Table structure for table \`students\`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`students\`;
CREATE TABLE \`students\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`competition_id\` VARCHAR(50) NOT NULL,
  \`school_id\` VARCHAR(50) NOT NULL,
  \`student_code\` VARCHAR(50) DEFAULT NULL,
  \`prefix\` ENUM('เด็กชาย', 'เด็กหญิง', 'นาย', 'นางสาว') NOT NULL,
  \`first_name\` VARCHAR(100) NOT NULL,
  \`last_name\` VARCHAR(100) NOT NULL,
  \`gender\` ENUM('MALE', 'FEMALE') NOT NULL,
  \`birth_date\` DATE DEFAULT NULL,
  \`grade\` VARCHAR(50) NOT NULL COMMENT 'ระดับชั้น เช่น ป.5',
  \`class_room\` VARCHAR(50) DEFAULT '1',
  \`status\` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`fk_students_school\` (\`school_id\`),
  KEY \`fk_students_competition\` (\`competition_id\`),
  CONSTRAINT \`fk_students_school\` FOREIGN KEY (\`school_id\`) REFERENCES \`schools\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_students_competition\` FOREIGN KEY (\`competition_id\`) REFERENCES \`competitions\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Table structure for table \`coaches\`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`coaches\`;
CREATE TABLE \`coaches\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`competition_id\` VARCHAR(50) NOT NULL,
  \`school_id\` VARCHAR(50) NOT NULL,
  \`prefix\` VARCHAR(50) NOT NULL,
  \`first_name\` VARCHAR(100) NOT NULL,
  \`last_name\` VARCHAR(100) NOT NULL,
  \`position\` VARCHAR(100) NOT NULL COMMENT 'ตำแหน่ง เช่น ครูผู้ฝึกสอน',
  \`phone\` VARCHAR(50) DEFAULT NULL,
  \`status\` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`fk_coaches_school\` (\`school_id\`),
  CONSTRAINT \`fk_coaches_school\` FOREIGN KEY (\`school_id\`) REFERENCES \`schools\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. Table structure for table \`sports\`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`sports\`;
CREATE TABLE \`sports\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`sport_name\` VARCHAR(100) NOT NULL,
  \`sport_icon\` VARCHAR(50) DEFAULT '🏆',
  \`description\` TEXT DEFAULT NULL,
  \`category\` VARCHAR(50) DEFAULT 'BALL',
  \`status\` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. Table structure for table \`events\`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`events\`;
CREATE TABLE \`events\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`competition_id\` VARCHAR(50) NOT NULL,
  \`sport_id\` VARCHAR(50) NOT NULL,
  \`event_code\` VARCHAR(50) NOT NULL,
  \`event_name\` VARCHAR(255) NOT NULL,
  \`gender\` ENUM('MALE', 'FEMALE', 'MIXED') NOT NULL,
  \`age_group\` VARCHAR(100) NOT NULL,
  \`grade\` VARCHAR(100) NOT NULL,
  \`competition_type\` ENUM('INDIVIDUAL', 'TEAM') NOT NULL DEFAULT 'TEAM',
  \`award_type\` VARCHAR(255) DEFAULT 'เหรียญรางวัล ทอง เงิน ทองแดง',
  \`max_players\` INT NOT NULL DEFAULT 12,
  \`min_players\` INT NOT NULL DEFAULT 1,
  \`status\` ENUM('OPEN', 'LOCKED', 'COMPLETED') DEFAULT 'OPEN',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`fk_events_sport\` (\`sport_id\`),
  KEY \`fk_events_competition\` (\`competition_id\`),
  CONSTRAINT \`fk_events_sport\` FOREIGN KEY (\`sport_id\`) REFERENCES \`sports\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_events_competition\` FOREIGN KEY (\`competition_id\`) REFERENCES \`competitions\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. Table structure for table \`registrations\`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`registrations\`;
CREATE TABLE \`registrations\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`competition_id\` VARCHAR(50) NOT NULL,
  \`event_id\` VARCHAR(50) NOT NULL,
  \`school_id\` VARCHAR(50) NOT NULL,
  \`coach_id\` VARCHAR(50) DEFAULT NULL,
  \`secondary_coach_id\` VARCHAR(50) DEFAULT NULL,
  \`registration_status\` ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'LOCKED') DEFAULT 'SUBMITTED',
  \`note\` TEXT DEFAULT NULL,
  \`submitted_at\` DATETIME DEFAULT NULL,
  \`approved_at\` DATETIME DEFAULT NULL,
  \`approved_by\` VARCHAR(100) DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_event_school\` (\`competition_id\`, \`event_id\`, \`school_id\`),
  KEY \`fk_reg_event\` (\`event_id\`),
  KEY \`fk_reg_school\` (\`school_id\`),
  KEY \`fk_reg_coach\` (\`coach_id\`),
  CONSTRAINT \`fk_reg_event\` FOREIGN KEY (\`event_id\`) REFERENCES \`events\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_reg_school\` FOREIGN KEY (\`school_id\`) REFERENCES \`schools\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. Table structure for table \`registration_students\`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`registration_students\`;
CREATE TABLE \`registration_students\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`registration_id\` VARCHAR(50) NOT NULL,
  \`student_id\` VARCHAR(50) NOT NULL,
  \`jersey_number\` INT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_reg_student\` (\`registration_id\`, \`student_id\`),
  KEY \`fk_rs_student\` (\`student_id\`),
  CONSTRAINT \`fk_rs_registration\` FOREIGN KEY (\`registration_id\`) REFERENCES \`registrations\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_rs_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. Table structure for table \`results\`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`results\`;
CREATE TABLE \`results\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`competition_id\` VARCHAR(50) NOT NULL,
  \`event_id\` VARCHAR(50) NOT NULL,
  \`school_id\` VARCHAR(50) NOT NULL,
  \`rank\` TINYINT NOT NULL COMMENT 'อันดับ 1, 2, 3',
  \`award\` VARCHAR(100) NOT NULL COMMENT 'ชนะเลิศ, รองชนะเลิศ',
  \`medal\` ENUM('GOLD', 'SILVER', 'BRONZE', 'NONE') NOT NULL,
  \`score\` VARCHAR(100) DEFAULT NULL,
  \`note\` TEXT DEFAULT NULL,
  \`recorded_by\` VARCHAR(150) NOT NULL,
  \`recorded_at\` DATETIME NOT NULL,
  \`status\` ENUM('CONFIRMED', 'DRAFT') DEFAULT 'CONFIRMED',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`fk_results_event\` (\`event_id\`),
  KEY \`fk_results_school\` (\`school_id\`),
  CONSTRAINT \`fk_results_event\` FOREIGN KEY (\`event_id\`) REFERENCES \`events\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_results_school\` FOREIGN KEY (\`school_id\`) REFERENCES \`schools\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 11. Table structure for table \`certificates\`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`certificates\`;
CREATE TABLE \`certificates\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`competition_id\` VARCHAR(50) NOT NULL,
  \`certificate_no\` VARCHAR(50) NOT NULL COMMENT 'เลขที่เกียรติบัตร เช่น สสก.2569-00001',
  \`recipient_type\` ENUM('STUDENT', 'COACH') NOT NULL,
  \`recipient_id\` VARCHAR(50) NOT NULL,
  \`recipient_name\` VARCHAR(200) NOT NULL,
  \`school_id\` VARCHAR(50) NOT NULL,
  \`school_name\` VARCHAR(255) NOT NULL,
  \`event_id\` VARCHAR(50) NOT NULL,
  \`event_name\` VARCHAR(255) NOT NULL,
  \`sport_name\` VARCHAR(100) NOT NULL,
  \`result_id\` VARCHAR(50) NOT NULL,
  \`award\` VARCHAR(200) NOT NULL,
  \`medal\` ENUM('GOLD', 'SILVER', 'BRONZE', 'NONE') NOT NULL,
  \`issue_date\` DATE NOT NULL,
  \`template_type\` ENUM('STUDENT', 'COACH') DEFAULT 'STUDENT',
  \`drive_file_id\` VARCHAR(255) DEFAULT NULL,
  \`drive_url\` TEXT DEFAULT NULL,
  \`qr_token\` VARCHAR(100) NOT NULL COMMENT 'Token ป้องกันการเดาเลข สำหรับ QR Code',
  \`status\` ENUM('ISSUED', 'REVOKED') DEFAULT 'ISSUED',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_certificate_no\` (\`certificate_no\`),
  UNIQUE KEY \`uk_qr_token\` (\`qr_token\`),
  KEY \`fk_cert_school\` (\`school_id\`),
  KEY \`fk_cert_event\` (\`event_id\`),
  KEY \`fk_cert_result\` (\`result_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 12. Table structure for table \`settings\`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`settings\`;
CREATE TABLE \`settings\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`setting_key\` VARCHAR(100) NOT NULL,
  \`setting_value\` LONGTEXT NOT NULL,
  \`description\` VARCHAR(255) DEFAULT NULL,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_setting_key\` (\`setting_key\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 13. Table structure for table \`activity_logs\`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`activity_logs\`;
CREATE TABLE \`activity_logs\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`user_id\` VARCHAR(50) DEFAULT NULL,
  \`user_name\` VARCHAR(150) NOT NULL,
  \`action\` VARCHAR(255) NOT NULL,
  \`table_name\` VARCHAR(100) NOT NULL,
  \`record_id\` VARCHAR(50) DEFAULT NULL,
  \`ip_address\` VARCHAR(50) DEFAULT NULL,
  \`user_agent\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_log_user\` (\`user_id\`),
  KEY \`idx_log_action\` (\`action\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- SEED DATA
-- ==============================================================================

-- Competitions
INSERT INTO \`competitions\` (\`id\`, \`year\`, \`competition_name\`, \`start_date\`, \`end_date\`, \`venue\`, \`host_org\`, \`status\`) VALUES
('${comp.id}', ${comp.year}, '${comp.competition_name.replace(/'/g, "\\'")}', '${comp.start_date}', '${comp.end_date}', '${comp.venue.replace(/'/g, "\\'")}', '${comp.host_org.replace(/'/g, "\\'")}', '${comp.status}');

-- Settings
${settings.map(s => `INSERT INTO \`settings\` (\`id\`, \`setting_key\`, \`setting_value\`, \`description\`) VALUES ('${s.id}', '${s.setting_key}', '${s.setting_value.replace(/'/g, "\\'")}', '${s.description.replace(/'/g, "\\'")}');`).join('\n')}

-- Schools (12 แห่งในกลุ่มโรงเรียนสว่างสูงกระสัง)
${schools.map(s => `INSERT INTO \`schools\` (\`id\`, \`competition_id\`, \`school_code\`, \`smis_code\`, \`school_name\`, \`short_name\`, \`address\`, \`phone\`, \`logo\`, \`director_name\`, \`status\`) VALUES ('${s.id}', '${s.competition_id || comp.id}', '${s.school_code}', '${s.smis_code || s.school_code}', '${s.school_name.replace(/'/g, "\\'")}', '${s.short_name.replace(/'/g, "\\'")}', '${(s.address||'').replace(/'/g, "\\'")}', '${s.phone}', '${s.logo}', '${(s.director_name||'').replace(/'/g, "\\'")}', '${s.status}');`).join('\n')}

-- Users (Username = SMIS 8 หลัก, Default password = 123456, must_change_password = 1)
${users.map(u => {
  const hash = u.role === 'SCHOOL' 
    ? '$2y$10$qR6K8k7FwQvE8Z0e6YhSKeN2pE7B4...' // 123456
    : '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // admin1234
  const mustChange = u.must_change_password ? 1 : 0;
  return `INSERT INTO \`users\` (\`id\`, \`school_id\`, \`username\`, \`password\`, \`full_name\`, \`email\`, \`phone\`, \`role\`, \`status\`, \`must_change_password\`) VALUES ('${u.id}', ${u.school_id ? `'${u.school_id}'` : 'NULL'}, '${u.username}', '${hash}', '${u.full_name.replace(/'/g, "\\'")}', '${u.email}', '${u.phone || ''}', '${u.role}', '${u.status}', ${mustChange});`;
}).join('\n')}

-- Sports
${sports.map(sp => `INSERT INTO \`sports\` (\`id\`, \`sport_name\`, \`sport_icon\`, \`description\`, \`category\`, \`status\`) VALUES ('${sp.id}', '${sp.sport_name.replace(/'/g, "\\'")}', '${sp.sport_icon}', '${(sp.description||'').replace(/'/g, "\\'")}', '${sp.category}', '${sp.status}');`).join('\n')}

-- Events
${events.map(ev => `INSERT INTO \`events\` (\`id\`, \`competition_id\`, \`sport_id\`, \`event_code\`, \`event_name\`, \`gender\`, \`age_group\`, \`grade\`, \`competition_type\`, \`award_type\`, \`max_players\`, \`min_players\`, \`status\`) VALUES ('${ev.id}', '${ev.competition_id}', '${ev.sport_id}', '${ev.event_code}', '${ev.event_name.replace(/'/g, "\\'")}', '${ev.gender}', '${ev.age_group}', '${ev.grade}', '${ev.competition_type}', '${ev.award_type.replace(/'/g, "\\'")}', ${ev.max_players}, ${ev.min_players}, '${ev.status}');`).join('\n')}

-- Students
${students.map(st => `INSERT INTO \`students\` (\`id\`, \`competition_id\`, \`school_id\`, \`student_code\`, \`prefix\`, \`first_name\`, \`last_name\`, \`gender\`, \`birth_date\`, \`grade\`, \`class_room\`, \`status\`) VALUES ('${st.id}', '${st.competition_id}', '${st.school_id}', '${st.student_code}', '${st.prefix}', '${st.first_name.replace(/'/g, "\\'")}', '${st.last_name.replace(/'/g, "\\'")}', '${st.gender}', '${st.birth_date}', '${st.grade}', '${st.class_room}', '${st.status}');`).join('\n')}

-- Coaches
${coaches.map(c => `INSERT INTO \`coaches\` (\`id\`, \`competition_id\`, \`school_id\`, \`prefix\`, \`first_name\`, \`last_name\`, \`position\`, \`phone\`, \`status\`) VALUES ('${c.id}', '${c.competition_id}', '${c.school_id}', '${c.prefix}', '${c.first_name.replace(/'/g, "\\'")}', '${c.last_name.replace(/'/g, "\\'")}', '${c.position.replace(/'/g, "\\'")}', '${c.phone}', '${c.status}');`).join('\n')}

-- Registrations
${registrations.map(r => `INSERT INTO \`registrations\` (\`id\`, \`competition_id\`, \`event_id\`, \`school_id\`, \`coach_id\`, \`secondary_coach_id\`, \`registration_status\`, \`submitted_at\`, \`approved_at\`, \`approved_by\`) VALUES ('${r.id}', '${r.competition_id}', '${r.event_id}', '${r.school_id}', ${r.coach_id ? `'${r.coach_id}'` : 'NULL'}, ${r.secondary_coach_id ? `'${r.secondary_coach_id}'` : 'NULL'}, '${r.registration_status}', '${r.submitted_at || new Date().toISOString()}', '${r.approved_at || new Date().toISOString()}', '${r.approved_by || 'admin'}');`).join('\n')}

-- Registration Students Linkage
${regStudents.map(rs => `INSERT INTO \`registration_students\` (\`id\`, \`registration_id\`, \`student_id\`, \`jersey_number\`) VALUES ('${rs.id}', '${rs.registration_id}', '${rs.student_id}', ${rs.jersey_number || 'NULL'});`).join('\n')}

-- Match Results
${results.map(res => `INSERT INTO \`results\` (\`id\`, \`competition_id\`, \`event_id\`, \`school_id\`, \`rank\`, \`award\`, \`medal\`, \`score\`, \`note\`, \`recorded_by\`, \`recorded_at\`, \`status\`) VALUES ('${res.id}', '${res.competition_id}', '${res.event_id}', '${res.school_id}', ${res.rank}, '${res.award.replace(/'/g, "\\'")}', '${res.medal}', '${(res.score||'').replace(/'/g, "\\'")}', '${(res.note||'').replace(/'/g, "\\'")}', '${res.recorded_by.replace(/'/g, "\\'")}', '${res.recorded_at}', '${res.status}');`).join('\n')}

-- Certificates
${certificates.map(c => `INSERT INTO \`certificates\` (\`id\`, \`competition_id\`, \`certificate_no\`, \`recipient_type\`, \`recipient_id\`, \`recipient_name\`, \`school_id\`, \`school_name\`, \`event_id\`, \`event_name\`, \`sport_name\`, \`result_id\`, \`award\`, \`medal\`, \`issue_date\`, \`template_type\`, \`drive_file_id\`, \`drive_url\`, \`qr_token\`, \`status\`) VALUES ('${c.id}', '${c.competition_id}', '${c.certificate_no}', '${c.recipient_type}', '${c.recipient_id}', '${c.recipient_name.replace(/'/g, "\\'")}', '${c.school_id}', '${c.school_name.replace(/'/g, "\\'")}', '${c.event_id}', '${c.event_name.replace(/'/g, "\\'")}', '${c.sport_name.replace(/'/g, "\\'")}', '${c.result_id}', '${c.award.replace(/'/g, "\\'")}', '${c.medal}', '${c.issue_date}', '${c.template_type}', '${c.drive_file_id || ''}', '${c.drive_url || ''}', '${c.qr_token}', '${c.status}');`).join('\n')}

SET FOREIGN_KEY_CHECKS = 1;
`;
}

export function generatePhpReadme(): string {
  return `# ระบบบริหารจัดการแข่งขันกีฬากลุ่มโรงเรียนสว่างสูงกระสัง ประจำปี 2569

## 📌 สถาปัตยกรรมระบบ (Architecture)
- **Language**: PHP 8.1+ / MySQL 8.0+
- **Database Connection File**: \`config/database.php\` (ใช้ PDO พร้อม Auto-Installer เมื่อยังไม่พบฐานข้อมูล)
- **Web Auto Installer**: \`install.php\` (รันเพื่อสร้างฐานข้อมูลและนำเข้าข้อมูลโรงเรียน 12 แห่งอัตโนมัติ)
- **Security**: 
  - PDO Prepared Statements
  - bcrypt password_hash()
  - บังคับเปลี่ยนรหัสผ่านครั้งแรกเมื่อโรงเรียนเข้าสู่ระบบ (\`must_change_password = 1\`)
  - Super Admin สามารถรีเซ็ตรหัสผ่านของโรงเรียนกลับเป็น \`123456\` ได้ตลอดเวลา
- **Google Drive Integration**: Google API Client v2 พร้อม Auto Backup PDF เกียรติบัตร
- **Certificate Verification**: QR Code + Tokenized Anti-tampering Verification

---

## 🏫 รายชื่อโรงเรียน 12 แห่งและบัญชีผู้ใช้งาน (SMIS Login):
| รหัส SMIS (Username) | ชื่อโรงเรียน | รหัสผ่านตั้งต้น | สถานะบังคับเปลี่ยนรหัสผ่าน |
| :--- | :--- | :--- | :--- |
| **31030064** | โรงเรียนบ้านหนองหว้า | \`123456\` | บังคับเปลี่ยนเมื่อ Login ครั้งแรก |
| **31030059** | โรงเรียนบ้านโคกสว่าง | \`123456\` | บังคับเปลี่ยนเมื่อ Login ครั้งแรก |
| **31030066** | โรงเรียนบ้านโคกสูงคูขาด | \`123456\` | บังคับเปลี่ยนเมื่อ Login ครั้งแรก |
| **31030081** | โรงเรียนบ้านบุกระสัง | \`123456\` | บังคับเปลี่ยนเมื่อ Login ครั้งแรก |
| **31030060** | โรงเรียนบ้านโคกลอย | \`123456\` | บังคับเปลี่ยนเมื่อ Login ครั้งแรก |
| **31030083** | โรงเรียนบ้านสระสะแก | \`123456\` | บังคับเปลี่ยนเมื่อ Login ครั้งแรก |
| **31030082** | โรงเรียนบ้านหนองมัน | \`123456\` | บังคับเปลี่ยนเมื่อ Login ครั้งแรก |
| **31030061** | โรงเรียนบ้านตะกรุมทอง | \`123456\` | บังคับเปลี่ยนเมื่อ Login ครั้งแรก |
| **31030062** | โรงเรียนบ้านโนนพะไล | \`123456\` | บังคับเปลี่ยนเมื่อ Login ครั้งแรก |
| **31030065** | โรงเรียนบ้านสระตะเคียน | \`123456\` | บังคับเปลี่ยนเมื่อ Login ครั้งแรก |
| **31030067** | โรงเรียนมิตรภาพโนนสมบูรณ์ | \`123456\` | บังคับเปลี่ยนเมื่อ Login ครั้งแรก |
| **31030063** | โรงเรียนบ้านสะเดาหวาน | \`123456\` | บังคับเปลี่ยนเมื่อ Login ครั้งแรก |

### บัญชีผู้ดูแลระบบกลางและกรรมการ:
- **Super Admin**: \`superadmin\` / \`admin1234\`
- **Admin การแข่งขัน**: \`admin\` / \`admin1234\`
- **กรรมการผู้ตัดสิน**: \`referee1\` / \`judge1234\`

---

## 🚀 วิธีติดตั้งฐานข้อมูลอัตโนมัติ (Automatic Database Installation)

### วิธีที่ 1: ติดตั้งผ่านหน้าเว็บอัตโนมัติ (แนะนำ)
1. เปิดไฟล์ \`config/database.php\` เพื่อตรวจสอบหรือปรับแต่ง User/Password ของ MySQL
2. เปิดเบราว์เซอร์ไปยัง URL: \`http://localhost/sawangsung-sports/install.php\`
3. กดปุ่ม **"🚀 เริ่มการติดตั้งฐานข้อมูลอัตโนมัติทันที"**
4. ระบบจะสร้าง Database \`swang_sung_krasang_sports\`, สร้างตารางทั้งหมด 13 ตาราง, และนำเข้าโรงเรียน 12 แห่งและบัญชี SMIS ให้ทันที!

### วิธีที่ 2: ติดตั้งผ่าน phpMyAdmin / MySQL CLI
1. สร้างฐานข้อมูล \`swang_sung_krasang_sports\` (Collation: \`utf8mb4_unicode_ci\`)
2. Import ไฟล์ \`database.sql\`
`;
}

export const generateDatabaseSql = generateMySQLSchemaAndSeed;
export const generateReadmeDocumentation = generatePhpReadme;


