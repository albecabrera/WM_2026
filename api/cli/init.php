<?php
// Inicializa la base SQLite: esquema + seed (port de prisma/schema.prisma + seed.ts).
// Solo CLI:  php api/cli/init.php [--force]
// Con --force borra y recrea todos los datos (¡destruye tipps existentes!).

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('CLI only');
}

require_once dirname(__DIR__) . '/lib/bootstrap.php';

$force = in_array('--force', $argv, true);

if (file_exists(WM_DB_FILE) && !$force) {
    $count = 0;
    try {
        $count = (int)db()->query('SELECT COUNT(*) FROM "User"')->fetchColumn();
    } catch (Throwable $e) {
        // tabla no existe aún → seguir con init
    }
    if ($count > 0) {
        exit("DB ya inicializada ($count usuarios). Usa --force para recrear (BORRA todo).\n");
    }
}

$pdo = db();

echo "Creando esquema...\n";

$pdo->exec('DROP TABLE IF EXISTS "Tip"');
$pdo->exec('DROP TABLE IF EXISTS "TournamentWinnerTip"');
$pdo->exec('DROP TABLE IF EXISTS "Match"');
$pdo->exec('DROP TABLE IF EXISTS "Team"');
$pdo->exec('DROP TABLE IF EXISTS "User"');
$pdo->exec('DROP TABLE IF EXISTS "Class"');
$pdo->exec('DROP TABLE IF EXISTS "SyncState"');

$pdo->exec('CREATE TABLE "User" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    classCode TEXT NOT NULL,
    loginCode TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT \'STUDENT\',
    createdAt TEXT NOT NULL
)');
$pdo->exec('CREATE INDEX "User_classCode_idx" ON "User"(classCode)');

$pdo->exec('CREATE TABLE "Class" (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    createdAt TEXT NOT NULL
)');

$pdo->exec('CREATE TABLE "Team" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    shortName TEXT NOT NULL,
    "group" TEXT,
    flagEmoji TEXT NOT NULL,
    externalId INTEGER UNIQUE
)');

$pdo->exec('CREATE TABLE "Match" (
    id TEXT PRIMARY KEY,
    matchNumber INTEGER,
    externalId INTEGER UNIQUE,
    phase TEXT NOT NULL,
    "group" TEXT,
    round TEXT,
    homeTeamId TEXT REFERENCES "Team"(id),
    awayTeamId TEXT REFERENCES "Team"(id),
    kickoff TEXT NOT NULL,
    homeGoals INTEGER,
    awayGoals INTEGER,
    status TEXT NOT NULL DEFAULT \'UPCOMING\',
    venue TEXT NOT NULL
)');

$pdo->exec('CREATE TABLE "Tip" (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES "User"(id),
    matchId TEXT NOT NULL REFERENCES "Match"(id),
    homeGoals INTEGER NOT NULL,
    awayGoals INTEGER NOT NULL,
    points INTEGER,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    UNIQUE(userId, matchId)
)');

$pdo->exec('CREATE TABLE "TournamentWinnerTip" (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL UNIQUE REFERENCES "User"(id),
    teamId TEXT NOT NULL REFERENCES "Team"(id),
    points INTEGER
)');

$pdo->exec('CREATE TABLE "SyncState" (
    id TEXT PRIMARY KEY,
    lastSyncAt TEXT,
    lastStatus TEXT,
    updatedAt TEXT NOT NULL
)');

echo "Seeding...\n";

// Kickoffs del seed original: horas locales Europe/Berlin → guardadas en UTC ISO.
function berlin_utc(string $localDateTime, int $plusDays = 0): string {
    $dt = new DateTime($localDateTime, new DateTimeZone('Europe/Berlin'));
    if ($plusDays > 0) $dt->modify("+$plusDays days");
    $dt->setTimezone(new DateTimeZone('UTC'));
    return $dt->format('Y-m-d\TH:i:s') . '.000Z';
}

