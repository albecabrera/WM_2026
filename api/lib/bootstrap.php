<?php
// Bootstrap del backend PHP — config, DB (PDO SQLite), JWT-Session, helpers JSON.
// Reemplaza las rutas API de Next.js; el contrato JSON es idéntico al original.

declare(strict_types=1);

date_default_timezone_set('UTC');

define('WM_DATA_DIR', dirname(__DIR__, 3) . '/wm-data');
define('WM_DB_FILE', WM_DATA_DIR . '/wm.sqlite');

$GLOBALS['wm_config'] = file_exists(WM_DATA_DIR . '/config.php')
    ? require WM_DATA_DIR . '/config.php'
    : [];

function config(string $key, $default = null) {
    return $GLOBALS['wm_config'][$key] ?? $default;
}

// ── DB ───────────────────────────────────────────────────────────────────────

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO('sqlite:' . WM_DB_FILE);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->exec('PRAGMA journal_mode = WAL');
        $pdo->exec('PRAGMA foreign_keys = ON');
        $pdo->exec('PRAGMA busy_timeout = 5000');
    }
    return $pdo;
}

function cuid(): string {
    return 'c' . bin2hex(random_bytes(12));
}

function now_iso(): string {
    return gmdate('Y-m-d\TH:i:s') . '.000Z';
}

// ── HTTP helpers ─────────────────────────────────────────────────────────────

function json_out($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error(string $message, int $status): void {
    json_out(['error' => $message], $status);
}

function body_json(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '', true);
    return is_array($data) ? $data : [];
}

function query_param(string $name): ?string {
    $v = $_GET[$name] ?? null;
    return ($v === null || $v === '') ? null : (string)$v;
}

// ── JWT (HS256) + sesión por cookie ─────────────────────────────────────────

function b64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function b64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_secret(): string {
    $secret = config('JWT_SECRET');
    if (!$secret) {
        json_error('JWT_SECRET fehlt in wm-data/config.php', 500);
    }
    return $secret;
}

function jwt_sign(array $payload, int $ttlSeconds = 604800): string {
    $payload['iat'] = time();
    $payload['exp'] = time() + $ttlSeconds;
    $header = b64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $body = b64url_encode(json_encode($payload, JSON_UNESCAPED_UNICODE));
    $sig = b64url_encode(hash_hmac('sha256', "$header.$body", jwt_secret(), true));
    return "$header.$body.$sig";
}

function jwt_verify(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $body, $sig] = $parts;
    $expected = b64url_encode(hash_hmac('sha256', "$header.$body", jwt_secret(), true));
    if (!hash_equals($expected, $sig)) return null;
    $payload = json_decode(b64url_decode($body), true);
    if (!is_array($payload)) return null;
    if (($payload['exp'] ?? 0) < time()) return null;
    return $payload;
}

function set_session_cookie(string $token): void {
    setcookie('session', $token, [
        'expires' => time() + 604800,
        'path' => '/',
        'httponly' => true,
        'secure' => !empty($_SERVER['HTTPS']),
        'samesite' => 'Lax',
    ]);
}

function clear_session_cookie(): void {
    setcookie('session', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'httponly' => true,
        'secure' => !empty($_SERVER['HTTPS']),
        'samesite' => 'Lax',
    ]);
}

/** @return array{id:string,name:string,classCode:string,role:string,loginCode:string}|null */
function get_session(): ?array {
    $token = $_COOKIE['session'] ?? null;
    if (!$token) return null;
    $payload = jwt_verify($token);
    if (!$payload || empty($payload['id'])) return null;
    return $payload;
}

function require_session(): array {
    $session = get_session();
    if (!$session) json_error('Nicht eingeloggt', 401);
    return $session;
}

function require_staff(): array {
    $session = get_session();
    if (!$session || ($session['role'] !== 'ADMIN' && $session['role'] !== 'TEACHER')) {
        json_error('Keine Berechtigung', 403);
    }
    return $session;
}

function require_admin(): array {
    $session = get_session();
    if (!$session || $session['role'] !== 'ADMIN') {
        json_error('Keine Berechtigung', 403);
    }
    return $session;
}

// ── Serialización (mismas formas JSON que Prisma) ────────────────────────────

function team_json(?array $row): ?array {
    if (!$row || empty($row['id'])) return null;
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'shortName' => $row['shortName'],
        'group' => $row['group'] ?? null,
        'flagEmoji' => $row['flagEmoji'],
        'externalId' => isset($row['externalId']) ? (int)$row['externalId'] : null,
    ];
}

function match_json(array $m): array {
    return [
        'id' => $m['id'],
        'matchNumber' => $m['matchNumber'] !== null ? (int)$m['matchNumber'] : null,
        'externalId' => $m['externalId'] !== null ? (int)$m['externalId'] : null,
        'phase' => $m['phase'],
        'group' => $m['group'],
        'round' => $m['round'],
        'homeTeamId' => $m['homeTeamId'],
        'awayTeamId' => $m['awayTeamId'],
        'kickoff' => $m['kickoff'],
        'homeGoals' => $m['homeGoals'] !== null ? (int)$m['homeGoals'] : null,
        'awayGoals' => $m['awayGoals'] !== null ? (int)$m['awayGoals'] : null,
        'status' => $m['status'],
        'venue' => $m['venue'],
    ];
}

function tip_json(array $t): array {
    return [
        'id' => $t['id'],
        'userId' => $t['userId'],
        'matchId' => $t['matchId'],
        'homeGoals' => (int)$t['homeGoals'],
        'awayGoals' => (int)$t['awayGoals'],
        'points' => $t['points'] !== null ? (int)$t['points'] : null,
        'createdAt' => $t['createdAt'],
        'updatedAt' => $t['updatedAt'],
    ];
}

function user_json(array $u): array {
    return [
        'id' => $u['id'],
        'name' => $u['name'],
        'classCode' => $u['classCode'],
        'loginCode' => $u['loginCode'],
        'role' => $u['role'],
        'createdAt' => $u['createdAt'],
    ];
}

/** Carga un partido con sus equipos embebidos (homeTeam/awayTeam). */
function match_with_teams(array $m): array {
    $out = match_json($m);
    $out['homeTeam'] = null;
    $out['awayTeam'] = null;
    if ($m['homeTeamId']) $out['homeTeam'] = team_json(find_team_by_id($m['homeTeamId']));
    if ($m['awayTeamId']) $out['awayTeam'] = team_json(find_team_by_id($m['awayTeamId']));
    return $out;
}

function find_team_by_id(string $id): ?array {
    static $cache = [];
    if (!array_key_exists($id, $cache)) {
        $st = db()->prepare('SELECT * FROM "Team" WHERE id = ?');
        $st->execute([$id]);
        $cache[$id] = $st->fetch() ?: null;
    }
    return $cache[$id];
}

require_once __DIR__ . '/classes.php';
require_once __DIR__ . '/points.php';
require_once __DIR__ . '/bracket.php';
