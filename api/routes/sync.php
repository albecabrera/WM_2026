<?php
// GET /api/sync — sync con football-data.org (throttle 5 min, lo dispara el cliente).
// POST /api/sync?force=1 — sync forzado (solo admin/lehrer).

require_once __DIR__ . '/../lib/football-api.php';

const SYNC_THROTTLE_SECONDS = 300;

function sync_state(): array {
    $row = db()->query('SELECT * FROM "SyncState" WHERE id = \'main\'')->fetch();
    if (!$row) {
        db()->prepare('INSERT INTO "SyncState" (id, lastSyncAt, lastStatus, updatedAt) VALUES (\'main\', NULL, NULL, ?)')
            ->execute([now_iso()]);
        return ['id' => 'main', 'lastSyncAt' => null, 'lastStatus' => null];
    }
    return $row;
}

function sync_state_update(?string $lastSyncAt, string $lastStatus): void {
    $sql = $lastSyncAt
        ? 'UPDATE "SyncState" SET lastSyncAt = ?, lastStatus = ?, updatedAt = ? WHERE id = \'main\''
        : 'UPDATE "SyncState" SET lastStatus = ?, updatedAt = ? WHERE id = \'main\'';
    $params = $lastSyncAt
        ? [$lastSyncAt, $lastStatus, now_iso()]
        : [$lastStatus, now_iso()];
    db()->prepare($sql)->execute($params);
}

function sync_upsert_team(array $t, ?string $group): string {
    $st = db()->prepare('SELECT id FROM "Team" WHERE externalId = ?');
    $st->execute([$t['externalId']]);
    $byExt = $st->fetch();
    if ($byExt) {
        $sql = 'UPDATE "Team" SET name = ?, shortName = ?, flagEmoji = ?' . ($group ? ', "group" = ?' : '') . ' WHERE id = ?';
        $params = [$t['name'], $t['shortName'], $t['flagEmoji']];
        if ($group) $params[] = $group;
        $params[] = $byExt['id'];
        db()->prepare($sql)->execute($params);
        return $byExt['id'];
    }

    $st = db()->prepare('SELECT id FROM "Team" WHERE name = ?');
    $st->execute([$t['name']]);
    $byName = $st->fetch();
    if ($byName) {
        $sql = 'UPDATE "Team" SET externalId = ?, shortName = ?, flagEmoji = ?' . ($group ? ', "group" = ?' : '') . ' WHERE id = ?';
        $params = [$t['externalId'], $t['shortName'], $t['flagEmoji']];
        if ($group) $params[] = $group;
        $params[] = $byName['id'];
        db()->prepare($sql)->execute($params);
        return $byName['id'];
    }

    $id = cuid();
    db()->prepare('INSERT INTO "Team" (id, name, shortName, "group", flagEmoji, externalId) VALUES (?, ?, ?, ?, ?, ?)')
        ->execute([$id, $t['name'], $t['shortName'], $group, $t['flagEmoji'], $t['externalId']]);
    return $id;
}

function run_sync(): array {
    $apiMatches = fetch_world_cup_matches();
    if (!$apiMatches) return ['imported' => 0, 'finished' => 0, 'note' => 'API ohne Spiele'];

    usort($apiMatches, fn($a, $b) => strcmp($a['kickoff'], $b['kickoff']));

    $teamId = [];
    foreach ($apiMatches as $m) {
        foreach ([$m['homeTeam'], $m['awayTeam']] as $t) {
            if ($t && !isset($teamId[$t['externalId']])) {
                $teamId[$t['externalId']] = sync_upsert_team($t, $m['group']);
            }
        }
    }

    $finished = 0;
    $num = 0;
    foreach ($apiMatches as $m) {
        $num++;
        $data = [
            'matchNumber' => $num,
            'phase' => $m['phase'],
            'group' => $m['group'],
            'round' => $m['round'],
            'homeTeamId' => $m['homeTeam'] ? $teamId[$m['homeTeam']['externalId']] : null,
            'awayTeamId' => $m['awayTeam'] ? $teamId[$m['awayTeam']['externalId']] : null,
            'kickoff' => $m['kickoff'],
            'venue' => $m['venue'],
            'status' => $m['status'],
            'homeGoals' => $m['homeGoals'],
            'awayGoals' => $m['awayGoals'],
        ];

        $st = db()->prepare('SELECT id FROM "Match" WHERE externalId = ?');
        $st->execute([$m['externalId']]);
        $existing = $st->fetch();

        if ($existing) {
            $matchId = $existing['id'];
            db()->prepare('UPDATE "Match" SET matchNumber = ?, phase = ?, "group" = ?, round = ?, homeTeamId = ?, awayTeamId = ?, kickoff = ?, venue = ?, status = ?, homeGoals = ?, awayGoals = ? WHERE id = ?')
                ->execute([...array_values($data), $matchId]);
        } else {
            $matchId = cuid();
            db()->prepare('INSERT INTO "Match" (id, externalId, matchNumber, phase, "group", round, homeTeamId, awayTeamId, kickoff, venue, status, homeGoals, awayGoals) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
                ->execute([$matchId, $m['externalId'], ...array_values($data)]);
        }

        if ($m['status'] === 'FINISHED' && $m['homeGoals'] !== null && $m['awayGoals'] !== null) {
            $finished++;
            $st = db()->prepare('SELECT * FROM "Tip" WHERE matchId = ?');
            $st->execute([$matchId]);
            $upd = db()->prepare('UPDATE "Tip" SET points = ?, updatedAt = ? WHERE id = ?');
            foreach ($st->fetchAll() as $tip) {
                $points = calculate_points((int)$tip['homeGoals'], (int)$tip['awayGoals'], $m['homeGoals'], $m['awayGoals']);
                if ($points !== (int)($tip['points'] ?? -1)) {
                    $upd->execute([$points, now_iso(), $tip['id']]);
                }
            }
        }
    }

    // Eliminar partidos placeholder del seed (sin externalId) que nadie tipeó
    db()->exec('DELETE FROM "Match" WHERE externalId IS NULL AND id NOT IN (SELECT DISTINCT matchId FROM "Tip")');

    return ['imported' => count($apiMatches), 'finished' => $finished];
}

function sync_get(): void {
    $session = get_session();
    $isStaff = $session && ($session['role'] === 'ADMIN' || $session['role'] === 'TEACHER');
    $force = $isStaff && query_param('force') === '1';
    $state = sync_state();

    if (!has_api_key()) {
        json_out(['ok' => false, 'reason' => 'no-api-key', 'lastSyncAt' => $state['lastSyncAt']]);
    }

    $fresh = $state['lastSyncAt'] && (time() - strtotime($state['lastSyncAt'])) < SYNC_THROTTLE_SECONDS;
    if ($fresh && !$force) {
        json_out(['ok' => true, 'skipped' => true, 'lastSyncAt' => $state['lastSyncAt'], 'lastStatus' => $state['lastStatus']]);
    }

    try {
        $result = run_sync();
        $lastSyncAt = now_iso();
        $lastStatus = $result['imported'] . ' Spiele, ' . $result['finished'] . ' beendet';
        sync_state_update($lastSyncAt, $lastStatus);
        json_out(array_merge(['ok' => true], $result, ['lastSyncAt' => $lastSyncAt, 'lastStatus' => $lastStatus]));
    } catch (Throwable $e) {
        sync_state_update(null, 'Fehler: ' . $e->getMessage());
        json_out(['ok' => false, 'error' => $e->getMessage()], 502);
    }
}

function sync_post(): void {
    require_staff();
    sync_get();
}
