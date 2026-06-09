<?php
// Port de src/lib/points.ts — sistema de puntos del Tipp-Spiel.

function calculate_points(int $tipHome, int $tipAway, int $actualHome, int $actualAway): int {
    if ($tipHome === $actualHome && $tipAway === $actualAway) return 3;

    $tipDiff = $tipHome - $tipAway;
    $actualDiff = $actualHome - $actualAway;
    if ($tipDiff === $actualDiff) return 2;

    if (($tipDiff <=> 0) === ($actualDiff <=> 0)) return 1;

    return 0;
}
