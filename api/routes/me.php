<?php
// GET /api/me — datos de sesión + puntos + rank (rank limitado a la escuela propia).

function player_totals(string $userId): array {
    $st = db()->prepare('SELECT COUNT(*) AS cnt, COALESCE(SUM(points), 0) AS pts FROM "Tip" WHERE userId = ? AND points IS NOT NULL');
    $st->execute([$userId]);
    return $st->fetch();
}

function me_get(): void {
    $session = require_session();

    if ($session['role'] === 'ADMIN') {
        json_out([
            'id' => $session['id'],
            'name' => $session['name'],
            'classCode' => $session['classCode'],
            'role' => $session['role'],
            'totalPoints' => 0,
            'tipCount' => 0,
            'rank' => null,
            'hasWinnerTip' => false,
            'winnerTipTeamId' => null,
        ]);
    }

    $school = get_school($session['classCode']);
    $schoolCodes = $school ? get_class_codes_for_school($school) : null;

    $own = player_totals($session['id']);

    $st = db()->prepare('SELECT teamId, points FROM "TournamentWinnerTip" WHERE userId = ?');
    $st->execute([$session['id']]);
    $winnerTip = $st->fetch() ?: null;

    $totalPoints = (int)$own['pts'] + (int)($winnerTip['points'] ?? 0);

    // Ranking: total por jugador (tips + winner tip) dentro de la escuela.
    $params = [];
    $classFilter = '';
    if ($schoolCodes) {
        $classFilter = ' AND u.classCode IN (' . implode(',', array_fill(0, count($schoolCodes), '?')) . ')';
        $params = $schoolCodes;
    }
    $st = db()->prepare(
        'SELECT u.id,
                COALESCE((SELECT SUM(t.points) FROM "Tip" t WHERE t.userId = u.id AND t.points IS NOT NULL), 0)
              + COALESCE((SELECT w.points FROM "TournamentWinnerTip" w WHERE w.userId = u.id), 0) AS total
         FROM "User" u
         WHERE u.role IN (\'STUDENT\', \'TEACHER\')' . $classFilter . '
         ORDER BY total DESC'
    );
    $st->execute($params);
    $rank = null;
    $i = 0;
    foreach ($st->fetchAll() as $row) {
        $i++;
        if ($row['id'] === $session['id']) { $rank = $i; break; }
    }

    json_out([
        'id' => $session['id'],
        'name' => $session['name'],
        'classCode' => $session['classCode'],
        'role' => $session['role'],
        'totalPoints' => $totalPoints,
        'tipCount' => (int)$own['cnt'],
        'rank' => $rank,
        'hasWinnerTip' => $winnerTip !== null,
        'winnerTipTeamId' => $winnerTip['teamId'] ?? null,
    ]);
}
