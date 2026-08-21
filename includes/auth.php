<?php
/**
 * ==============================================================================
 * ไฟล์: includes/auth.php
 * คำอธิบาย: ระบบตรวจสอบสิทธิ์และการจัดการ Session (Role-Based Access Control)
 * ==============================================================================
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../config/database.php';

function getCurrentUser(): ?array {
    return $_SESSION['user'] ?? null;
}

function isLoggedIn(): bool {
    return isset($_SESSION['user']) && !empty($_SESSION['user']['id']);
}

function requireLogin(): void {
    if (!isLoggedIn()) {
        header("Location: /login.php");
        exit;
    }
}

function requireRole(array $allowedRoles): void {
    requireLogin();
    $user = getCurrentUser();
    if (!in_array($user['role'], $allowedRoles)) {
        http_response_code(403);
        die("❌ ขออภัย คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (Role Required: " . implode(', ', $allowedRoles) . ")");
    }
}

function logActivity(string $action, string $module, ?string $details = null): void {
    try {
        $pdo = Database::getConnection();
        $user = getCurrentUser();
        $stmt = $pdo->prepare("
            INSERT INTO activity_logs (id, competition_id, user_id, username, action, module, details, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            'log-' . uniqid(),
            'comp-2026',
            $user['id'] ?? 'GUEST',
            $user['username'] ?? 'Guest',
            $action,
            $module,
            $details,
            $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
            $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
        ]);
    } catch (Exception $e) {
        // silent fail on logs
    }
}
?>
