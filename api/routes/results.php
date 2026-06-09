<?php
// POST /api/results — guardar resultado real, recalcular puntos, avance KO.
// POST /api/results/winner — revelar campeón y repartir los +5 puntos.

function recalculate_match_points(string $matchId, int $homeGoals, int $awayGoals): int {
    $st = db()->prepare('SELECT * FROM "Tip" WHERE matchId = ?');
    $st->execute([$matchId]);
    $tips = $st->fetchAll();

    $upd = db()->prepare('UPDATE "Tip" SET points = ?, updatedAt = ? WHERE id = ?');
    foreach ($tips as $tip) {
        $points = calculate_points((int)$tip['homeGoals'], (int)$tip['awayGoals'], $homeGoals, $awayGoals);
        $upd->execute([$points, now_iso(), $tip['id']]);
    }
    return count($tips);
}

function results_post(): void {
    require_staff();

    $body = body_json();
    $matchId = $body['matchId'] ?? null;
    $homeGoals = (int)($body['homeGoals'] ?? 0);
    $awayGoals = (int)($body['awayGoals'] ?? 0);

    $st = db()->prepare('SELECT * FROM "Match" WHERE id = ?');
    $st->execute([$matchId]);
    $match = $st->fetch();
    if (!$match) json_error('Spiel nicht gefunden', 404);

    $st = db()->prepare('UPDATE "Match" SET homeGoals = ?, awayGoals = ?, status = \'FINISHED\' WHERE id = ?');
    $st->execute([$homeGoals, $awayGoals, $matchId]);

    $tipsUpdated = recalculate_match_points($matchId, $homeGoals, $awayGoals);

    $advancedTeamName = null;
    $needsPenaltyWinner = false;

    if ($match['phase'] !== 'GROUP' && $match['matchNumber'] !== null) {
        $num = (int)$match['matchNumber'];
        if (isset(BRACKET[$num]) || isset(SF_BRACKET[$num])) {
            if ($homeGoals !== $awayGoals) {
                $winnerId = $homeGoals > $awayGoals ? $match['homeTeamId'] : $match['awayTeamId'];
                $loserId = $homeGoals > $awayGoals ? $match['awayTeamId'] : $match['homeTeamId'];
                advance_team($winnerId, $loserId, $num);
                $winnerTeam = $winnerId ? find_team_by_id($winnerId) : null;
                $advancedTeamName = $winnerTeam['name'] ?? null;
            } else {
                $needsPenaltyWinner = true;
            }
        }
    }

    json_out([
        'success' => true,
        'tipsUpdated' => $tipsUpdated,
        'advancedTeamName' => $advancedTeamName,
        'needsPenaltyWinner' => $needsPenaltyWinner,
        'matchId' => $matchId,
    ]);
}

function results_winner_post(): void {
    require_staff();

    $teamId = body_json()['teamId'] ?? null;
    if (!$teamId) json_error('Team fehlt', 400);

    $team = find_team_by_id($teamId);
    if (!$team) json_error('Team nicht gefunden', 404);

    $tips = db()->query('SELECT * FROM "TournamentWinnerTip"')->fetchAll();
    $correct = 0;

    $upd = db()->prepare('UPDATE "TournamentWinnerTip" SET points = ? WHERE id = ?');
    foreach ($tips as $tip) {
        $points = $tip['teamId'] === $teamId ? 5 : 0;
        $upd->execute([$points, $tip['id']]);
        if ($points === 5) $correct++;
    }

    json_out([
        'success' => true,
        'winner' => team_json($team),
        'tipsTotal' => count($tips),
        'tipsCorrect' => $correct,
    ]);
}
