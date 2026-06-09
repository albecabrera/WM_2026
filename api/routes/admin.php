<?php
// Rutas admin: alta de alumnos, listado, avance manual KO, reset de códigos,
// asignación de slots KO, klassenliste y listado de profes (lehrerhandbuch).

function admin_post(): void {
    require_admin();

    $body = body_json();
    $name = trim((string)($body['name'] ?? ''));
    $classCode = trim((string)($body['classCode'] ?? ''));

    if (!$name || !$classCode) json_error('Name und Klasse erforderlich', 400);

    $loginCode = normalize_name($name) . '-' . $classCode;

    $st = db()->prepare('SELECT id FROM "User" WHERE loginCode = ?');
    $st->execute([$loginCode]);
    if ($st->fetch()) {
        json_error("Login-Code \"$loginCode\" bereits vergeben", 409);
    }

    $id = cuid();
    $st = db()->prepare('INSERT INTO "User" (id, name, classCode, loginCode, role, createdAt) VALUES (?, ?, ?, ?, \'STUDENT\', ?)');
    $st->execute([$id, $name, $classCode, $loginCode, now_iso()]);

    $st = db()->prepare('SELECT * FROM "User" WHERE id = ?');
    $st->execute([$id]);
    json_out(['user' => user_json($st->fetch()), 'loginCode' => $loginCode]);
}

function admin_get(): void {
    $session = require_staff();

    $classParam = query_param('class');
    $schoolParam = query_param('school');

    $classCodes = null;
    if ($session['role'] === 'TEACHER') {
        $classCodes = [$session['classCode']];
    } elseif ($classParam) {
        $classCodes = [$classParam];
    } elseif ($schoolParam === 'bbg' || $schoolParam === 'esg') {
        $classCodes = get_class_codes_for_school($schoolParam);
    }

    $sql = 'SELECT * FROM "User" WHERE role IN (\'STUDENT\', \'TEACHER\')';
    $params = [];
    if ($classCodes) {
        $sql .= ' AND classCode IN (' . implode(',', array_fill(0, count($classCodes), '?')) . ')';
        $params = $classCodes;
    }
    $sql .= ' ORDER BY classCode ASC, name ASC';

    $st = db()->prepare($sql);
    $st->execute($params);
    json_out(array_map('user_json', $st->fetchAll()));
}

function admin_advance_post(): void {
    require_staff();

    $body = body_json();
    $matchId = $body['matchId'] ?? null;
    $winnerId = $body['winnerId'] ?? null;
    if (!$matchId || !$winnerId) json_error('matchId und winnerId erforderlich', 400);

    $st = db()->prepare('SELECT * FROM "Match" WHERE id = ?');
    $st->execute([$matchId]);
    $match = $st->fetch();
    if (!$match) json_error('Match nicht gefunden', 404);

    if ($match['matchNumber'] === null) json_error('Kein Bracket für dieses Spiel', 400);

    $loserId = $winnerId === $match['homeTeamId'] ? $match['awayTeamId'] : $match['homeTeamId'];

    if (!advance_team($winnerId, $loserId, (int)$match['matchNumber'])) {
        json_error('Kein Bracket für dieses Spiel', 400);
    }

    $winnerTeam = find_team_by_id($winnerId);
    json_out(['success' => true, 'advancedTeamName' => $winnerTeam['name'] ?? null]);
}

function normalize_name(string $name): string {
    $s = mb_strtolower($name);
    $s = str_replace(['ü', 'ö', 'ä', 'ß'], ['ue', 'oe', 'ae', 'ss'], $s);
    $s = preg_replace('/\s+/u', '', $s);
    return preg_replace('/[^a-z0-9]/', '', $s);
}

