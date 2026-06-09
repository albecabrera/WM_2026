<?php
// GET /api/teams — todos los equipos.

function teams_get(): void {
    require_session();

    $rows = db()->query('SELECT * FROM "Team" ORDER BY "group" ASC, name ASC')->fetchAll();
    json_out(array_map('team_json', $rows));
}
