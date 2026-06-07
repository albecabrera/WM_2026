// Mapeo de código de equipo (FIFA / tla de football-data.org) → nombre alemán + bandera.
// Se usa para mostrar los equipos que llegan de la API en alemán para los alumnos.
// Si un equipo no está aquí, se usa el nombre de la API + 🏳 como fallback.

export interface TeamInfo {
  name: string // nombre en alemán
  flagEmoji: string
}

// Claves: código de 3 letras (tla). Incluye los códigos FIFA más comunes.
export const TEAM_BY_CODE: Record<string, TeamInfo> = {
  // CONCACAF
  USA: { name: 'Vereinigte Staaten', flagEmoji: '🇺🇸' },
  MEX: { name: 'Mexiko', flagEmoji: '🇲🇽' },
  CAN: { name: 'Kanada', flagEmoji: '🇨🇦' },
  CRC: { name: 'Costa Rica', flagEmoji: '🇨🇷' },
  PAN: { name: 'Panama', flagEmoji: '🇵🇦' },
  HON: { name: 'Honduras', flagEmoji: '🇭🇳' },
  JAM: { name: 'Jamaika', flagEmoji: '🇯🇲' },
  // CONMEBOL
  ARG: { name: 'Argentinien', flagEmoji: '🇦🇷' },
  BRA: { name: 'Brasilien', flagEmoji: '🇧🇷' },
  URU: { name: 'Uruguay', flagEmoji: '🇺🇾' },
  COL: { name: 'Kolumbien', flagEmoji: '🇨🇴' },
  ECU: { name: 'Ecuador', flagEmoji: '🇪🇨' },
  PER: { name: 'Peru', flagEmoji: '🇵🇪' },
  CHI: { name: 'Chile', flagEmoji: '🇨🇱' },
  PAR: { name: 'Paraguay', flagEmoji: '🇵🇾' },
  VEN: { name: 'Venezuela', flagEmoji: '🇻🇪' },
  BOL: { name: 'Bolivien', flagEmoji: '🇧🇴' },
  // UEFA
  GER: { name: 'Deutschland', flagEmoji: '🇩🇪' },
  FRA: { name: 'Frankreich', flagEmoji: '🇫🇷' },
  ESP: { name: 'Spanien', flagEmoji: '🇪🇸' },
  ENG: { name: 'England', flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  POR: { name: 'Portugal', flagEmoji: '🇵🇹' },
  NED: { name: 'Niederlande', flagEmoji: '🇳🇱' },
  BEL: { name: 'Belgien', flagEmoji: '🇧🇪' },
  ITA: { name: 'Italien', flagEmoji: '🇮🇹' },
  CRO: { name: 'Kroatien', flagEmoji: '🇭🇷' },
  SUI: { name: 'Schweiz', flagEmoji: '🇨🇭' },
  AUT: { name: 'Österreich', flagEmoji: '🇦🇹' },
  POL: { name: 'Polen', flagEmoji: '🇵🇱' },
  UKR: { name: 'Ukraine', flagEmoji: '🇺🇦' },
  SRB: { name: 'Serbien', flagEmoji: '🇷🇸' },
  TUR: { name: 'Türkei', flagEmoji: '🇹🇷' },
  CZE: { name: 'Tschechien', flagEmoji: '🇨🇿' },
  WAL: { name: 'Wales', flagEmoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  SCO: { name: 'Schottland', flagEmoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  DEN: { name: 'Dänemark', flagEmoji: '🇩🇰' },
  SWE: { name: 'Schweden', flagEmoji: '🇸🇪' },
  NOR: { name: 'Norwegen', flagEmoji: '🇳🇴' },
  ROU: { name: 'Rumänien', flagEmoji: '🇷🇴' },
  SVK: { name: 'Slowakei', flagEmoji: '🇸🇰' },
  ALB: { name: 'Albanien', flagEmoji: '🇦🇱' },
  GRE: { name: 'Griechenland', flagEmoji: '🇬🇷' },
  HUN: { name: 'Ungarn', flagEmoji: '🇭🇺' },
  // AFC
  JPN: { name: 'Japan', flagEmoji: '🇯🇵' },
  KOR: { name: 'Südkorea', flagEmoji: '🇰🇷' },
  IRN: { name: 'Iran', flagEmoji: '🇮🇷' },
  AUS: { name: 'Australien', flagEmoji: '🇦🇺' },
  KSA: { name: 'Saudi-Arabien', flagEmoji: '🇸🇦' },
  QAT: { name: 'Katar', flagEmoji: '🇶🇦' },
  IRQ: { name: 'Irak', flagEmoji: '🇮🇶' },
  UZB: { name: 'Usbekistan', flagEmoji: '🇺🇿' },
  IDN: { name: 'Indonesien', flagEmoji: '🇮🇩' },
  JOR: { name: 'Jordanien', flagEmoji: '🇯🇴' },
  // CAF
  MAR: { name: 'Marokko', flagEmoji: '🇲🇦' },
  SEN: { name: 'Senegal', flagEmoji: '🇸🇳' },
  NGA: { name: 'Nigeria', flagEmoji: '🇳🇬' },
  CMR: { name: 'Kamerun', flagEmoji: '🇨🇲' },
  EGY: { name: 'Ägypten', flagEmoji: '🇪🇬' },
  ALG: { name: 'Algerien', flagEmoji: '🇩🇿' },
  TUN: { name: 'Tunesien', flagEmoji: '🇹🇳' },
  GHA: { name: 'Ghana', flagEmoji: '🇬🇭' },
  CIV: { name: 'Elfenbeinküste', flagEmoji: '🇨🇮' },
  RSA: { name: 'Südafrika', flagEmoji: '🇿🇦' },
  // OFC
  NZL: { name: 'Neuseeland', flagEmoji: '🇳🇿' },
}

// Algunos nombres en inglés de la API → código, para resolver cuando el tla falla.
const NAME_TO_CODE: Record<string, string> = {
  'united states': 'USA', usa: 'USA', mexico: 'MEX', canada: 'CAN',
  argentina: 'ARG', brazil: 'BRA', uruguay: 'URU', colombia: 'COL',
  germany: 'GER', france: 'FRA', spain: 'ESP', england: 'ENG',
  portugal: 'POR', netherlands: 'NED', belgium: 'BEL', italy: 'ITA',
  croatia: 'CRO', switzerland: 'SUI', austria: 'AUT', poland: 'POL',
  japan: 'JPN', 'south korea': 'KOR', 'korea republic': 'KOR', iran: 'IRN',
  australia: 'AUS', 'saudi arabia': 'KSA', qatar: 'QAT', morocco: 'MAR',
  senegal: 'SEN', nigeria: 'NGA', cameroon: 'CMR', egypt: 'EGY',
  algeria: 'ALG', tunisia: 'TUN', 'new zealand': 'NZL',
}

export function resolveTeam(tla: string | null, apiName: string): { name: string; shortName: string; flagEmoji: string } {
  const code = (tla ?? '').toUpperCase()
  if (code && TEAM_BY_CODE[code]) {
    return { ...TEAM_BY_CODE[code], shortName: code }
  }
  const byName = NAME_TO_CODE[apiName.trim().toLowerCase()]
  if (byName && TEAM_BY_CODE[byName]) {
    return { ...TEAM_BY_CODE[byName], shortName: byName }
  }
  // Fallback: usar el nombre de la API tal cual
  return { name: apiName, shortName: code || apiName.slice(0, 3).toUpperCase(), flagEmoji: '🏳️' }
}
