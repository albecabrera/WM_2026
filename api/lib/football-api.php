<?php
// Port de src/lib/teams-data.ts + src/lib/football-api.ts.
// Cliente de football-data.org (v4, competición WC). Sin FOOTBALL_API_KEY todo es no-op.

const TEAM_BY_CODE = [
    // CONCACAF
    'USA' => ['name' => 'Vereinigte Staaten', 'flagEmoji' => '🇺🇸'],
    'MEX' => ['name' => 'Mexiko', 'flagEmoji' => '🇲🇽'],
    'CAN' => ['name' => 'Kanada', 'flagEmoji' => '🇨🇦'],
    'CRC' => ['name' => 'Costa Rica', 'flagEmoji' => '🇨🇷'],
    'PAN' => ['name' => 'Panama', 'flagEmoji' => '🇵🇦'],
    'HON' => ['name' => 'Honduras', 'flagEmoji' => '🇭🇳'],
    'JAM' => ['name' => 'Jamaika', 'flagEmoji' => '🇯🇲'],
    'HAI' => ['name' => 'Haiti', 'flagEmoji' => '🇭🇹'],
    'CUW' => ['name' => 'Curaçao', 'flagEmoji' => '🇨🇼'],
    // CONMEBOL
    'ARG' => ['name' => 'Argentinien', 'flagEmoji' => '🇦🇷'],
    'BRA' => ['name' => 'Brasilien', 'flagEmoji' => '🇧🇷'],
    'URU' => ['name' => 'Uruguay', 'flagEmoji' => '🇺🇾'],
    'COL' => ['name' => 'Kolumbien', 'flagEmoji' => '🇨🇴'],
    'ECU' => ['name' => 'Ecuador', 'flagEmoji' => '🇪🇨'],
    'PER' => ['name' => 'Peru', 'flagEmoji' => '🇵🇪'],
    'CHI' => ['name' => 'Chile', 'flagEmoji' => '🇨🇱'],
    'PAR' => ['name' => 'Paraguay', 'flagEmoji' => '🇵🇾'],
    'VEN' => ['name' => 'Venezuela', 'flagEmoji' => '🇻🇪'],
    'BOL' => ['name' => 'Bolivien', 'flagEmoji' => '🇧🇴'],
    // UEFA
    'GER' => ['name' => 'Deutschland', 'flagEmoji' => '🇩🇪'],
    'FRA' => ['name' => 'Frankreich', 'flagEmoji' => '🇫🇷'],
    'ESP' => ['name' => 'Spanien', 'flagEmoji' => '🇪🇸'],
    'ENG' => ['name' => 'England', 'flagEmoji' => '🏴󠁧󠁢󠁥󠁮󠁧󠁿'],
    'POR' => ['name' => 'Portugal', 'flagEmoji' => '🇵🇹'],
    'NED' => ['name' => 'Niederlande', 'flagEmoji' => '🇳🇱'],
    'BEL' => ['name' => 'Belgien', 'flagEmoji' => '🇧🇪'],
    'ITA' => ['name' => 'Italien', 'flagEmoji' => '🇮🇹'],
    'CRO' => ['name' => 'Kroatien', 'flagEmoji' => '🇭🇷'],
    'SUI' => ['name' => 'Schweiz', 'flagEmoji' => '🇨🇭'],
    'AUT' => ['name' => 'Österreich', 'flagEmoji' => '🇦🇹'],
    'POL' => ['name' => 'Polen', 'flagEmoji' => '🇵🇱'],
    'UKR' => ['name' => 'Ukraine', 'flagEmoji' => '🇺🇦'],
    'SRB' => ['name' => 'Serbien', 'flagEmoji' => '🇷🇸'],
    'BIH' => ['name' => 'Bosnien-Herzegowina', 'flagEmoji' => '🇧🇦'],
    'TUR' => ['name' => 'Türkei', 'flagEmoji' => '🇹🇷'],
    'CZE' => ['name' => 'Tschechien', 'flagEmoji' => '🇨🇿'],
    'WAL' => ['name' => 'Wales', 'flagEmoji' => '🏴󠁧󠁢󠁷󠁬󠁳󠁿'],
    'SCO' => ['name' => 'Schottland', 'flagEmoji' => '🏴󠁧󠁢󠁳󠁣󠁴󠁿'],
    'DEN' => ['name' => 'Dänemark', 'flagEmoji' => '🇩🇰'],
    'SWE' => ['name' => 'Schweden', 'flagEmoji' => '🇸🇪'],
    'NOR' => ['name' => 'Norwegen', 'flagEmoji' => '🇳🇴'],
    'ROU' => ['name' => 'Rumänien', 'flagEmoji' => '🇷🇴'],
    'SVK' => ['name' => 'Slowakei', 'flagEmoji' => '🇸🇰'],
    'ALB' => ['name' => 'Albanien', 'flagEmoji' => '🇦🇱'],
    'GRE' => ['name' => 'Griechenland', 'flagEmoji' => '🇬🇷'],
    'HUN' => ['name' => 'Ungarn', 'flagEmoji' => '🇭🇺'],
    // AFC
    'JPN' => ['name' => 'Japan', 'flagEmoji' => '🇯🇵'],
    'KOR' => ['name' => 'Südkorea', 'flagEmoji' => '🇰🇷'],
    'IRN' => ['name' => 'Iran', 'flagEmoji' => '🇮🇷'],
    'AUS' => ['name' => 'Australien', 'flagEmoji' => '🇦🇺'],
    'KSA' => ['name' => 'Saudi-Arabien', 'flagEmoji' => '🇸🇦'],
    'QAT' => ['name' => 'Katar', 'flagEmoji' => '🇶🇦'],
    'IRQ' => ['name' => 'Irak', 'flagEmoji' => '🇮🇶'],
    'UZB' => ['name' => 'Usbekistan', 'flagEmoji' => '🇺🇿'],
    'IDN' => ['name' => 'Indonesien', 'flagEmoji' => '🇮🇩'],
    'JOR' => ['name' => 'Jordanien', 'flagEmoji' => '🇯🇴'],
    // CAF
    'MAR' => ['name' => 'Marokko', 'flagEmoji' => '🇲🇦'],
    'SEN' => ['name' => 'Senegal', 'flagEmoji' => '🇸🇳'],
    'NGA' => ['name' => 'Nigeria', 'flagEmoji' => '🇳🇬'],
    'CMR' => ['name' => 'Kamerun', 'flagEmoji' => '🇨🇲'],
    'EGY' => ['name' => 'Ägypten', 'flagEmoji' => '🇪🇬'],
    'ALG' => ['name' => 'Algerien', 'flagEmoji' => '🇩🇿'],
    'TUN' => ['name' => 'Tunesien', 'flagEmoji' => '🇹🇳'],
    'GHA' => ['name' => 'Ghana', 'flagEmoji' => '🇬🇭'],
    'CIV' => ['name' => 'Elfenbeinküste', 'flagEmoji' => '🇨🇮'],
    'RSA' => ['name' => 'Südafrika', 'flagEmoji' => '🇿🇦'],
    'CPV' => ['name' => 'Kap Verde', 'flagEmoji' => '🇨🇻'],
    'COD' => ['name' => 'DR Kongo', 'flagEmoji' => '🇨🇩'],
    // OFC
    'NZL' => ['name' => 'Neuseeland', 'flagEmoji' => '🇳🇿'],
];

