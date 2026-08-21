<?php
/**
 * ==============================================================================
 * ไฟล์: config/database.php
 * คำอธิบาย: ตั้งค่าการเชื่อมต่อฐานข้อมูล MySQL/MariaDB ผ่าน PDO
 * และระบบตรวจสอบ/ติดตั้งฐานข้อมูลอัตโนมัติ (Auto-Installer)
 * ==============================================================================
 */

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
            $rootDsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=" . DB_CHARSET;
            $pdo = new PDO($rootDsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
            $pdo->exec("USE `" . DB_NAME . "`;");

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
?>
