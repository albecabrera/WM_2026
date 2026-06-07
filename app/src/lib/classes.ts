// ── BBG — color-named classes ───────────────────────────────────────────────
export const BBG_CLASSES = [
  { code: 'gelb',    label: 'Gelb'    },
  { code: 'schwarz', label: 'Schwarz' },
  { code: 'gruen',   label: 'Grün'    },
  { code: 'blau',    label: 'Blau'    },
  { code: 'rot',     label: 'Rot'     },
  { code: 'weiss',   label: 'Weiß'    },
] as const

// ── ESG — numbered classes (5. Jahrgang) ────────────────────────────────────
export const ESG_CLASSES = [
  { code: 'k1', label: 'Klasse 1' },
  { code: 'k2', label: 'Klasse 2' },
  { code: 'k3', label: 'Klasse 3' },
  { code: 'k4', label: 'Klasse 4' },
  { code: 'k5', label: 'Klasse 5' },
  { code: 'k6', label: 'Klasse 6' },
] as const

export const ALL_CLASSES = [...BBG_CLASSES, ...ESG_CLASSES]

// Legacy export — BBG codes (backward compat with existing imports)
export const CLASSES = BBG_CLASSES
export const CLASS_CODES = BBG_CLASSES.map((c) => c.code)

export const BBG_CLASS_CODES = BBG_CLASSES.map((c) => c.code)
export const ESG_CLASS_CODES = ESG_CLASSES.map((c) => c.code)
export const ALL_CLASS_CODES = ALL_CLASSES.map((c) => c.code)

const ALL_LABELS: Record<string, string> = Object.fromEntries(
  ALL_CLASSES.map((c) => [c.code, c.label]),
)

export function classLabel(code: string): string {
  return ALL_LABELS[code] ?? code.toUpperCase()
}

export function getSchool(classCode: string): 'bbg' | 'esg' | null {
  if ((BBG_CLASS_CODES as readonly string[]).includes(classCode)) return 'bbg'
  if ((ESG_CLASS_CODES as readonly string[]).includes(classCode)) return 'esg'
  return null // admin
}

export function getClassesForSchool(school: 'bbg' | 'esg') {
  return school === 'bbg' ? BBG_CLASSES : ESG_CLASSES
}

export function getClassCodesForSchool(school: 'bbg' | 'esg') {
  return school === 'bbg' ? BBG_CLASS_CODES : ESG_CLASS_CODES
}
