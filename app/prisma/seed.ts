import { PrismaClient, MatchPhase, MatchStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const teams = [
  // Group A
  { name: 'Vereinigte Staaten', shortName: 'USA', group: 'A', flagEmoji: '🇺🇸' },
  { name: 'Mexiko',             shortName: 'MEX', group: 'A', flagEmoji: '🇲🇽' },
  { name: 'Kanada',             shortName: 'CAN', group: 'A', flagEmoji: '🇨🇦' },
  { name: 'Neuseeland',         shortName: 'NZL', group: 'A', flagEmoji: '🇳🇿' },
  // Group B
  { name: 'Argentinien',        shortName: 'ARG', group: 'B', flagEmoji: '🇦🇷' },
  { name: 'Ecuador',            shortName: 'ECU', group: 'B', flagEmoji: '🇪🇨' },
  { name: 'Chile',              shortName: 'CHI', group: 'B', flagEmoji: '🇨🇱' },
  { name: 'Peru',               shortName: 'PER', group: 'B', flagEmoji: '🇵🇪' },
  // Group C
  { name: 'Brasilien',          shortName: 'BRA', group: 'C', flagEmoji: '🇧🇷' },
  { name: 'Kolumbien',          shortName: 'COL', group: 'C', flagEmoji: '🇨🇴' },
  { name: 'Venezuela',          shortName: 'VEN', group: 'C', flagEmoji: '🇻🇪' },
  { name: 'Uruguay',            shortName: 'URU', group: 'C', flagEmoji: '🇺🇾' },
  // Group D
  { name: 'England',            shortName: 'ENG', group: 'D', flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'Frankreich',         shortName: 'FRA', group: 'D', flagEmoji: '🇫🇷' },
  { name: 'Belgien',            shortName: 'BEL', group: 'D', flagEmoji: '🇧🇪' },
  { name: 'Wales',              shortName: 'WAL', group: 'D', flagEmoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  // Group E
  { name: 'Spanien',            shortName: 'ESP', group: 'E', flagEmoji: '🇪🇸' },
  { name: 'Portugal',           shortName: 'POR', group: 'E', flagEmoji: '🇵🇹' },
  { name: 'Türkei',             shortName: 'TUR', group: 'E', flagEmoji: '🇹🇷' },
  { name: 'Tschechien',         shortName: 'CZE', group: 'E', flagEmoji: '🇨🇿' },
  // Group F
  { name: 'Deutschland',        shortName: 'GER', group: 'F', flagEmoji: '🇩🇪' },
  { name: 'Niederlande',        shortName: 'NED', group: 'F', flagEmoji: '🇳🇱' },
  { name: 'Österreich',         shortName: 'AUT', group: 'F', flagEmoji: '🇦🇹' },
  { name: 'Schottland',         shortName: 'SCO', group: 'F', flagEmoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  // Group G
  { name: 'Japan',              shortName: 'JPN', group: 'G', flagEmoji: '🇯🇵' },
  { name: 'Südkorea',           shortName: 'KOR', group: 'G', flagEmoji: '🇰🇷' },
  { name: 'Iran',               shortName: 'IRN', group: 'G', flagEmoji: '🇮🇷' },
  { name: 'Australien',         shortName: 'AUS', group: 'G', flagEmoji: '🇦🇺' },
  // Group H
  { name: 'Marokko',            shortName: 'MAR', group: 'H', flagEmoji: '🇲🇦' },
  { name: 'Senegal',            shortName: 'SEN', group: 'H', flagEmoji: '🇸🇳' },
  { name: 'Nigeria',            shortName: 'NGA', group: 'H', flagEmoji: '🇳🇬' },
  { name: 'Kamerun',            shortName: 'CMR', group: 'H', flagEmoji: '🇨🇲' },
  // Group I
  { name: 'Saudi-Arabien',      shortName: 'KSA', group: 'I', flagEmoji: '🇸🇦' },
  { name: 'Ägypten',            shortName: 'EGY', group: 'I', flagEmoji: '🇪🇬' },
  { name: 'Algerien',           shortName: 'ALG', group: 'I', flagEmoji: '🇩🇿' },
  { name: 'Tunesien',           shortName: 'TUN', group: 'I', flagEmoji: '🇹🇳' },
  // Group J
  { name: 'Kroatien',           shortName: 'CRO', group: 'J', flagEmoji: '🇭🇷' },
  { name: 'Serbien',            shortName: 'SRB', group: 'J', flagEmoji: '🇷🇸' },
  { name: 'Schweiz',            shortName: 'SUI', group: 'J', flagEmoji: '🇨🇭' },
  { name: 'Albanien',           shortName: 'ALB', group: 'J', flagEmoji: '🇦🇱' },
  // Group K
  { name: 'Polen',              shortName: 'POL', group: 'K', flagEmoji: '🇵🇱' },
  { name: 'Ukraine',            shortName: 'UKR', group: 'K', flagEmoji: '🇺🇦' },
  { name: 'Rumänien',           shortName: 'ROU', group: 'K', flagEmoji: '🇷🇴' },
  { name: 'Slowakei',           shortName: 'SVK', group: 'K', flagEmoji: '🇸🇰' },
  // Group L
  { name: 'Katar',              shortName: 'QAT', group: 'L', flagEmoji: '🇶🇦' },
  { name: 'Irak',               shortName: 'IRQ', group: 'L', flagEmoji: '🇮🇶' },
  { name: 'Usbekistan',         shortName: 'UZB', group: 'L', flagEmoji: '🇺🇿' },
  { name: 'Indonesien',         shortName: 'IDN', group: 'L', flagEmoji: '🇮🇩' },
]

// WM 2026 starts June 11, 2026
// Each group plays round-robin: 6 matches per group × 12 groups = 72 group stage matches
// KO: 32 + 16 + 8 + 4 + 1 = 32 matches = 32 total KO (actual: 32 → R16 = 16, QF = 8, SF = 4, 3rd = 1, F = 1 = 32)
// Total = 72 + 32 = 104 matches

function groupMatches(
  group: string,
  teams: { id: string; shortName: string }[],
  startDate: Date,
  matchNumberOffset: number,
  venue1: string,
  venue2: string,
  venue3: string
) {
  const [t1, t2, t3, t4] = teams
  const pairs = [
    [t1, t2],
    [t3, t4],
    [t1, t3],
    [t2, t4],
    [t1, t4],
    [t2, t3],
  ]
  const venues = [venue1, venue2, venue3, venue1, venue2, venue3]
  return pairs.map(([home, away], i) => {
    const d = new Date(startDate)
    d.setDate(d.getDate() + Math.floor(i / 2) * 2 + (i % 2))
    d.setHours(i % 2 === 0 ? 18 : 21, 0, 0, 0)
    return {
      matchNumber: matchNumberOffset + i + 1,
      phase: MatchPhase.GROUP,
      group,
      homeTeamId: home.id,
      awayTeamId: away.id,
      kickoff: d,
      status: MatchStatus.UPCOMING,
      venue: venues[i],
    }
  })
}

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.tip.deleteMany()
  await prisma.tournamentWinnerTip.deleteMany()
  await prisma.match.deleteMany()
  await prisma.team.deleteMany()
  await prisma.user.deleteMany()
  await prisma.class.deleteMany()

  // Create teams
  const createdTeams: { [key: string]: { id: string; shortName: string } } = {}
  for (const team of teams) {
    const t = await prisma.team.create({ data: team })
    createdTeams[team.shortName] = { id: t.id, shortName: t.shortName }
  }
  console.log(`Created ${teams.length} teams`)

  // Create classes
  await prisma.class.createMany({
    data: [
      { code: '5a', name: 'Klasse 5a', teacherCode: 'lehrer5a' },
      { code: '5b', name: 'Klasse 5b', teacherCode: 'lehrer5b' },
      { code: '6a', name: 'Klasse 6a', teacherCode: 'lehrer6a' },
      { code: '6b', name: 'Klasse 6b', teacherCode: 'lehrer6b' },
    ],
  })
  console.log('Created 4 classes')

  // Create admin user
  await prisma.user.create({
    data: {
      name: 'Admin',
      classCode: 'admin',
      loginCode: 'admin2026',
      role: 'ADMIN',
    },
  })

  // Create demo students
  const demoStudents = [
    { name: 'Müller', classCode: '6a', loginCode: 'mueller6a' },
    { name: 'Schmidt', classCode: '6a', loginCode: 'schmidt6a' },
    { name: 'Bauer', classCode: '6b', loginCode: 'bauer6b' },
    { name: 'Weber', classCode: '5a', loginCode: 'weber5a' },
    { name: 'Fischer', classCode: '5b', loginCode: 'fischer5b' },
  ]
  for (const s of demoStudents) {
    await prisma.user.create({ data: { ...s, role: 'STUDENT' } })
  }
  console.log('Created demo users')

  // Group start dates (WM 2026 starts June 11, 2026)
  const groupConfig: {
    [key: string]: { start: Date; offset: number; venues: [string, string, string] }
  } = {
    A: { start: new Date('2026-06-11'), offset: 0,  venues: ['MetLife Stadium', 'SoFi Stadium', 'AT&T Stadium'] },
    B: { start: new Date('2026-06-12'), offset: 6,  venues: ['Levi\'s Stadium', 'Rose Bowl', 'Arrowhead Stadium'] },
    C: { start: new Date('2026-06-12'), offset: 12, venues: ['Hard Rock Stadium', 'NRG Stadium', 'Empower Field'] },
    D: { start: new Date('2026-06-13'), offset: 18, venues: ['MetLife Stadium', 'AT&T Stadium', 'BC Place'] },
    E: { start: new Date('2026-06-13'), offset: 24, venues: ['SoFi Stadium', 'Levi\'s Stadium', 'Estadio Azteca'] },
    F: { start: new Date('2026-06-14'), offset: 30, venues: ['Allianz Field', 'Rose Bowl', 'Q2 Stadium'] },
    G: { start: new Date('2026-06-14'), offset: 36, venues: ['NRG Stadium', 'Hard Rock Stadium', 'MetLife Stadium'] },
    H: { start: new Date('2026-06-15'), offset: 42, venues: ['AT&T Stadium', 'Empower Field', 'SoFi Stadium'] },
    I: { start: new Date('2026-06-15'), offset: 48, venues: ['Estadio Azteca', 'BC Place', 'Levi\'s Stadium'] },
    J: { start: new Date('2026-06-16'), offset: 54, venues: ['Rose Bowl', 'NRG Stadium', 'Hard Rock Stadium'] },
    K: { start: new Date('2026-06-16'), offset: 60, venues: ['MetLife Stadium', 'AT&T Stadium', 'Allianz Field'] },
    L: { start: new Date('2026-06-17'), offset: 66, venues: ['Q2 Stadium', 'SoFi Stadium', 'Empower Field'] },
  }

  const groupLetters = ['A','B','C','D','E','F','G','H','I','J','K','L']
  const teamsByGroup: { [key: string]: { id: string; shortName: string }[] } = {}

  for (const t of teams) {
    if (!teamsByGroup[t.group!]) teamsByGroup[t.group!] = []
    teamsByGroup[t.group!].push(createdTeams[t.shortName])
  }

  let allMatches: any[] = []
  for (const g of groupLetters) {
    const cfg = groupConfig[g]
    const matches = groupMatches(g, teamsByGroup[g], cfg.start, cfg.offset, ...cfg.venues)
    allMatches = [...allMatches, ...matches]
  }

  // KO rounds - placeholder teams (to be updated when groups finish)
  const koRounds = [
    // Round of 32 (32 matches, matchNumber 73-104)
    ...Array.from({ length: 32 }, (_, i) => ({
      matchNumber: 73 + i,
      phase: MatchPhase.ROUND_OF_32,
      round: 'R32',
      homeTeamId: null,
      awayTeamId: null,
      kickoff: new Date(`2026-07-${String(4 + Math.floor(i / 4)).padStart(2,'0')}T18:00:00`),
      status: MatchStatus.UPCOMING,
      venue: ['MetLife Stadium', 'SoFi Stadium', 'AT&T Stadium', 'Hard Rock Stadium'][i % 4],
    })),
  ]

  for (const match of allMatches) {
    await prisma.match.create({ data: match })
  }
  for (const match of koRounds) {
    await prisma.match.create({ data: match })
  }

  console.log(`Created ${allMatches.length + koRounds.length} matches`)
  console.log('Seed complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
