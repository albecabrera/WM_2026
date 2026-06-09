<?php
// Bracket KO: matchNumber → siguiente partido y slot. Igual que en results/advance de Next.js.

const BRACKET = [
    73 => ['next' => 89, 'slot' => 'home'],  74 => ['next' => 89, 'slot' => 'away'],
    75 => ['next' => 90, 'slot' => 'home'],  76 => ['next' => 90, 'slot' => 'away'],
    77 => ['next' => 91, 'slot' => 'home'],  78 => ['next' => 91, 'slot' => 'away'],
    79 => ['next' => 92, 'slot' => 'home'],  80 => ['next' => 92, 'slot' => 'away'],
    81 => ['next' => 93, 'slot' => 'home'],  82 => ['next' => 93, 'slot' => 'away'],
    83 => ['next' => 94, 'slot' => 'home'],  84 => ['next' => 94, 'slot' => 'away'],
    85 => ['next' => 95, 'slot' => 'home'],  86 => ['next' => 95, 'slot' => 'away'],
    87 => ['next' => 96, 'slot' => 'home'],  88 => ['next' => 96, 'slot' => 'away'],
    89 => ['next' => 97, 'slot' => 'home'],  90 => ['next' => 97, 'slot' => 'away'],
    91 => ['next' => 98, 'slot' => 'home'],  92 => ['next' => 98, 'slot' => 'away'],
    93 => ['next' => 99, 'slot' => 'home'],  94 => ['next' => 99, 'slot' => 'away'],
    95 => ['next' => 100, 'slot' => 'home'], 96 => ['next' => 100, 'slot' => 'away'],
    97 => ['next' => 101, 'slot' => 'home'], 98 => ['next' => 101, 'slot' => 'away'],
    99 => ['next' => 102, 'slot' => 'home'], 100 => ['next' => 102, 'slot' => 'away'],
];

// Semifinales: ganador → Final, perdedor → 3er puesto.
const SF_BRACKET = [
    101 => ['winnerNext' => 104, 'winnerSlot' => 'home', 'loserNext' => 103, 'loserSlot' => 'home'],
    102 => ['winnerNext' => 104, 'winnerSlot' => 'away', 'loserNext' => 103, 'loserSlot' => 'away'],
];

function set_match_slot(int $matchNumber, string $slot, ?string $teamId): void {
    $col = $slot === 'home' ? 'homeTeamId' : 'awayTeamId';
    $st = db()->prepare("UPDATE \"Match\" SET $col = ? WHERE matchNumber = ?");
    $st->execute([$teamId, $matchNumber]);
}

/** Avanza ganador (y perdedor en SF) al siguiente partido. Devuelve true si había bracket. */
function advance_team(string $winnerId, ?string $loserId, int $matchNumber): bool {
    if (isset(BRACKET[$matchNumber])) {
        $b = BRACKET[$matchNumber];
        set_match_slot($b['next'], $b['slot'], $winnerId);
        return true;
    }
    if (isset(SF_BRACKET[$matchNumber])) {
        $b = SF_BRACKET[$matchNumber];
        set_match_slot($b['winnerNext'], $b['winnerSlot'], $winnerId);
        if ($loserId) {
            set_match_slot($b['loserNext'], $b['loserSlot'], $loserId);
        }
        return true;
    }
    return false;
}
