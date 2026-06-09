<?php
// GET /api/matches?phase=&group=&upcoming=true — partidos con equipos y tipp propio.

function matches_get(): void {
    $session = require_session();

    $phase = query_param('phase');
    $group = query_param('group');
    $upcoming = query_param('upcoming') === 'true';

    $where = [];
    $params = [];
    if ($phase) { $where[] = 'phase = ?'; $params[] = $phase; }
    if ($group) { $where[] = '"group" = ?'; $params[] = $group; }
    if ($upcoming) {
        $where[] = 'kickoff >= ?';
        $where[] = "status = 'UPCOMING'";
        $params[] = now_iso();
    }

    $sql = 'SELECT * FROM "Match"'
        . ($where ? ' WHERE ' . implode(' AND ', $where) : '')
        . ' ORDER BY kickoff ASC'
        . ($upcoming ? ' LIMIT 10' : '');

    $st = db()->prepare($sql);
    $st->execute($params);
    $matches = array_map('match_with_teams', $st->fetchAll());

    if ($session['role'] !== 'ADMIN' && $matches) {
        $ids = array_column($matches, 'id');
        $ph = implode(',', array_fill(0, count($ids), '?'));
        $st = db()->prepare("SELECT * FROM \"Tip\" WHERE userId = ? AND matchId IN ($ph)");
        $st->execute(array_merge([$session['id']], $ids));
        $tipMap = [];
        foreach ($st->fetchAll() as $t) $tipMap[$t['matchId']] = tip_json($t);

        foreach ($matches as &$m) {
            $m['userTip'] = $tipMap[$m['id']] ?? null;
        }
        unset($m);
    }

    json_out($matches);
}
