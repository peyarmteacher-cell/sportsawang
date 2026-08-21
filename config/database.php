<?php
/**
 * ==============================================================================
 * ไฟล์: config/database.php
 * คำอธิบาย: ตั้งค่าการเชื่อมต่อฐานข้อมูล MySQL/MariaDB ผ่าน PDO
 * และระบบตรวจสอบ/ติดตั้งฐานข้อมูลอัตโนมัติ (Auto-Installer)
 * ==============================================================================
 */

define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'schoolos12_sawang');
define('DB_USER', getenv('DB_USER') ?: 'schoolos12_sawang');
define('DB_PASS', getenv('DB_PASS') ?: 'GM$i5dassAd85_es');
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
            $pdo = null;
            // 1. พยายามเชื่อมต่อ Database ที่ระบุไว้โดยตรงก่อน (รองรับ Shared Hosting เช่น cPanel / DirectAdmin)
            try {
                $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
                $pdo = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            } catch (PDOException $ex) {
                // 2. หากยังไม่มี Database และผู้ใช้มีสิทธิ์ Root/Admin ให้ลองสร้าง Database
                $rootDsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=" . DB_CHARSET;
                $rootPdo = new PDO($rootDsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
                $rootPdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
                $rootPdo->exec("USE `" . DB_NAME . "`;");
                $pdo = $rootPdo;
            }

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

/**
 * แปลงวันที่ ค.ศ. (YYYY-MM-DD) เป็นวันที่ภาษาไทย (วัน เดือน ปี พ.ศ.)
 * เช่น 2026-08-31 => 31 สิงหาคม 2569
 */
function formatThaiDate(?string $dateStr): string {
    if (empty($dateStr)) return '';
    $thaiMonths = [
        1 => 'มกราคม', 2 => 'กุมภาพันธ์', 3 => 'มีนาคม', 4 => 'เมษายน',
        5 => 'พฤษภาคม', 6 => 'มิถุนายน', 7 => 'กรกฎาคม', 8 => 'สิงหาคม',
        9 => 'กันยายน', 10 => 'ตุลาคม', 11 => 'พฤศจิกายน', 12 => 'ธันวาคม'
    ];

    if (preg_match('/^(\d{4})-(\d{1,2})-(\d{1,2})/', $dateStr, $matches)) {
        $year = (int)$matches[1] + 543;
        $month = (int)$matches[2];
        $day = (int)$matches[3];
        $monthName = $thaiMonths[$month] ?? '';
        return "{$day} {$monthName} {$year}";
    }

    $timestamp = strtotime($dateStr);
    if ($timestamp === false) return $dateStr;
    $day = (int)date('j', $timestamp);
    $month = (int)date('n', $timestamp);
    $year = (int)date('Y', $timestamp) + 543;
    $monthName = $thaiMonths[$month] ?? '';
    return "{$day} {$monthName} {$year}";
}

/**
 * แปลงช่วงวันที่เป็นรูปแบบภาษาไทย
 * เช่น 2026-08-31 ถึง 2026-09-05 => 31 สิงหาคม 2569 ถึง 5 กันยายน 2569
 */
function formatThaiDateRange(?string $startDate, ?string $endDate): string {
    if (empty($startDate) && empty($endDate)) return '';
    if (!empty($startDate) && empty($endDate)) return formatThaiDate($startDate);
    if (empty($startDate) && !empty($endDate)) return formatThaiDate($endDate);
    return formatThaiDate($startDate) . ' ถึง ' . formatThaiDate($endDate);
}
?>
