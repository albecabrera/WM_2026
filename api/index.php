<?php
// Router del backend PHP. Apache reescribe /api/* → /api/index.php.
// Cada ruta replica el contrato JSON de la antigua API de Next.js.

require_once __DIR__ . '/lib/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];

// Path después de /api/ (p.ej. "tips/winner")
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$path = trim(preg_replace('#^.*?/api/?#', '', $uri), '/');

$routes = [
    'auth' => ['POST' => 'auth_login'],
    'auth/logout' => ['GET' => 'auth_logout'],
    'me' => ['GET' => 'me_get'],
    'matches' => ['GET' => 'matches_get'],
    'teams' => ['GET' => 'teams_get'],
    'tips' => ['GET' => 'tips_get', 'POST' => 'tips_post'],
    'tips/winner' => ['GET' => 'tips_winner_get', 'POST' => 'tips_winner_post'],
    'leaderboard' => ['GET' => 'leaderboard_get'],
    'leaderboard/groups' => ['GET' => 'leaderboard_groups_get'],
    'results' => ['POST' => 'results_post'],
    'results/winner' => ['POST' => 'results_winner_post'],
    'admin' => ['GET' => 'admin_get', 'POST' => 'admin_post'],
    'admin/advance' => ['POST' => 'admin_advance_post'],
    'admin/reset-code' => ['POST' => 'admin_reset_code_post'],
    'admin/ko' => ['GET' => 'admin_ko_get', 'PUT' => 'admin_ko_put'],
    'admin/klassenliste' => ['GET' => 'admin_klassenliste_get'],
    'admin/teachers' => ['GET' => 'admin_teachers_get'],
    'sync' => ['GET' => 'sync_get', 'POST' => 'sync_post'],
];

if (!isset($routes[$path])) {
    json_error('Nicht gefunden', 404);
}
if (!isset($routes[$path][$method])) {
    json_error('Methode nicht erlaubt', 405);
}

$handler = $routes[$path][$method];
$file = explode('_', $handler)[0];
require_once __DIR__ . '/routes/' . $file . '.php';

try {
    $handler();
} catch (Throwable $e) {
    error_log('[wm-api] ' . $e->getMessage());
    json_error('Serverfehler', 500);
}
