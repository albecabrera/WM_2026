<?php
// POST /api/auth — login por código. GET /api/auth/logout — borra cookie y redirige.

function auth_login(): void {
    $body = body_json();
    $loginCode = $body['loginCode'] ?? null;

    if (!$loginCode) json_error('Login-Code fehlt', 400);

    $normalized = strtolower(trim((string)$loginCode));

    $st = db()->prepare('SELECT * FROM "User" WHERE loginCode = ?');
    $st->execute([$normalized]);
    $user = $st->fetch();

    if (!$user) json_error('Ungültiger Login-Code', 401);

    $token = jwt_sign([
        'id' => $user['id'],
        'name' => $user['name'],
        'classCode' => $user['classCode'],
        'role' => $user['role'],
        'loginCode' => $user['loginCode'],
    ]);

    set_session_cookie($token);
    json_out(['success' => true, 'role' => $user['role']]);
}

function auth_logout(): void {
    clear_session_cookie();
    header('Location: /login/', true, 302);
    exit;
}
