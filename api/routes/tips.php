<?php
// GET /api/tips[?matchId=] — tipps del usuario (con partido).
// POST /api/tips — guardar tipp (cierra 5 min antes del kickoff).
// GET/POST /api/tips/winner — tipp del campeón del torneo.

const WINNER_TIP_DEADLINE = '2026-06-11T16:00:00.000Z'; // 18:00 Berlin

function tips_get(): void {
    $session = require_session();
    $matchId = query_param('matchId');

    $sql = 'SELECT * FROM "Tip" WHERE userId = ?';
    $params = [$session['id']];
    if ($matchId) { $sql .= ' AND matchId = ?'; $params[] = $matchId; }

    $st = db()->prepare($sql);
    $st->execute($params);

    $out = [];
    foreach ($st->fetchAll() as $t) {
        $tip = tip_json($t);
        $mst = db()->prepare('SELECT * FROM "Match" WHERE id = ?');
        $mst->execute([$t['matchId']]);
        $match = $mst->fetch();
        $tip['match'] = $match ? match_with_teams($match) : null;
        $out[] = $tip;
    }
    json_out($out);
}

function tips_post(): void {
    $session = get_session();
    if (!$session || $session['role'] === 'ADMIN') json_error('Keine Berechtigung', 403);

    $body = body_json();
    $matchId = $body['matchId'] ?? null;
    $homeGoals = (int)($body['homeGoals'] ?? -1);
    $awayGoals = (int)($body['awayGoals'] ?? -1);

    if ($homeGoals < 0 || $awayGoals < 0 || $homeGoals > 20 || $awayGoals > 20) {
        json_error('Ungültige Tore', 400);
    }

    $st = db()->prepare('SELECT * FROM "Match" WHERE id = ?');
    $st->execute([$matchId]);
    $match = $st->fetch();
    if (!$match) json_error('Spiel nicht gefunden', 404);

    $cutoff = strtotime($match['kickoff']) - 5 * 60;
    if (time() > $cutoff) {
        json_error('Tipps sind geschlossen (Abgabe bis 5 Min. vor Anpfiff)', 400);
    }

    $st = db()->prepare('SELECT * FROM "Tip" WHERE userId = ? AND matchId = ?');
    $st->execute([$session['id'], $matchId]);
    $existing = $st->fetch();

    if ($existing) {
        $st = db()->prepare('UPDATE "Tip" SET homeGoals = ?, awayGoals = ?, updatedAt = ? WHERE id = ?');
        $st->execute([$homeGoals, $awayGoals, now_iso(), $existing['id']]);
        $tipId = $existing['id'];
    } else {
        $tipId = cuid();
        $st = db()->prepare('INSERT INTO "Tip" (id, userId, matchId, homeGoals, awayGoals, points, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NULL, ?, ?)');
        $st->execute([$tipId, $session['id'], $matchId, $homeGoals, $awayGoals, now_iso(), now_iso()]);
    }

    $st = db()->prepare('SELECT * FROM "Tip" WHERE id = ?');
    $st->execute([$tipId]);
    json_out(tip_json($st->fetch()));
}

function winner_tip_with_team(string $userId): ?array {
    $st = db()->prepare('SELECT * FROM "TournamentWinnerTip" WHERE userId = ?');
    $st->execute([$userId]);
    $tip = $st->fetch();
    if (!$tip) return null;

    $team = find_team_by_id($tip['teamId']);
    return [
        'id' => $tip['id'],
        'userId' => $tip['userId'],
        'teamId' => $tip['teamId'],
        'points' => $tip['points'] !== null ? (int)$tip['points'] : null,
        'team' => $team ? [
            'id' => $team['id'],
            'name' => $team['name'],
            'shortName' => $team['shortName'],
            'flagEmoji' => $team['flagEmoji'],
        ] : null,
    ];
}

function tips_winner_get(): void {
    $session = require_session();
    json_out(winner_tip_with_team($session['id']));
}

function tips_winner_post(): void {
    $session = get_session();
    if (!$session || $session['role'] === 'ADMIN') json_error('Keine Berechtigung', 403);

    if (time() >= strtotime(WINNER_TIP_DEADLINE)) {
        json_error('Turniersieger-Tipp ist geschlossen', 400);
    }

    $teamId = body_json()['teamId'] ?? null;
    if (!$teamId) json_error('Team fehlt', 400);

    if (!find_team_by_id($teamId)) json_error('Team nicht gefunden', 404);

    $st = db()->prepare('SELECT id FROM "TournamentWinnerTip" WHERE userId = ?');
    $st->execute([$session['id']]);
    $existing = $st->fetch();

    if ($existing) {
        $st = db()->prepare('UPDATE "TournamentWinnerTip" SET teamId = ? WHERE id = ?');
        $st->execute([$teamId, $existing['id']]);
    } else {
        $st = db()->prepare('INSERT INTO "TournamentWinnerTip" (id, userId, teamId, points) VALUES (?, ?, ?, NULL)');
        $st->execute([cuid(), $session['id'], $teamId]);
    }

    json_out(winner_tip_with_team($session['id']));
}
