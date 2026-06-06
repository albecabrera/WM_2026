export interface TipResult {
  tipHome: number
  tipAway: number
  actualHome: number
  actualAway: number
}

export function calculatePoints({ tipHome, tipAway, actualHome, actualAway }: TipResult): number {
  // Exact result: 3 points
  if (tipHome === actualHome && tipAway === actualAway) return 3

  const tipDiff = tipHome - tipAway
  const actualDiff = actualHome - actualAway

  // Goal difference correct: 2 points
  if (tipDiff === actualDiff) return 2

  // Tendency correct (win/draw/loss): 1 point
  const tipTendency = Math.sign(tipDiff)
  const actualTendency = Math.sign(actualDiff)
  if (tipTendency === actualTendency) return 1

  return 0
}

export function getTournamentWinnerPoints(correct: boolean): number {
  return correct ? 5 : 0
}

export function getPointsLabel(points: number): string {
  switch (points) {
    case 3: return 'Exaktes Ergebnis'
    case 2: return 'Tordifferenz'
    case 1: return 'Tendenz'
    default: return 'Keine Punkte'
  }
}