const NAME_TO_CODE = [
    'united states' => 'USA', 'usa' => 'USA', 'mexico' => 'MEX', 'canada' => 'CAN',
    'argentina' => 'ARG', 'brazil' => 'BRA', 'uruguay' => 'URU', 'colombia' => 'COL',
    'germany' => 'GER', 'france' => 'FRA', 'spain' => 'ESP', 'england' => 'ENG',
    'portugal' => 'POR', 'netherlands' => 'NED', 'belgium' => 'BEL', 'italy' => 'ITA',
    'croatia' => 'CRO', 'switzerland' => 'SUI', 'austria' => 'AUT', 'poland' => 'POL',
    'japan' => 'JPN', 'south korea' => 'KOR', 'korea republic' => 'KOR', 'iran' => 'IRN',
    'australia' => 'AUS', 'saudi arabia' => 'KSA', 'qatar' => 'QAT', 'morocco' => 'MAR',
    'senegal' => 'SEN', 'nigeria' => 'NGA', 'cameroon' => 'CMR', 'egypt' => 'EGY',
    'algeria' => 'ALG', 'tunisia' => 'TUN', 'new zealand' => 'NZL',
];

function resolve_team(?string $tla, string $apiName): array {
    $code = strtoupper($tla ?? '');
    if ($code && isset(TEAM_BY_CODE[$code])) {
        return TEAM_BY_CODE[$code] + ['shortName' => $code];
    }
    $byName = NAME_TO_CODE[strtolower(trim($apiName))] ?? null;
    if ($byName && isset(TEAM_BY_CODE[$byName])) {
        return TEAM_BY_CODE[$byName] + ['shortName' => $byName];
    }
    return [
        'name' => $apiName,
        'shortName' => $code ?: strtoupper(mb_substr($apiName, 0, 3)),
        'flagEmoji' => '🏳️',
    ];
}

