<?php
// GET /api/leaderboard — ranking individual (alumno/profe ven solo su clase;
// admin todas o ?class=). GET /api/leaderboard/groups — ranking por clase.

function leaderboard_players(array $classCodes): array {
    $ph = implode(',', array_fill(0, count($classCodes), '?'));
    $st = db()->prepare(
        "SELECT u.id, u.name, u.classCode, u.role,
                COALESCE((SELECT SUM(t.points) FROM \"Tip\" t WHERE t.userId = u.id AND t.points IS NOT NULL), 0) AS tipPoints,
                COALESCE((SELECT COUNT(*) FROM \"Tip\" t WHERE t.userId = u.id AND t.points IS NOT NULL), 0) AS tipCount,
                COALESCE((SELECT COUNT(*) FROM \"Tip\" t WHERE t.userId = u.id AND t.points = 3), 0) AS exactResults,
                COALESCE((SELECT w.points FROM \"TournamentWinnerTip\" w WHERE w.userId = u.id), 0) AS winnerPoints
         FROM \"User\" u
         WHERE u.role IN ('STUDENT', 'TEACHER') AND u.classCode IN ($ph)"
    );
    $st->execute($classCodes);
    return $st->fetchAll();
}

function leaderboard_get(): void {
    $session = require_session();

    $paramClass = query_param('class');
    $filterClass = $session['role'] === 'ADMIN' ? $paramClass : $session['classCode'];
    $classCodes = $filterClass ? [$filterClass] : all_class_codes();

    $rows = leaderboard_players($classCodes);

    $board = array_map(fn($u) => [
        'id' => $u['id'],
        'name' => $u['name'],
        'classCode' => $u['classCode'],
        'role' => $u['role'],
        'totalPoints' => (int)$u['tipPoints'] + (int)$u['winnerPoints'],
        'tipCount' => (int)$u['tipCount'],
        'exactResults' => (int)$u['exactResults'],
    ], $rows);

    usort($board, fn($a, $b) => $b['totalPoints'] <=> $a['totalPoints']);

    foreach ($board as $i => &$u) $u['rank'] = $i + 1;
    unset($u);

    json_out($board);
}

function leaderboard_groups_get(): void {
    $session = require_session();

    $paramClass = query_param('class');
    $filterClass = $session['role'] === 'ADMIN' ? $paramClass : $session['classCode'];
    $classCodes = $filterClass ? [$filterClass] : all_class_codes();

    $byClass = [];
    foreach ($classCodes as $code) {
        $byClass[$code] = ['totalPoints' => 0, 'memberCount' => 0, 'top' => null];
    }

    foreach (leaderboard_players($classCodes) as $u) {
        if (!isset($byClass[$u['classCode']])) continue;
        $points = (int)$u['tipPoints'] + (int)$u['winnerPoints'];
        $bucket = &$byClass[$u['classCode']];
        $bucket['totalPoints'] += $points;
        $bucket['memberCount'] += 1;
        if (!$bucket['top'] || $points > $bucket['top']['points']) {
            $bucket['top'] = ['name' => $u['name'], 'points' => $points];
        }
        unset($bucket);
    }

    $standings = [];
    foreach ($byClass as $code => $b) {
        $standings[] = [
            'classCode' => $code,
            'totalPoints' => $b['totalPoints'],
            'memberCount' => $b['memberCount'],
            'avgPoints' => $b['memberCount'] ? round($b['totalPoints'] / $b['memberCount'], 1) : 0,
            'topPlayer' => $b['top'],
        ];
    }

    usort($standings, fn($a, $b) => $b['totalPoints'] <=> $a['totalPoints']);
    foreach ($standings as $i => &$g) $g['rank'] = $i + 1;
    unset($g);

    json_out($standings);
}
