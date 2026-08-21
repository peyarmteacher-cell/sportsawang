import { sportsStore } from './store';

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
-- 2. Table structure for table \`schools\`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`schools\`;
CREATE TABLE \`schools\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`competition_id\` VARCHAR(50) NOT NULL,
  \`school_code\` VARCHAR(50) NOT NULL COMMENT 'รหัสสถานศึกษา',
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
  CONSTRAINT \`fk_schools_competition\` FOREIGN KEY (\`competition_id\`) REFERENCES \`competitions\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table structure for table \`users\`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`school_id\` VARCHAR(50) DEFAULT NULL COMMENT 'ผูกกับโรงเรียน (NULL สำหรับ Admin/Judge)',
  \`username\` VARCHAR(100) NOT NULL COMMENT 'ชื่อผู้ใช้งาน',
  \`password\` VARCHAR(255) NOT NULL COMMENT 'รหัสผ่านแฮชด้วย password_hash() BCRYPT',
  \`full_name\` VARCHAR(200) NOT NULL COMMENT 'ชื่อ-นามสกุล',
  \`email\` VARCHAR(150) DEFAULT NULL,
  \`phone\` VARCHAR(50) DEFAULT NULL,
  \`role\` ENUM('SUPER_ADMIN', 'ADMIN', 'SCHOOL', 'JUDGE') NOT NULL DEFAULT 'SCHOOL',
  \`status\` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
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

-- Schools
${schools.map(s => `INSERT INTO \`schools\` (\`id\`, \`competition_id\`, \`school_code\`, \`school_name\`, \`short_name\`, \`address\`, \`phone\`, \`logo\`, \`director_name\`, \`status\`) VALUES ('${s.id}', '${s.competition_id || comp.id}', '${s.school_code}', '${s.school_name.replace(/'/g, "\\'")}', '${s.short_name.replace(/'/g, "\\'")}', '${(s.address||'').replace(/'/g, "\\'")}', '${s.phone}', '${s.logo}', '${(s.director_name||'').replace(/'/g, "\\'")}', '${s.status}');`).join('\n')}

-- Users (Default password: admin1234 or pass1234, BCRYPT hashed)
${users.map(u => `INSERT INTO \`users\` (\`id\`, \`school_id\`, \`username\`, \`password\`, \`full_name\`, \`email\`, \`phone\`, \`role\`, \`status\`) VALUES ('${u.id}', ${u.school_id ? `'${u.school_id}'` : 'NULL'}, '${u.username}', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '${u.full_name.replace(/'/g, "\\'")}', '${u.email}', '${u.phone || ''}', '${u.role}', '${u.status}');`).join('\n')}

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
- **Security**: PDO Prepared Statements, bcrypt password_hash(), CSRF token, XSS escaping, Role-Based Access Control (RBAC).
- **Google Drive Integration**: Google API Client v2 with OAuth2 / Service Account for auto folder creation and PDF certificates backup.
- **Certificate Verification**: QR Code + Tokenized Anti-tampering Verification.

---

## 🚀 ขั้นตอนการติดตั้ง (Installation Guide)

### 1. นำเข้าฐานข้อมูล
1. เปิด phpMyAdmin หรือ MySQL Terminal
2. สร้างฐานข้อมูล \`swang_sung_krasang_sports\` (Collation: \`utf8mb4_unicode_ci\`)
3. นำเข้าไฟล์ \`database.sql\`

### 2. ตั้งค่าไฟล์ .env
สร้างไฟล์ \`.env\` ที่รูทของโปรเจกต์:
\`\`\`env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=swang_sung_krasang_sports
DB_USER=root
DB_PASSWORD=your_mysql_password
APP_URL=https://your-domain.com

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/admin/google-callback.php
GOOGLE_DRIVE_FOLDER_ID=your_parent_folder_id
\`\`\`

### 3. รหัสผ่านเริ่มต้นสำหรับทดสอบ (Default Accounts)
| บทบาท (Role) | Username | Password เริ่มต้น |
| :--- | :--- | :--- |
| **Super Admin** | \`superadmin\` | \`admin1234\` |
| **Admin การแข่งขัน** | \`admin\` | \`admin1234\` |
| **โรงเรียนบ้านหนองหว้า** | \`school_nongwa\` | \`pass1234\` |
| **โรงเรียนบ้านสระสะแก** | \`school_srasakae\` | \`pass1234\` |
| **กรรมการตัดสิน (Judge)** | \`referee1\` | \`judge1234\` |

---

## 🎯 แนวคิด One Data, Many Uses
1. โรงเรียนลงทะเบียนนักเรียนและครูเพียงครั้งเดียว
2. เลือกนักเรียนลงรายการแข่งขัน
3. กรรมการเลือกโรงเรียนที่ชนะ -> ระบบดึงรายชื่อนักเรียนและครูจากฐานข้อมูลอัตโนมัติ
4. ระบบสร้างเกียรติบัตรแบบ Batch พร้อมรหัสป้องกันการซ้ำ และสร้าง QR Code อัตโนมัติ
5. ประชาชนและนักเรียนสามารถสแกน QR Code หรือตรวจสอบผ่านหน้าเว็บสาธารณะได้ทันที
`;
}

export const generateDatabaseSql = generateMySQLSchemaAndSeed;
export const generateReadmeDocumentation = generatePhpReadme;


