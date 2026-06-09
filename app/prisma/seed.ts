import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const teams = [
  // Gruppe A
  { name: 'Mexiko',              shortName: 'MEX', group: 'A', flagEmoji: '🇲🇽' },
  { name: 'Südafrika',           shortName: 'RSA', group: 'A', flagEmoji: '🇿🇦' },
  { name: 'Südkorea',            shortName: 'KOR', group: 'A', flagEmoji: '🇰🇷' },
  { name: 'Tschechien',          shortName: 'CZE', group: 'A', flagEmoji: '🇨🇿' },
  // Gruppe B
  { name: 'Kanada',              shortName: 'CAN', group: 'B', flagEmoji: '🇨🇦' },
  { name: 'Bosnien-Herzegowina', shortName: 'BIH', group: 'B', flagEmoji: '🇧🇦' },
  { name: 'Katar',               shortName: 'QAT', group: 'B', flagEmoji: '🇶🇦' },
  { name: 'Schweiz',             shortName: 'SUI', group: 'B', flagEmoji: '🇨🇭' },
  // Gruppe C
  { name: 'Brasilien',           shortName: 'BRA', group: 'C', flagEmoji: '🇧🇷' },
  { name: 'Marokko',             shortName: 'MAR', group: 'C', flagEmoji: '🇲🇦' },
  { name: 'Haiti',               shortName: 'HAI', group: 'C', flagEmoji: '🇭🇹' },
  { name: 'Schottland',          shortName: 'SCO', group: 'C', flagEmoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  // Gruppe D
  { name: 'Vereinigte Staaten',  shortName: 'USA', group: 'D', flagEmoji: '🇺🇸' },
  { name: 'Paraguay',            shortName: 'PAR', group: 'D', flagEmoji: '🇵🇾' },
  { name: 'Australien',          shortName: 'AUS', group: 'D', flagEmoji: '🇦🇺' },
  { name: 'Türkei',              shortName: 'TUR', group: 'D', flagEmoji: '🇹🇷' },
  // Gruppe E
  { name: 'Deutschland',         shortName: 'GER', group: 'E', flagEmoji: '🇩🇪' },
  { name: 'Curaçao',             shortName: 'CUW', group: 'E', flagEmoji: '🇨🇼' },
  { name: 'Elfenbeinküste',      shortName: 'CIV', group: 'E', flagEmoji: '🇨🇮' },
  { name: 'Ecuador',             shortName: 'ECU', group: 'E', flagEmoji: '🇪🇨' },
  // Gruppe F
  { name: 'Niederlande',         shortName: 'NED', group: 'F', flagEmoji: '🇳🇱' },
  { name: 'Japan',               shortName: 'JPN', group: 'F', flagEmoji: '🇯🇵' },
  { name: 'Schweden',            shortName: 'SWE', group: 'F', flagEmoji: '🇸🇪' },
  { name: 'Tunesien',            shortName: 'TUN', group: 'F', flagEmoji: '🇹🇳' },
  // Gruppe G
  { name: 'Belgien',             shortName: 'BEL', group: 'G', flagEmoji: '🇧🇪' },
  { name: 'Ägypten',             shortName: 'EGY', group: 'G', flagEmoji: '🇪🇬' },
  { name: 'Iran',                shortName: 'IRN', group: 'G', flagEmoji: '🇮🇷' },
  { name: 'Neuseeland',          shortName: 'NZL', group: 'G', flagEmoji: '🇳🇿' },
  // Gruppe H
  { name: 'Spanien',             shortName: 'ESP', group: 'H', flagEmoji: '🇪🇸' },
  { name: 'Kap Verde',           shortName: 'CPV', group: 'H', flagEmoji: '🇨🇻' },
  { name: 'Saudi-Arabien',       shortName: 'KSA', group: 'H', flagEmoji: '🇸🇦' },
  { name: 'Uruguay',             shortName: 'URU', group: 'H', flagEmoji: '🇺🇾' },
  // Gruppe I
  { name: 'Frankreich',          shortName: 'FRA', group: 'I', flagEmoji: '🇫🇷' },
  { name: 'Senegal',             shortName: 'SEN', group: 'I', flagEmoji: '🇸🇳' },
  { name: 'Irak',                shortName: 'IRQ', group: 'I', flagEmoji: '🇮🇶' },
  { name: 'Norwegen',            shortName: 'NOR', group: 'I', flagEmoji: '🇳🇴' },
  // Gruppe J
  { name: 'Argentinien',         shortName: 'ARG', group: 'J', flagEmoji: '🇦🇷' },
  { name: 'Algerien',            shortName: 'ALG', group: 'J', flagEmoji: '🇩🇿' },
  { name: 'Österreich',          shortName: 'AUT', group: 'J', flagEmoji: '🇦🇹' },
  { name: 'Jordanien',           shortName: 'JOR', group: 'J', flagEmoji: '🇯🇴' },
  // Gruppe K
  { name: 'Portugal',            shortName: 'POR', group: 'K', flagEmoji: '🇵🇹' },
  { name: 'DR Kongo',            shortName: 'COD', group: 'K', flagEmoji: '🇨🇩' },
  { name: 'Usbekistan',          shortName: 'UZB', group: 'K', flagEmoji: '🇺🇿' },
  { name: 'Kolumbien',           shortName: 'COL', group: 'K', flagEmoji: '🇨🇴' },
  // Gruppe L
  { name: 'England',             shortName: 'ENG', group: 'L', flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'Kroatien',            shortName: 'CRO', group: 'L', flagEmoji: '🇭🇷' },
  { name: 'Ghana',               shortName: 'GHA', group: 'L', flagEmoji: '🇬🇭' },
  { name: 'Panama',              shortName: 'PAN', group: 'L', flagEmoji: '🇵🇦' },
]

function groupMatches(
  group: string,
  ts: { id: string; shortName: string }[],
  startDate: Date,
  matchNumberOffset: number,
  venue1: string, venue2: string, venue3: string
) {
  const [t1, t2, t3, t4] = ts
  const pairs = [[t1,t2],[t3,t4],[t1,t3],[t2,t4],[t1,t4],[t2,t3]]
  const venues = [venue1, venue2, venue3, venue1, venue2, venue3]
  return pairs.map(([home, away], i) => {
    const d = new Date(startDate)
    d.setDate(d.getDate() + Math.floor(i / 2) * 2 + (i % 2))
    d.setHours(i % 2 === 0 ? 18 : 21, 0, 0, 0)
    return {
      matchNumber: matchNumberOffset + i + 1,
      phase: 'GROUP', group,
      homeTeamId: home.id, awayTeamId: away.id,
      kickoff: d, status: 'UPCOMING', venue: venues[i],
    }
  })
}

async function main() {
  console.log('Seeding database...')

  await prisma.tip.deleteMany()
  await prisma.tournamentWinnerTip.deleteMany()
  await prisma.match.deleteMany()
  await prisma.team.deleteMany()
  await prisma.user.deleteMany()
  await prisma.class.deleteMany()

  const createdTeams: Record<string, { id: string; shortName: string }> = {}
  for (const team of teams) {
    const t = await prisma.team.create({ data: team })
    createdTeams[team.shortName] = { id: t.id, shortName: t.shortName }
  }
  console.log(`Created ${teams.length} teams`)

  // ── BBG — Farb-Klassen ──────────────────────────────────────────────────────
  const bbgClasses = [
    { code: 'gelb',    name: 'Gelb'    },
    { code: 'schwarz', name: 'Schwarz' },
    { code: 'gruen',   name: 'Grün'    },
    { code: 'blau',    name: 'Blau'    },
    { code: 'rot',     name: 'Rot'     },
    { code: 'weiss',   name: 'Weiß'    },
  ]
  // ── ESG — Klasse 1–6 (5. Jahrgang) ─────────────────────────────────────────
  const esgClasses = [
    { code: 'k1', name: 'Klasse 1' },
    { code: 'k2', name: 'Klasse 2' },
    { code: 'k3', name: 'Klasse 3' },
    { code: 'k4', name: 'Klasse 4' },
    { code: 'k5', name: 'Klasse 5' },
    { code: 'k6', name: 'Klasse 6' },
  ]
  const classes = [...bbgClasses, ...esgClasses]
  await prisma.class.createMany({ data: classes })

  // ── BBG — 30 student fantasy names per color class ──────────────────────────
  const studentsByClass: Record<string, string[]> = {
    gelb: ['Rasenrakete','Ballblitz','Netzninja','Elferzauber','Torwirbel','Flankenfuchs','Ballkomet','Netzphantom','Dribbeldynamo','Torsturm','Rasenregenbogen','Elferkobold','Flankenflummi','Ballvulkan','Netzgecko','Tornebel','Rasenotter','Ballzauber','Flankenstern','Netzfunke','Torfeder','Rasenmeteor','Ballorkan','Elferblitz','Netzkomet','Flankenzauber','Torphantom','Dribbeldrache','Rasensturm','Balladler'],
    schwarz: ['Netzfalke','Elferstern','Torvulkan','Flankenregen','Ballwirbel','Netzkobold','Rasenfuchs','Torfunke','Ballpanther','Elferkomet','Netzregenbogen','Flankenblitz','Torzauber','Dribbelstern','Rasengepard','Balltornado','Netzsturm','Elfervulkan','Toradler','Flankenmeteor','Ballphantom','Netzotter','Rasenkomet','Torflummi','Elferfunke','Ballrakete','Netzzauber','Flankenpanther','Torkobold','Dribbelkomet'],
    gruen: ['Rasenblitz','Ballstern','Netzfeder','Elferregen','Torfuchs','Flankenkomet','Ballgecko','Netzmeteor','Rasenzauber','Tororkan','Elferadler','Ballotter','Netzwirbel','Flankenfunke','Torregenbogen','Dribbelfalke','Rasenphantom','Ballregen','Netzpanther','Elfermeteor','Torblitz','Flankenkobold','Ballfeder','Netzsturmvogel','Rasenfunke','Torstern','Elferphantom','Ballzauberer','Netzfuchs','Flankenwirbel'],
    blau: ['Torgepard','Rasenvulkan','Ballkompass','Netzrakete','Elferfeder','Torregen','Flankenadler','Ballmeteor','Netzstern','Rasenkobold','Torpanther','Elferorkan','Ballphantasie','Netzblitz','Flankenfeder','Torotter','Rasenadler','Ballfuchs','Netzvulkan','Elferwirbel','Torflitzer','Flankenzauberer','Ballregenbogen','Netzkompass','Rasenmeteorblitz','Torfalke','Elfersternschnuppe','Ballsturm','Netzadler','Flankenphantom'],
    rot: ['Torrakete','Rasenfeder','Ballfunke','Netzorkan','Elferregenbogen','Torzauberer','Flankengepard','Ballkobold','Netzfalke','Rasenstern','Torvogel','Elferfuchs','Ballkometenschweif','Netzmeteorblitz','Flankenregenbogen','Torotterblitz','Rasenpanther','Ballorkanblitz','Netzphantasie','Elferzauberer','Torregenvogel','Flankenkompass','Ballvulkanblitz','Netzflummi','Rasenzauberer','Torfunkenflug','Elfergepard','Balladlerflug','Netzregen','Flankensturm'],
    weiss: ['Torwirbelwind','Rasenmeteorflug','Ballsternschnuppe','Netzkometenschweif','Elferfunkenflug','Torregenstern','Flankenvulkan','Ballpantherpfote','Netzadlerschwinge','Rasenfalkenflug','Torzauberstern','Elferwirbelwind','Ballfuchsspur','Netzotterspur','Flankenregenflug','Torblitzstern','Rasenkometenschweif','Ballmeteorflug','Netzvulkanflug','Elferphantasie','Torsturmwind','Flankenfunkenflug','Ballregenstern','Netzzauberflug','Rasenadlerspur','Torfalkenflug','Elferregenwind','Ballkoboldflug','Netzsternschnuppe','Flankenotter'],
  }

  // ── BBG — 2 teacher fantasy names per color class ───────────────────────────
  const bbgTeacherNames = ['Torpantherspur','Rasenzauberwind','Ballgepardspur','Netzfederflug','Elferkompass','Torregenflug','Flankenmeteorflug','Ballvulkanwind','Netzfuchsspur','Rasenphantasie','Pokalwirbel','Fanfarenblitz']
  const bbgTeachersByClass: Record<string, string[]> = {}
  bbgClasses.forEach((c, i) => { bbgTeachersByClass[c.code] = bbgTeacherNames.slice(i * 2, i * 2 + 2) })

  // ── ESG — 30 shared student names (loginCode = name-k1 … name-k6, unique) ──
  const esgStudentNames = [
    'Sturmheld','Torjager','Spielmagier','Laufstar','Passmeister',
    'Schusszauber','Dribbelmacher','Raumdeuter','Vollstrecker','Spielmacher',
    'Flankenheld','Abwehrheld','Spielfeldstar','Schussmeister','Torwachter',
    'Elferschuss','Freistossstar','Eckballstar','Konterheld','Steilpasser',
    'Tempoheld','Kopfballstar','Dribbelheld','Ballwachter','Spielfuhrer',
    'Torhelfer','Flankenstar','Abwehrzauber','Mittelfeldstar','Schussgeist',
  ]

  // ── ESG — 2 teachers per class, Klasse 3 has 3 ──────────────────────────────
  const esgTeachersByClass: Record<string, string[]> = {
    k1: ['Taktikmeister',   'Spielstratege'],
    k2: ['Angriffsleiter',  'Defensivheld'],
    k3: ['Spielvisionaer',  'Offensivcoach', 'Kampfkommando'],
    k4: ['Defensivgeist',   'Spielleitung'],
    k5: ['Sturmfuhrer',     'Abwehrstratege'],
    k6: ['Flankencoach',    'Spielanalyst'],
  }

  // loginCode = "<name>-<class>" → unique even when a name repeats across classes.
  const code = (name: string, classCode: string) =>
    `${name.toLowerCase()}-${classCode}`

  await prisma.user.create({
    data: { name: 'Admin', classCode: 'admin', loginCode: 'admin2026', role: 'ADMIN' },
  })

  let studentCount = 0
  let teacherCount = 0

  // BBG users
  for (const c of bbgClasses) {
    for (const name of studentsByClass[c.code]) {
      await prisma.user.create({
        data: { name, classCode: c.code, loginCode: code(name, c.code), role: 'STUDENT' },
      })
      studentCount++
    }
    for (const name of bbgTeachersByClass[c.code]) {
      await prisma.user.create({
        data: { name, classCode: c.code, loginCode: code(name, c.code), role: 'TEACHER' },
      })
      teacherCount++
    }
  }

  // ESG users
  for (const c of esgClasses) {
    for (const name of esgStudentNames) {
      await prisma.user.create({
        data: { name, classCode: c.code, loginCode: code(name, c.code), role: 'STUDENT' },
      })
      studentCount++
    }
    for (const name of esgTeachersByClass[c.code]) {
      await prisma.user.create({
        data: { name, classCode: c.code, loginCode: code(name, c.code), role: 'TEACHER' },
      })
      teacherCount++
    }
  }

  console.log(`Created ${classes.length} classes (${bbgClasses.length} BBG + ${esgClasses.length} ESG), ${studentCount} students, ${teacherCount} teachers`)

  const groupConfig: Record<string, { start: Date; offset: number; venues: [string, string, string] }> = {
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

  const teamsByGroup: Record<string, { id: string; shortName: string }[]> = {}
  for (const t of teams) {
    if (!teamsByGroup[t.group!]) teamsByGroup[t.group!] = []
    teamsByGroup[t.group!].push(createdTeams[t.shortName])
  }

  let allMatches: any[] = []
  for (const g of ['A','B','C','D','E','F','G','H','I','J','K','L']) {
    const cfg = groupConfig[g]
    allMatches = [...allMatches, ...groupMatches(g, teamsByGroup[g], cfg.start, cfg.offset, ...cfg.venues)]
  }
  for (const m of allMatches) await prisma.match.create({ data: m })
  console.log(`Created ${allMatches.length} group matches`)

  // KO rounds — proper structure (16+8+4+2+1+1 = 32 matches, total 104)
  const VENUES = ['MetLife Stadium', 'SoFi Stadium', 'AT&T Stadium', 'Hard Rock Stadium']
  const koMatches: any[] = [
    // R32 — Runde der 32 (16 matches, #73–88)
    ...Array.from({ length: 16 }, (_, i) => ({
      matchNumber: 73 + i,
      phase: 'ROUND_OF_32', round: 'R32',
      homeTeamId: null, awayTeamId: null,
      kickoff: new Date(`2026-07-0${4 + Math.floor(i / 4)}T${i % 2 === 0 ? '18' : '21'}:00:00`),
      status: 'UPCOMING', venue: VENUES[i % 4],
    })),
    // R16 — Achtelfinale (8 matches, #89–96)
    ...Array.from({ length: 8 }, (_, i) => ({
      matchNumber: 89 + i,
      phase: 'ROUND_OF_16', round: 'R16',
      homeTeamId: null, awayTeamId: null,
      kickoff: new Date(`2026-07-${String(9 + Math.floor(i / 4)).padStart(2,'0')}T${i % 2 === 0 ? '18' : '21'}:00:00`),
      status: 'UPCOMING', venue: VENUES[i % 4],
    })),
    // QF — Viertelfinale (4 matches, #97–100)
    ...Array.from({ length: 4 }, (_, i) => ({
      matchNumber: 97 + i,
      phase: 'QUARTER_FINAL', round: 'QF',
      homeTeamId: null, awayTeamId: null,
      kickoff: new Date(`2026-07-${String(13 + Math.floor(i / 2)).padStart(2,'0')}T${i % 2 === 0 ? '18' : '21'}:00:00`),
      status: 'UPCOMING', venue: VENUES[i % 4],
    })),
    // SF — Halbfinale (2 matches, #101–102)
    { matchNumber: 101, phase: 'SEMI_FINAL', round: 'SF', homeTeamId: null, awayTeamId: null, kickoff: new Date('2026-07-17T21:00:00'), status: 'UPCOMING', venue: 'MetLife Stadium' },
    { matchNumber: 102, phase: 'SEMI_FINAL', round: 'SF', homeTeamId: null, awayTeamId: null, kickoff: new Date('2026-07-18T21:00:00'), status: 'UPCOMING', venue: 'SoFi Stadium' },
    // 3rd place (#103)
    { matchNumber: 103, phase: 'SEMI_FINAL', round: '3RD', homeTeamId: null, awayTeamId: null, kickoff: new Date('2026-07-22T21:00:00'), status: 'UPCOMING', venue: 'AT&T Stadium' },
    // Final (#104)
    { matchNumber: 104, phase: 'FINAL', round: 'FINAL', homeTeamId: null, awayTeamId: null, kickoff: new Date('2026-07-26T21:00:00'), status: 'UPCOMING', venue: 'MetLife Stadium' },
  ]

  for (const m of koMatches) await prisma.match.create({ data: m })
  console.log(`Created ${koMatches.length} KO matches`)
  console.log(`Total: ${allMatches.length + koMatches.length} matches`)
  console.log('Seed complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