function admin_reset_code_post(): void {
    require_staff();

    $body = body_json();
    $query = $body['query'] ?? null;
    $action = $body['action'] ?? 'lookup';
    if (!$query) json_error('Name fehlt', 400);

    $raw = trim(preg_replace('/^#/', '', (string)$query));
    $normalized = normalize_name($raw);

    $users = db()->query('SELECT * FROM "User" WHERE role IN (\'STUDENT\', \'TEACHER\') ORDER BY classCode ASC, name ASC')->fetchAll();

    $matches = array_values(array_filter($users, fn($u) =>
        str_contains(normalize_name($u['name']), $normalized) || str_starts_with($u['loginCode'], $normalized)
    ));

    if (!$matches) json_error("Kein Schüler gefunden für \"#$raw\"", 404);

    if ($action === 'lookup') {
        json_out(array_map(fn($u) => [
            'id' => $u['id'],
            'name' => $u['name'],
            'classCode' => $u['classCode'],
            'loginCode' => $u['loginCode'],
        ], $matches));
    }

    if (count($matches) > 1) {
        json_out([
            'error' => 'Mehrere Schüler gefunden. Vollständigen Namen eingeben.',
            'matches' => array_map(fn($u) => [
                'name' => $u['name'],
                'classCode' => $u['classCode'],
                'loginCode' => $u['loginCode'],
            ], $matches),
        ], 409);
    }

    $user = $matches[0];
    $base = normalize_name($user['name']) . '-' . $user['classCode'];

    $newCode = $base;
    $suffix = 2;
    $check = db()->prepare('SELECT id FROM "User" WHERE loginCode = ?');
    while (true) {
        $check->execute([$newCode]);
        if (!$check->fetch()) break;
        $newCode = $base . $suffix++;
    }

    $st = db()->prepare('UPDATE "User" SET loginCode = ? WHERE id = ?');
    $st->execute([$newCode, $user['id']]);

    json_out([
        'success' => true,
        'name' => $user['name'],
        'classCode' => $user['classCode'],
        'newCode' => $newCode,
    ]);
}

function admin_ko_get(): void {
    require_staff();

    $rows = db()->query('SELECT * FROM "Match" WHERE phase != \'GROUP\' ORDER BY matchNumber ASC')->fetchAll();
    json_out(array_map('match_with_teams', $rows));
}

function admin_ko_put(): void {
    require_staff();

    $body = body_json();
    $matchId = $body['matchId'] ?? null;
    if (!$matchId) json_error('Match-ID fehlt', 400);

    $sets = [];
    $params = [];
    if (array_key_exists('homeTeamId', $body)) {
        $sets[] = 'homeTeamId = ?';
        $params[] = $body['homeTeamId'] ?: null;
    }
    if (array_key_exists('awayTeamId', $body)) {
        $sets[] = 'awayTeamId = ?';
        $params[] = $body['awayTeamId'] ?: null;
    }

    if ($sets) {
        $params[] = $matchId;
        $st = db()->prepare('UPDATE "Match" SET ' . implode(', ', $sets) . ' WHERE id = ?');
        $st->execute($params);
    }

    $st = db()->prepare('SELECT * FROM "Match" WHERE id = ?');
    $st->execute([$matchId]);
    $match = $st->fetch();
    if (!$match) json_error('Match nicht gefunden', 404);

    json_out(match_with_teams($match));
}

function admin_klassenliste_get(): void {
    $session = require_staff();

    $filterClass = query_param('class');
    $schoolParam = query_param('school');

    if ($session['role'] === 'ADMIN') {
        if ($filterClass) {
            $allowed = [$filterClass];
        } elseif ($schoolParam === 'bbg' || $schoolParam === 'esg') {
            $allowed = get_class_codes_for_school($schoolParam);
        } else {
            $allowed = all_class_codes();
        }
    } else {
        $allowed = [$session['classCode']];
    }

    $ph = implode(',', array_fill(0, count($allowed), '?'));
    $st = db()->prepare("SELECT name, classCode, loginCode, role FROM \"User\" WHERE classCode IN ($ph) ORDER BY classCode ASC, role ASC, name ASC");
    $st->execute($allowed);
    $users = $st->fetchAll();

    $result = [];
    foreach ($allowed as $code) {
        if (!in_array($code, all_class_codes(), true)) continue;
        $classUsers = array_values(array_filter($users, fn($u) => $u['classCode'] === $code));
        $result[] = [
            'code' => $code,
            'name' => class_label($code),
            'teachers' => array_values(array_filter($classUsers, fn($u) => $u['role'] === 'TEACHER')),
            'students' => array_values(array_filter($classUsers, fn($u) => $u['role'] === 'STUDENT')),
        ];
    }

    json_out($result);
}

// GET /api/admin/teachers — para el Lehrerhandbuch (antes era consulta Prisma server-side).
function admin_teachers_get(): void {
    require_staff();

    $rows = db()->query('SELECT name, classCode, loginCode FROM "User" WHERE role = \'TEACHER\' ORDER BY classCode ASC, name ASC')->fetchAll();
    json_out($rows);
}
