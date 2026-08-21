-- ==============================================================================
-- ระบบบริหารจัดการแข่งขันกีฬากลุ่มโรงเรียนสว่างสูงกระสัง ประจำปี 2569
-- MySQL 8.x / MariaDB Database Schema & Seed Data
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `swang_sung_krasang_sports` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `swang_sung_krasang_sports`;

-- 1. COMPETITIONS TABLE
DROP TABLE IF EXISTS `competitions`;
CREATE TABLE `competitions` (
  `id` VARCHAR(50) NOT NULL,
  `year` INT(11) NOT NULL,
  `competition_name` VARCHAR(255) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `venue` VARCHAR(255) NOT NULL,
  `host_org` VARCHAR(255) NOT NULL,
  `status` ENUM('UPCOMING','ACTIVE','COMPLETED','ARCHIVED') DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. SETTINGS TABLE
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` VARCHAR(50) NOT NULL,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. SCHOOLS TABLE (12 โรงเรียนกลุ่มสว่างสูงกระสัง)
DROP TABLE IF EXISTS `schools`;
CREATE TABLE `schools` (
  `id` VARCHAR(50) NOT NULL,
  `competition_id` VARCHAR(50) NOT NULL,
  `school_code` VARCHAR(50) NOT NULL,
  `smis_code` VARCHAR(20) NOT NULL,
  `school_name` VARCHAR(255) NOT NULL,
  `short_name` VARCHAR(100) NOT NULL,
  `address` TEXT DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `logo` VARCHAR(255) DEFAULT NULL,
  `director_name` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_school_comp` (`competition_id`),
  KEY `idx_school_smis` (`smis_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. USERS TABLE (Username = SMIS 8 หลัก, default password = 123456)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL,
  `school_id` VARCHAR(50) DEFAULT NULL,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `role` ENUM('SUPER_ADMIN','ADMIN','SCHOOL','REFEREE') NOT NULL,
  `status` ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `must_change_password` TINYINT(1) DEFAULT 1,
  `last_login` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_school` (`school_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. SPORTS TABLE
DROP TABLE IF EXISTS `sports`;
CREATE TABLE `sports` (
  `id` VARCHAR(50) NOT NULL,
  `sport_name` VARCHAR(100) NOT NULL,
  `sport_icon` VARCHAR(50) DEFAULT 'Trophy',
  `description` TEXT DEFAULT NULL,
  `category` ENUM('BALL_SPORTS','RACQUET_SPORTS','ATHLETICS','TRADITIONAL_SPORTS','OTHER') DEFAULT 'BALL_SPORTS',
  `status` ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. EVENTS TABLE
DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id` VARCHAR(50) NOT NULL,
  `competition_id` VARCHAR(50) NOT NULL,
  `sport_id` VARCHAR(50) NOT NULL,
  `event_code` VARCHAR(50) NOT NULL,
  `event_name` VARCHAR(255) NOT NULL,
  `gender` ENUM('MALE','FEMALE','MIXED') NOT NULL,
  `age_group` VARCHAR(50) NOT NULL,
  `grade` VARCHAR(50) NOT NULL,
  `competition_type` ENUM('INDIVIDUAL','TEAM','DOUBLE') NOT NULL,
  `award_type` VARCHAR(100) DEFAULT 'เหรียญทอง/เงิน/ทองแดง + เกียรติบัตร',
  `max_players` INT(11) DEFAULT 1,
  `min_players` INT(11) DEFAULT 1,
  `status` ENUM('OPEN','CLOSED','IN_PROGRESS','COMPLETED') DEFAULT 'OPEN',
  PRIMARY KEY (`id`),
  KEY `idx_event_sport` (`sport_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. STUDENTS TABLE
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` VARCHAR(50) NOT NULL,
  `competition_id` VARCHAR(50) NOT NULL,
  `school_id` VARCHAR(50) NOT NULL,
  `student_code` VARCHAR(50) NOT NULL,
  `prefix` VARCHAR(20) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `gender` ENUM('MALE','FEMALE') NOT NULL,
  `birth_date` DATE NOT NULL,
  `grade` VARCHAR(50) NOT NULL,
  `class_room` VARCHAR(20) DEFAULT NULL,
  `photo_url` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  KEY `idx_student_school` (`school_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. COACHES TABLE
DROP TABLE IF EXISTS `coaches`;
CREATE TABLE `coaches` (
  `id` VARCHAR(50) NOT NULL,
  `competition_id` VARCHAR(50) NOT NULL,
  `school_id` VARCHAR(50) NOT NULL,
  `prefix` VARCHAR(20) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `position` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  KEY `idx_coach_school` (`school_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. REGISTRATIONS TABLE
DROP TABLE IF EXISTS `registrations`;
CREATE TABLE `registrations` (
  `id` VARCHAR(50) NOT NULL,
  `competition_id` VARCHAR(50) NOT NULL,
  `event_id` VARCHAR(50) NOT NULL,
  `school_id` VARCHAR(50) NOT NULL,
  `coach_id` VARCHAR(50) DEFAULT NULL,
  `secondary_coach_id` VARCHAR(50) DEFAULT NULL,
  `registration_status` ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'APPROVED',
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `approved_at` TIMESTAMP NULL DEFAULT NULL,
  `approved_by` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_reg_event` (`event_id`),
  KEY `idx_reg_school` (`school_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. REGISTRATION_STUDENTS TABLE
DROP TABLE IF EXISTS `registration_students`;
CREATE TABLE `registration_students` (
  `id` VARCHAR(50) NOT NULL,
  `registration_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `jersey_number` INT(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_rs_reg` (`registration_id`),
  KEY `idx_rs_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. RESULTS TABLE
DROP TABLE IF EXISTS `results`;
CREATE TABLE `results` (
  `id` VARCHAR(50) NOT NULL,
  `competition_id` VARCHAR(50) NOT NULL,
  `event_id` VARCHAR(50) NOT NULL,
  `school_id` VARCHAR(50) NOT NULL,
  `rank` INT(11) NOT NULL,
  `award` VARCHAR(100) NOT NULL,
  `medal` ENUM('GOLD','SILVER','BRONZE','NONE') DEFAULT 'NONE',
  `score` VARCHAR(100) DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  `recorded_by` VARCHAR(100) NOT NULL,
  `recorded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('UNOFFICIAL','OFFICIAL','DISQUALIFIED') DEFAULT 'OFFICIAL',
  PRIMARY KEY (`id`),
  KEY `idx_result_event` (`event_id`),
  KEY `idx_result_school` (`school_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. CERTIFICATES TABLE
DROP TABLE IF EXISTS `certificates`;
CREATE TABLE `certificates` (
  `id` VARCHAR(50) NOT NULL,
  `competition_id` VARCHAR(50) NOT NULL,
  `certificate_no` VARCHAR(100) NOT NULL UNIQUE,
  `recipient_type` ENUM('STUDENT','COACH','SCHOOL','REFEREE') NOT NULL,
  `recipient_id` VARCHAR(50) NOT NULL,
  `recipient_name` VARCHAR(255) NOT NULL,
  `school_id` VARCHAR(50) NOT NULL,
  `school_name` VARCHAR(255) NOT NULL,
  `event_id` VARCHAR(50) NOT NULL,
  `event_name` VARCHAR(255) NOT NULL,
  `sport_name` VARCHAR(100) NOT NULL,
  `result_id` VARCHAR(50) NOT NULL,
  `award` VARCHAR(100) NOT NULL,
  `medal` ENUM('GOLD','SILVER','BRONZE','NONE') DEFAULT 'NONE',
  `issue_date` DATE NOT NULL,
  `template_type` VARCHAR(50) DEFAULT 'STANDARD_GOLD',
  `drive_file_id` VARCHAR(255) DEFAULT NULL,
  `drive_url` VARCHAR(255) DEFAULT NULL,
  `qr_token` VARCHAR(255) NOT NULL UNIQUE,
  `status` ENUM('GENERATED','DOWNLOADED','REVOKED') DEFAULT 'GENERATED',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cert_qr` (`qr_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. ACTIVITY_LOGS TABLE
DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
  `id` VARCHAR(50) NOT NULL,
  `competition_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_log_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

INSERT INTO `competitions` (`id`, `year`, `competition_name`, `start_date`, `end_date`, `venue`, `host_org`, `status`) VALUES
('comp-2026', 2569, 'การแข่งขันกีฬากลุ่มโรงเรียนสว่างสูงกระสัง ประจำปีการศึกษา 2569', '2026-11-15', '2026-11-20', 'สนามกีฬาโรงเรียนบ้านหนองหว้า อ.กระสัง จ.บุรีรัมย์', 'กลุ่มโรงเรียนสว่างสูงกระสัง สพป.บุรีรัมย์ เขต 2', 'ACTIVE');

-- 12 โรงเรียนกลุ่มสว่างสูงกระสัง
INSERT INTO `schools` (`id`, `competition_id`, `school_code`, `smis_code`, `school_name`, `short_name`, `address`, `phone`, `logo`, `director_name`, `status`) VALUES
('sch-1', 'comp-2026', '31030064', '31030064', 'โรงเรียนบ้านหนองหว้า', 'รร.บ้านหนองหว้า', 'ต.หนองเต็ง อ.กระสัง จ.บุรีรัมย์', '044-689101', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150', 'นายวิชัย สุขเกษม', 'ACTIVE'),
('sch-2', 'comp-2026', '31030059', '31030059', 'โรงเรียนบ้านโคกสว่าง', 'รร.บ้านโคกสว่าง', 'ต.สูงเนิน อ.กระสัง จ.บุรีรัมย์', '044-689102', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150', 'นางสมศรี ใจดี', 'ACTIVE'),
('sch-3', 'comp-2026', '31030066', '31030066', 'โรงเรียนบ้านโคกสูงคูขาด', 'รร.บ้านโคกสูงคูขาด', 'ต.หนองเต็ง อ.กระสัง จ.บุรีรัมย์', '044-689103', 'https://images.unsplash.com/photo-1592066575517-58df903152f2?w=150', 'นายประเสริฐ รัตนวงศ์', 'ACTIVE'),
('sch-4', 'comp-2026', '31030081', '31030081', 'โรงเรียนบ้านบุกระสัง', 'รร.บ้านบุกระสัง', 'ต.กระสัง อ.กระสัง จ.บุรีรัมย์', '044-689104', 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=150', 'นายสมคิด ยิ่งเจริญ', 'ACTIVE'),
('sch-5', 'comp-2026', '31030060', '31030060', 'โรงเรียนบ้านโคกลอย', 'รร.บ้านโคกลอย', 'ต.สูงเนิน อ.กระสัง จ.บุรีรัมย์', '044-689105', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=150', 'นางกัญญาภัทร ศรีสว่าง', 'ACTIVE'),
('sch-6', 'comp-2026', '31030083', '31030083', 'โรงเรียนบ้านสระสะแก', 'รร.บ้านสระสะแก', 'ต.กระสัง อ.กระสัง จ.บุรีรัมย์', '044-689106', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=150', 'นายสุรชัย มั่นคง', 'ACTIVE'),
('sch-7', 'comp-2026', '31030082', '31030082', 'โรงเรียนบ้านหนองมัน', 'รร.บ้านหนองมัน', 'ต.กระสัง อ.กระสัง จ.บุรีรัมย์', '044-689107', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150', 'นายณรงค์ เกียรติชัย', 'ACTIVE'),
('sch-8', 'comp-2026', '31030061', '31030061', 'โรงเรียนบ้านตะกรุมทอง', 'รร.บ้านตะกรุมทอง', 'ต.สูงเนิน อ.กระสัง จ.บุรีรัมย์', '044-689108', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150', 'นางพรทิพย์ สุวรรณโชติ', 'ACTIVE'),
('sch-9', 'comp-2026', '31030062', '31030062', 'โรงเรียนบ้านโนนพะไล', 'รร.บ้านโนนพะไล', 'ต.หนองเต็ง อ.กระสัง จ.บุรีรัมย์', '044-689109', 'https://images.unsplash.com/photo-1592066575517-58df903152f2?w=150', 'นายบุญเลิศ เจริญผล', 'ACTIVE'),
('sch-10', 'comp-2026', '31030065', '31030065', 'โรงเรียนบ้านสระตะเคียน', 'รร.บ้านสระตะเคียน', 'ต.หนองเต็ง อ.กระสัง จ.บุรีรัมย์', '044-689110', 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=150', 'นางสาวมาลี ดวงจันทร์', 'ACTIVE'),
('sch-11', 'comp-2026', '31030067', '31030067', 'โรงเรียนมิตรภาพโนนสมบูรณ์', 'รร.มิตรภาพโนนสมบูรณ์', 'ต.สูงเนิน อ.กระสัง จ.บุรีรัมย์', '044-689111', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=150', 'นายสมพร เพชรดี', 'ACTIVE'),
('sch-12', 'comp-2026', '31030063', '31030063', 'โรงเรียนบ้านสะเดาหวาน', 'รร.บ้านสะเดาหวาน', 'ต.กระสัง อ.กระสัง จ.บุรีรัมย์', '044-689112', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=150', 'นายประสิทธิ์ ชูใจ', 'ACTIVE');

-- บัญชีผู้ใช้งานระบบ (รหัสผ่านเริ่มต้น 123456 สำหรับโรงเรียน, admin1234 สำหรับแอดมิน)
INSERT INTO `users` (`id`, `school_id`, `username`, `password`, `full_name`, `email`, `phone`, `role`, `status`, `must_change_password`) VALUES
('usr-sa', NULL, 'superadmin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ผู้อำนวยการกลุ่มโรงเรียนสว่างสูงกระสัง', 'superadmin@sawangsung.ac.th', '081-9998888', 'SUPER_ADMIN', 'ACTIVE', 0),
('usr-admin', NULL, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'คณะกรรมการฝ่ายจัดการแข่งขัน', 'admin@sawangsung.ac.th', '081-7776666', 'ADMIN', 'ACTIVE', 0),
('usr-ref1', NULL, 'referee1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'อาจารย์สมศักดิ์ ตัดสินเที่ยงตรง (กรรมการเป่าฟุตบอล)', 'referee1@sawangsung.ac.th', '089-1112222', 'REFEREE', 'ACTIVE', 0),
('usr-sch-1', 'sch-1', '31030064', '$2y$10$tZ2yYpL/jYyJmUq5uVvXQeK1e0U2/t0.1q5X7W5.Xq9V9e7T5.Z0a', 'ผู้ประสานงาน รร.บ้านหนองหว้า', 'nongwa@sawangsung.ac.th', '044-689101', 'SCHOOL', 'ACTIVE', 1),
('usr-sch-2', 'sch-2', '31030059', '$2y$10$tZ2yYpL/jYyJmUq5uVvXQeK1e0U2/t0.1q5X7W5.Xq9V9e7T5.Z0a', 'ผู้ประสานงาน รร.บ้านโคกสว่าง', 'khoksawang@sawangsung.ac.th', '044-689102', 'SCHOOL', 'ACTIVE', 1),
('usr-sch-3', 'sch-3', '31030066', '$2y$10$tZ2yYpL/jYyJmUq5uVvXQeK1e0U2/t0.1q5X7W5.Xq9V9e7T5.Z0a', 'ผู้ประสานงาน รร.บ้านโคกสูงคูขาด', 'khoksung@sawangsung.ac.th', '044-689103', 'SCHOOL', 'ACTIVE', 1),
('usr-sch-4', 'sch-4', '31030081', '$2y$10$tZ2yYpL/jYyJmUq5uVvXQeK1e0U2/t0.1q5X7W5.Xq9V9e7T5.Z0a', 'ผู้ประสานงาน รร.บ้านบุกระสัง', 'bukrasang@sawangsung.ac.th', '044-689104', 'SCHOOL', 'ACTIVE', 1),
('usr-sch-5', 'sch-5', '31030060', '$2y$10$tZ2yYpL/jYyJmUq5uVvXQeK1e0U2/t0.1q5X7W5.Xq9V9e7T5.Z0a', 'ผู้ประสานงาน รร.บ้านโคกลอย', 'khokloy@sawangsung.ac.th', '044-689105', 'SCHOOL', 'ACTIVE', 1),
('usr-sch-6', 'sch-6', '31030083', '$2y$10$tZ2yYpL/jYyJmUq5uVvXQeK1e0U2/t0.1q5X7W5.Xq9V9e7T5.Z0a', 'ผู้ประสานงาน รร.บ้านสระสะแก', 'srasakae@sawangsung.ac.th', '044-689106', 'SCHOOL', 'ACTIVE', 1),
('usr-sch-7', 'sch-7', '31030082', '$2y$10$tZ2yYpL/jYyJmUq5uVvXQeK1e0U2/t0.1q5X7W5.Xq9V9e7T5.Z0a', 'ผู้ประสานงาน รร.บ้านหนองมัน', 'nongman@sawangsung.ac.th', '044-689107', 'SCHOOL', 'ACTIVE', 1),
('usr-sch-8', 'sch-8', '31030061', '$2y$10$tZ2yYpL/jYyJmUq5uVvXQeK1e0U2/t0.1q5X7W5.Xq9V9e7T5.Z0a', 'ผู้ประสานงาน รร.บ้านตะกรุมทอง', 'takrumthong@sawangsung.ac.th', '044-689108', 'SCHOOL', 'ACTIVE', 1),
('usr-sch-9', 'sch-9', '31030062', '$2y$10$tZ2yYpL/jYyJmUq5uVvXQeK1e0U2/t0.1q5X7W5.Xq9V9e7T5.Z0a', 'ผู้ประสานงาน รร.บ้านโนนพะไล', 'nonphalai@sawangsung.ac.th', '044-689109', 'SCHOOL', 'ACTIVE', 1),
('usr-sch-10', 'sch-10', '31030065', '$2y$10$tZ2yYpL/jYyJmUq5uVvXQeK1e0U2/t0.1q5X7W5.Xq9V9e7T5.Z0a', 'ผู้ประสานงาน รร.บ้านสระตะเคียน', 'sratakian@sawangsung.ac.th', '044-689110', 'SCHOOL', 'ACTIVE', 1),
('usr-sch-11', 'sch-11', '31030067', '$2y$10$tZ2yYpL/jYyJmUq5uVvXQeK1e0U2/t0.1q5X7W5.Xq9V9e7T5.Z0a', 'ผู้ประสานงาน รร.มิตรภาพโนนสมบูรณ์', 'mitraphap@sawangsung.ac.th', '044-689111', 'SCHOOL', 'ACTIVE', 1),
('usr-sch-12', 'sch-12', '31030063', '$2y$10$tZ2yYpL/jYyJmUq5uVvXQeK1e0U2/t0.1q5X7W5.Xq9V9e7T5.Z0a', 'ผู้ประสานงาน รร.บ้านสะเดาหวาน', 'sadaowan@sawangsung.ac.th', '044-689112', 'SCHOOL', 'ACTIVE', 1);

-- กีฬา (Sports)
INSERT INTO `sports` (`id`, `sport_name`, `sport_icon`, `description`, `category`, `status`) VALUES
('sp-football', 'ฟุตบอล 7 คน', 'Goal', 'แข่งขันฟุตบอล 7 คน สนามหญ้ามาตรฐาน', 'BALL_SPORTS', 'ACTIVE'),
('sp-futsal', 'ฟุตซอล', 'Activity', 'แข่งขันฟุตซอลสนามคอนกรีตมาตรฐาน', 'BALL_SPORTS', 'ACTIVE'),
('sp-volleyball', 'วอลเลย์บอล', 'CircleDot', 'แข่งขันวอลเลย์บอล 6 คน', 'BALL_SPORTS', 'ACTIVE'),
('sp-sepaktakraw', 'เซปักตะกร้อ', 'Disc', 'แข่งขันเซปักตะกร้อทีมเดี่ยว 3 คน', 'BALL_SPORTS', 'ACTIVE'),
('sp-running', 'กรีฑาและวิ่ง', 'Flame', 'การแข่งขันวิ่ง 50ม. 100ม. 4x100ม.', 'ATHLETICS', 'ACTIVE'),
('sp-petanque', 'เปตอง', 'Crosshair', 'แข่งขันเปตองทีมชาย ทีมหญิง และทีมผสม', 'TRADITIONAL_SPORTS', 'ACTIVE');

-- รายการแข่งขัน (Events)
INSERT INTO `events` (`id`, `competition_id`, `sport_id`, `event_code`, `event_name`, `gender`, `age_group`, `grade`, `competition_type`, `award_type`, `max_players`, `min_players`, `status`) VALUES
('ev-1', 'comp-2026', 'sp-football', 'FB-M-U12', 'ฟุตบอล 7 คน ชาย อายุไม่เกิน 12 ปี', 'MALE', 'อายุไม่เกิน 12 ปี', 'ป.4 - ป.6', 'TEAM', 'เหรียญทอง/เงิน/ทองแดง + เกียรติบัตร', 12, 7, 'OPEN'),
('ev-2', 'comp-2026', 'sp-futsal', 'FS-M-U12', 'ฟุตซอล ชาย อายุไม่เกิน 12 ปี', 'MALE', 'อายุไม่เกิน 12 ปี', 'ป.4 - ป.6', 'TEAM', 'เหรียญทอง/เงิน/ทองแดง + เกียรติบัตร', 10, 5, 'OPEN'),
('ev-3', 'comp-2026', 'sp-volleyball', 'VB-F-U12', 'วอลเลย์บอล หญิง อายุไม่เกิน 12 ปี', 'FEMALE', 'อายุไม่เกิน 12 ปี', 'ป.4 - ป.6', 'TEAM', 'เหรียญทอง/เงิน/ทองแดง + เกียรติบัตร', 12, 6, 'OPEN'),
('ev-4', 'comp-2026', 'sp-sepaktakraw', 'ST-M-U12', 'เซปักตะกร้อ ชาย อายุไม่เกิน 12 ปี', 'MALE', 'อายุไม่เกิน 12 ปี', 'ป.4 - ป.6', 'TEAM', 'เหรียญทอง/เงิน/ทองแดง + เกียรติบัตร', 5, 3, 'OPEN'),
('ev-5', 'comp-2026', 'sp-running', 'RN-M-100M', 'วิ่ง 100 เมตร ชาย อายุไม่เกิน 12 ปี', 'MALE', 'อายุไม่เกิน 12 ปี', 'ป.4 - ป.6', 'INDIVIDUAL', 'เหรียญทอง/เงิน/ทองแดง + เกียรติบัตร', 1, 1, 'OPEN'),
('ev-6', 'comp-2026', 'sp-petanque', 'PT-MIX-U12', 'เปตอง ทีมผสม (ชาย 1 หญิง 2) อายุไม่เกิน 12 ปี', 'MIXED', 'อายุไม่เกิน 12 ปี', 'ป.4 - ป.6', 'TEAM', 'เหรียญทอง/เงิน/ทองแดง + เกียรติบัตร', 3, 3, 'OPEN');

SET FOREIGN_KEY_CHECKS = 1;