function has_api_key(): bool {
    return (bool)config('FOOTBALL_API_KEY');
}

const STAGE_MAP = [
    'GROUP_STAGE' => ['phase' => 'GROUP', 'round' => null],
    'LAST_32' => ['phase' => 'ROUND_OF_32', 'round' => 'R32'],
    'ROUND_OF_32' => ['phase' => 'ROUND_OF_32', 'round' => 'R32'],
    'LAST_16' => ['phase' => 'ROUND_OF_16', 'round' => 'R16'],
    'ROUND_OF_16' => ['phase' => 'ROUND_OF_16', 'round' => 'R16'],
    'QUARTER_FINALS' => ['phase' => 'QUARTER_FINAL', 'round' => 'QF'],
    'SEMI_FINALS' => ['phase' => 'SEMI_FINAL', 'round' => 'SF'],
    'THIRD_PLACE' => ['phase' => 'SEMI_FINAL', 'round' => '3RD'],
    'FINAL' => ['phase' => 'FINAL', 'round' => 'FINAL'],
];

function map_api_status(string $s): string {
    switch ($s) {
        case 'IN_PLAY':
        case 'PAUSED':
            return 'LIVE';
        case 'FINISHED':
        case 'AWARDED':
            return 'FINISHED';
        default:
            return 'UPCOMING';
    }
}

function normalize_api_team(?array $t): ?array {
    if (!$t || empty($t['id'])) return null;
    $info = resolve_team($t['tla'] ?? null, $t['name'] ?? $t['shortName'] ?? '');
    return [
        'externalId' => (int)$t['id'],
        'name' => $info['name'],
        'shortName' => $info['shortName'],
        'flagEmoji' => $info['flagEmoji'],
    ];
}

function normalize_api_match(array $m): ?array {
    if (empty($m['id'])) return null;
    $stage = STAGE_MAP[$m['stage'] ?? ''] ?? ['phase' => 'GROUP', 'round' => null];
    $score = $m['score']['fullTime'] ?? [];
    $group = null;
    if ($stage['phase'] === 'GROUP' && !empty($m['group']) && preg_match('/GROUP_([A-L])/i', $m['group'], $mm)) {
        $group = strtoupper($mm[1]);
    }
    $kickoff = gmdate('Y-m-d\TH:i:s', strtotime($m['utcDate'])) . '.000Z';
    return [
        'externalId' => (int)$m['id'],
        'phase' => $stage['phase'],
        'group' => $group,
        'round' => $stage['round'],
        'kickoff' => $kickoff,
        'venue' => $m['venue'] ?? '—',
        'status' => map_api_status($m['status'] ?? ''),
        'homeGoals' => is_int($score['home'] ?? null) ? $score['home'] : null,
        'awayGoals' => is_int($score['away'] ?? null) ? $score['away'] : null,
        'homeTeam' => normalize_api_team($m['homeTeam'] ?? null),
        'awayTeam' => normalize_api_team($m['awayTeam'] ?? null),
    ];
}

function fetch_world_cup_matches(): array {
    $key = config('FOOTBALL_API_KEY');
    if (!$key) throw new RuntimeException('FOOTBALL_API_KEY fehlt');

    $base = config('FOOTBALL_API_BASE', 'https://api.football-data.org/v4');
    $competition = config('FOOTBALL_API_COMPETITION', 'WC');

    $ch = curl_init("$base/competitions/$competition/matches");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ["X-Auth-Token: $key"],
        CURLOPT_TIMEOUT => 25,
    ]);
    $body = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($body === false) throw new RuntimeException("football-data: $err");
    if ($status < 200 || $status >= 300) {
        throw new RuntimeException("football-data $status: " . substr((string)$body, 0, 200));
    }

    $data = json_decode($body, true);
    $out = [];
    foreach (($data['matches'] ?? []) as $m) {
        $n = normalize_api_match($m);
        if ($n) $out[] = $n;
    }
    return $out;
}