$teams = [
    // Gruppe A
    ['Mexiko', 'MEX', 'A', '🇲🇽'], ['Südafrika', 'RSA', 'A', '🇿🇦'],
    ['Südkorea', 'KOR', 'A', '🇰🇷'], ['Tschechien', 'CZE', 'A', '🇨🇿'],
    // Gruppe B
    ['Kanada', 'CAN', 'B', '🇨🇦'], ['Bosnien-Herzegowina', 'BIH', 'B', '🇧🇦'],
    ['Katar', 'QAT', 'B', '🇶🇦'], ['Schweiz', 'SUI', 'B', '🇨🇭'],
    // Gruppe C
    ['Brasilien', 'BRA', 'C', '🇧🇷'], ['Marokko', 'MAR', 'C', '🇲🇦'],
    ['Haiti', 'HAI', 'C', '🇭🇹'], ['Schottland', 'SCO', 'C', '🏴󠁧󠁢󠁳󠁣󠁴󠁿'],
    // Gruppe D
    ['Vereinigte Staaten', 'USA', 'D', '🇺🇸'], ['Paraguay', 'PAR', 'D', '🇵🇾'],
    ['Australien', 'AUS', 'D', '🇦🇺'], ['Türkei', 'TUR', 'D', '🇹🇷'],
    // Gruppe E
    ['Deutschland', 'GER', 'E', '🇩🇪'], ['Curaçao', 'CUW', 'E', '🇨🇼'],
    ['Elfenbeinküste', 'CIV', 'E', '🇨🇮'], ['Ecuador', 'ECU', 'E', '🇪🇨'],
    // Gruppe F
    ['Niederlande', 'NED', 'F', '🇳🇱'], ['Japan', 'JPN', 'F', '🇯🇵'],
    ['Schweden', 'SWE', 'F', '🇸🇪'], ['Tunesien', 'TUN', 'F', '🇹🇳'],
    // Gruppe G
    ['Belgien', 'BEL', 'G', '🇧🇪'], ['Ägypten', 'EGY', 'G', '🇪🇬'],
    ['Iran', 'IRN', 'G', '🇮🇷'], ['Neuseeland', 'NZL', 'G', '🇳🇿'],
    // Gruppe H
    ['Spanien', 'ESP', 'H', '🇪🇸'], ['Kap Verde', 'CPV', 'H', '🇨🇻'],
    ['Saudi-Arabien', 'KSA', 'H', '🇸🇦'], ['Uruguay', 'URU', 'H', '🇺🇾'],
    // Gruppe I
    ['Frankreich', 'FRA', 'I', '🇫🇷'], ['Senegal', 'SEN', 'I', '🇸🇳'],
    ['Irak', 'IRQ', 'I', '🇮🇶'], ['Norwegen', 'NOR', 'I', '🇳🇴'],
    // Gruppe J
    ['Argentinien', 'ARG', 'J', '🇦🇷'], ['Algerien', 'ALG', 'J', '🇩🇿'],
    ['Österreich', 'AUT', 'J', '🇦🇹'], ['Jordanien', 'JOR', 'J', '🇯🇴'],
    // Gruppe K
    ['Portugal', 'POR', 'K', '🇵🇹'], ['DR Kongo', 'COD', 'K', '🇨🇩'],
    ['Usbekistan', 'UZB', 'K', '🇺🇿'], ['Kolumbien', 'COL', 'K', '🇨🇴'],
    // Gruppe L
    ['England', 'ENG', 'L', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'], ['Kroatien', 'CRO', 'L', '🇭🇷'],
    ['Ghana', 'GHA', 'L', '🇬🇭'], ['Panama', 'PAN', 'L', '🇵🇦'],
];

$insTeam = $pdo->prepare('INSERT INTO "Team" (id, name, shortName, "group", flagEmoji, externalId) VALUES (?, ?, ?, ?, ?, NULL)');
$teamIdByShort = [];
$teamsByGroup = [];
foreach ($teams as [$name, $short, $group, $flag]) {
    $id = cuid();
    $insTeam->execute([$id, $name, $short, $group, $flag]);
    $teamIdByShort[$short] = $id;
    $teamsByGroup[$group][] = $id;
}
echo 'Created ' . count($teams) . " teams\n";

// ── Clases activas ────────────────────────────────────────────────────────────
$insClass = $pdo->prepare('INSERT INTO "Class" (id, code, name, createdAt) VALUES (?, ?, ?, ?)');
$insClass->execute([cuid(), 'gelb', 'Gelb', now_iso()]);
$insClass->execute([cuid(), 'k4', 'Klasse 4', now_iso()]);

// ── Usuarios ──────────────────────────────────────────────────────────────────
$insUser = $pdo->prepare('INSERT INTO "User" (id, name, classCode, loginCode, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)');

$insUser->execute([cuid(), 'Admin', 'admin', 'admin2026', 'ADMIN', now_iso()]);

$gelbStudents = [
    'Rasenrakete','Ballblitz','Netzninja','Elferzauber','Torwirbel',
    'Flankenfuchs','Ballkomet','Netzphantom','Dribbeldynamo','Torsturm',
    'Rasenregenbogen','Elferkobold','Flankenflummi','Ballvulkan','Netzgecko',
    'Tornebel','Rasenotter','Ballzauber','Flankenstern','Netzfunke',
    'Torfeder','Rasenmeteor','Ballorkan','Elferblitz','Netzkomet',
    'Flankenzauber','Torphantom','Dribbeldrache','Rasensturm','Balladler',
];
$gelbTeachers = [['Cabrera', 'lehrerinca'], ['Owji', 'lehrerow']];

$k4Students = [
    'Sturmheld','Torjager','Spielmagier','Laufstar','Passmeister',
    'Schusszauber','Dribbelmacher','Raumdeuter','Vollstrecker','Spielmacher',
    'Flankenheld','Abwehrheld','Spielfeldstar','Schussmeister','Torwachter',
    'Elferschuss','Freistossstar','Eckballstar','Konterheld','Steilpasser',
    'Tempoheld','Kopfballstar','Dribbelheld','Ballwachter','Spielfuhrer',
    'Torhelfer','Flankenstar','Abwehrzauber','Mittelfeldstar','Schussgeist',
];
$k4Teachers = [['Venedey', 'lehrerinve'], ['Cabrera', 'lehrerca']];

foreach (['gelb' => [$gelbStudents, $gelbTeachers], 'k4' => [$k4Students, $k4Teachers]] as $classCode => [$students, $teachers]) {
    foreach ($students as $name) {
        $insUser->execute([cuid(), $name, $classCode, strtolower($name) . '-' . $classCode, 'STUDENT', now_iso()]);
    }
    foreach ($teachers as [$name, $loginCode]) {
        $insUser->execute([cuid(), $name, $classCode, $loginCode, 'TEACHER', now_iso()]);
    }
}
echo "Created 2 classes, 60 students, 4 teachers, 1 admin\n";

// ── Partidos de grupos ────────────────────────────────────────────────────────
$groupConfig = [
    'A' => ['2026-06-11', 0,  ['MetLife Stadium', 'SoFi Stadium', 'AT&T Stadium']],
    'B' => ['2026-06-12', 6,  ["Levi's Stadium", 'Rose Bowl', 'Arrowhead Stadium']],
    'C' => ['2026-06-12', 12, ['Hard Rock Stadium', 'NRG Stadium', 'Empower Field']],
    'D' => ['2026-06-13', 18, ['MetLife Stadium', 'AT&T Stadium', 'BC Place']],
    'E' => ['2026-06-13', 24, ['SoFi Stadium', "Levi's Stadium", 'Estadio Azteca']],
    'F' => ['2026-06-14', 30, ['Allianz Field', 'Rose Bowl', 'Q2 Stadium']],
    'G' => ['2026-06-14', 36, ['NRG Stadium', 'Hard Rock Stadium', 'MetLife Stadium']],
    'H' => ['2026-06-15', 42, ['AT&T Stadium', 'Empower Field', 'SoFi Stadium']],
    'I' => ['2026-06-15', 48, ['Estadio Azteca', 'BC Place', "Levi's Stadium"]],
    'J' => ['2026-06-16', 54, ['Rose Bowl', 'NRG Stadium', 'Hard Rock Stadium']],
    'K' => ['2026-06-16', 60, ['MetLife Stadium', 'AT&T Stadium', 'Allianz Field']],
    'L' => ['2026-06-17', 66, ['Q2 Stadium', 'SoFi Stadium', 'Empower Field']],
];

$insMatch = $pdo->prepare('INSERT INTO "Match" (id, matchNumber, externalId, phase, "group", round, homeTeamId, awayTeamId, kickoff, homeGoals, awayGoals, status, venue) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, NULL, NULL, \'UPCOMING\', ?)');

$groupCount = 0;
foreach ($groupConfig as $group => [$startDate, $offset, $venues]) {
    [$t1, $t2, $t3, $t4] = $teamsByGroup[$group];
    $pairs = [[$t1,$t2],[$t3,$t4],[$t1,$t3],[$t2,$t4],[$t1,$t4],[$t2,$t3]];
    $venueSeq = [$venues[0], $venues[1], $venues[2], $venues[0], $venues[1], $venues[2]];
    foreach ($pairs as $i => [$home, $away]) {
        $dayOffset = intdiv($i, 2) * 2 + ($i % 2);
        $hour = $i % 2 === 0 ? '18' : '21';
        $kickoff = berlin_utc("$startDate $hour:00:00", $dayOffset);
        $insMatch->execute([cuid(), $offset + $i + 1, 'GROUP', $group, null, $home, $away, $kickoff, $venueSeq[$i]]);
        $groupCount++;
    }
}
echo "Created $groupCount group matches\n";

// ── Fase KO ───────────────────────────────────────────────────────────────────
$VENUES = ['MetLife Stadium', 'SoFi Stadium', 'AT&T Stadium', 'Hard Rock Stadium'];
$koCount = 0;

// R32 #73–88
for ($i = 0; $i < 16; $i++) {
    $day = 4 + intdiv($i, 4);
    $hour = $i % 2 === 0 ? '18' : '21';
    $insMatch->execute([cuid(), 73 + $i, 'ROUND_OF_32', null, 'R32', null, null, berlin_utc("2026-07-0$day $hour:00:00"), $VENUES[$i % 4]]);
    $koCount++;
}
// R16 #89–96
for ($i = 0; $i < 8; $i++) {
    $day = str_pad((string)(9 + intdiv($i, 4)), 2, '0', STR_PAD_LEFT);
    $hour = $i % 2 === 0 ? '18' : '21';
    $insMatch->execute([cuid(), 89 + $i, 'ROUND_OF_16', null, 'R16', null, null, berlin_utc("2026-07-$day $hour:00:00"), $VENUES[$i % 4]]);
    $koCount++;
}
// QF #97–100
for ($i = 0; $i < 4; $i++) {
    $day = 13 + intdiv($i, 2);
    $hour = $i % 2 === 0 ? '18' : '21';
    $insMatch->execute([cuid(), 97 + $i, 'QUARTER_FINAL', null, 'QF', null, null, berlin_utc("2026-07-$day $hour:00:00"), $VENUES[$i % 4]]);
    $koCount++;
}
// SF, 3er puesto, Final
$insMatch->execute([cuid(), 101, 'SEMI_FINAL', null, 'SF', null, null, berlin_utc('2026-07-17 21:00:00'), 'MetLife Stadium']);
$insMatch->execute([cuid(), 102, 'SEMI_FINAL', null, 'SF', null, null, berlin_utc('2026-07-18 21:00:00'), 'SoFi Stadium']);
$insMatch->execute([cuid(), 103, 'SEMI_FINAL', null, '3RD', null, null, berlin_utc('2026-07-22 21:00:00'), 'AT&T Stadium']);
$insMatch->execute([cuid(), 104, 'FINAL', null, 'FINAL', null, null, berlin_utc('2026-07-26 21:00:00'), 'MetLife Stadium']);
$koCount += 4;

echo "Created $koCount KO matches\n";

$pdo->prepare('INSERT INTO "SyncState" (id, lastSyncAt, lastStatus, updatedAt) VALUES (\'main\', NULL, NULL, ?)')
    ->execute([now_iso()]);

echo 'Total: ' . ($groupCount + $koCount) . " matches\nSeed complete!\n";
