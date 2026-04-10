export interface ThemeNodeColors {
  bg: string
  border: string
  title: string
}

export interface Theme {
  label: string
  mode: 'dark' | 'light' | 'mono'
  accent: string
  vars: Record<string, string>
  nodes: Record<string, ThemeNodeColors>
}

function darkVars(bg: string, accent: string): Record<string, string> {
  return {
    '--bg': bg, '--grid-c': 'rgba(255,255,255,.03)', '--scan-c': 'transparent',
    '--panel-bg': 'rgba(20,20,26,.92)', '--panel-border': 'rgba(255,255,255,.06)',
    '--btn-c': 'rgba(255,255,255,.5)', '--btn-border': 'rgba(255,255,255,.08)',
    '--btn-hover-bg': 'rgba(255,255,255,.05)', '--btn-hover-border': 'rgba(255,255,255,.15)',
    '--btn-hover-c': 'rgba(255,255,255,.85)', '--accent': accent,
    '--brand-c': 'rgba(255,255,255,.2)', '--hud-c': 'rgba(255,255,255,.25)',
    '--hud-val': 'rgba(255,255,255,.55)',
    '--modal-bg': 'rgba(18,18,24,.98)', '--modal-border': 'rgba(255,255,255,.08)',
    '--modal-title': 'rgba(255,255,255,.9)', '--modal-label': 'rgba(255,255,255,.3)',
    '--modal-text': 'rgba(255,255,255,.7)',
    '--input-bg': 'rgba(255,255,255,.03)', '--input-border': 'rgba(255,255,255,.07)',
    '--input-c': 'rgba(255,255,255,.8)',
    '--input-focus-border': accent + '80', '--input-focus-bg': accent + '0a',
    '--node-desc': 'rgba(255,255,255,.4)', '--node-link-border': 'rgba(255,255,255,.05)',
    '--node-hover-shadow': '0 2px 16px rgba(0,0,0,.4)',
    '--cancel-c': 'rgba(255,255,255,.3)', '--cancel-border': 'rgba(255,255,255,.07)',
    '--picker-divider': 'rgba(255,255,255,.06)',
  }
}

function lightVars(bg: string, accent: string): Record<string, string> {
  return {
    '--bg': bg, '--grid-c': 'rgba(0,0,0,.04)', '--scan-c': 'transparent',
    '--panel-bg': 'rgba(255,255,255,.92)', '--panel-border': 'rgba(0,0,0,.07)',
    '--btn-c': 'rgba(0,0,0,.45)', '--btn-border': 'rgba(0,0,0,.08)',
    '--btn-hover-bg': 'rgba(0,0,0,.04)', '--btn-hover-border': 'rgba(0,0,0,.15)',
    '--btn-hover-c': 'rgba(0,0,0,.8)', '--accent': accent,
    '--brand-c': 'rgba(0,0,0,.2)', '--hud-c': 'rgba(0,0,0,.3)',
    '--hud-val': 'rgba(0,0,0,.55)',
    '--modal-bg': 'rgba(255,255,255,.98)', '--modal-border': 'rgba(0,0,0,.08)',
    '--modal-title': 'rgba(0,0,0,.85)', '--modal-label': 'rgba(0,0,0,.35)',
    '--modal-text': 'rgba(0,0,0,.7)',
    '--input-bg': 'rgba(0,0,0,.02)', '--input-border': 'rgba(0,0,0,.08)',
    '--input-c': 'rgba(0,0,0,.8)',
    '--input-focus-border': accent + '80', '--input-focus-bg': accent + '0a',
    '--node-desc': 'rgba(0,0,0,.4)', '--node-link-border': 'rgba(0,0,0,.06)',
    '--node-hover-shadow': '0 2px 12px rgba(0,0,0,.1)',
    '--cancel-c': 'rgba(0,0,0,.3)', '--cancel-border': 'rgba(0,0,0,.08)',
    '--picker-divider': 'rgba(0,0,0,.06)',
  }
}

const dn = (bg: string, border: string): ThemeNodeColors => ({
  bg, border, title: 'rgba(255,255,255,.9)',
})

const ln = (bg: string, border: string): ThemeNodeColors => ({
  bg, border, title: 'rgba(0,0,0,.85)',
})

export const THEMES: Record<string, Theme> = {
  'dark-default': {
    label: 'Default', mode: 'dark', accent: '#6c8aff',
    vars: darkVars('#101014', '#6c8aff'),
    nodes: {
      root: dn('rgba(16,16,28,.95)', '#6c8aff'),
      labs: dn('rgba(20,18,10,.95)', '#e0a840'),
      acad: dn('rgba(10,20,16,.95)', '#4ab870'),
      accel: dn('rgba(18,12,26,.95)', '#a07ae0'),
      people: dn('rgba(22,14,14,.95)', '#e06060'),
      default: dn('rgba(18,18,24,.95)', '#505068'),
    },
  },
  'dark-charcoal': {
    label: 'Charcoal', mode: 'dark', accent: '#7aaad8',
    vars: darkVars('#121518', '#7aaad8'),
    nodes: {
      root: dn('rgba(14,18,26,.95)', '#7aaad8'),
      labs: dn('rgba(22,18,12,.95)', '#d4a840'),
      acad: dn('rgba(12,20,18,.95)', '#55aa70'),
      accel: dn('rgba(18,14,24,.95)', '#9070c0'),
      people: dn('rgba(22,14,14,.95)', '#d06060'),
      default: dn('rgba(18,20,24,.95)', '#506070'),
    },
  },
  'dark-forest': {
    label: 'Forest', mode: 'dark', accent: '#5eb86a',
    vars: darkVars('#0c100c', '#5eb86a'),
    nodes: {
      root: dn('rgba(8,18,10,.95)', '#5eb86a'),
      labs: dn('rgba(16,16,6,.95)', '#b8b030'),
      acad: dn('rgba(6,18,10,.95)', '#48a858'),
      accel: dn('rgba(12,8,16,.95)', '#7a9a40'),
      people: dn('rgba(18,10,8,.95)', '#c87848'),
      default: dn('rgba(10,14,10,.95)', '#406040'),
    },
  },
  'dark-midnight': {
    label: 'Midnight', mode: 'dark', accent: '#9580e8',
    vars: darkVars('#0c0c14', '#9580e8'),
    nodes: {
      root: dn('rgba(10,10,22,.95)', '#9580e8'),
      labs: dn('rgba(18,14,8,.95)', '#d4a840'),
      acad: dn('rgba(8,16,18,.95)', '#40b0c0'),
      accel: dn('rgba(14,8,20,.95)', '#a870d8'),
      people: dn('rgba(20,8,14,.95)', '#d05878'),
      default: dn('rgba(12,12,20,.95)', '#484868'),
    },
  },
  'dark-ember': {
    label: 'Ember', mode: 'dark', accent: '#e0834a',
    vars: darkVars('#12100c', '#e0834a'),
    nodes: {
      root: dn('rgba(20,14,8,.95)', '#e0834a'),
      labs: dn('rgba(20,16,8,.95)', '#d4a830'),
      acad: dn('rgba(10,16,10,.95)', '#60a848'),
      accel: dn('rgba(16,8,16,.95)', '#b858a0'),
      people: dn('rgba(22,10,8,.95)', '#d05038'),
      default: dn('rgba(16,14,10,.95)', '#685040'),
    },
  },
  'light-arctic': {
    label: 'Arctic', mode: 'light', accent: '#3a7ad5',
    vars: lightVars('#f4f5f7', '#3a7ad5'),
    nodes: {
      root: ln('#eef4fc', '#3a7ad5'),
      labs: ln('#fdf8ee', '#b88020'),
      acad: ln('#eef8f2', '#228848'),
      accel: ln('#f4eefa', '#7040b0'),
      people: ln('#fceeee', '#c83838'),
      default: ln('#f2f3f6', '#7888a0'),
    },
  },
  'light-cream': {
    label: 'Cream', mode: 'light', accent: '#8a6040',
    vars: lightVars('#f9f6f1', '#8a6040'),
    nodes: {
      root: ln('#f6f0e4', '#8a6040'),
      labs: ln('#fcf4e0', '#b88028'),
      acad: ln('#eef6ec', '#508838'),
      accel: ln('#f2ecf6', '#706080'),
      people: ln('#f8ece8', '#c05040'),
      default: ln('#f4f0ec', '#908070'),
    },
  },
  'light-sage': {
    label: 'Sage', mode: 'light', accent: '#3a7a55',
    vars: lightVars('#f2f6f3', '#3a7a55'),
    nodes: {
      root: ln('#ebf4ee', '#3a7a55'),
      labs: ln('#f6f6e8', '#808820'),
      acad: ln('#e8f4ee', '#309050'),
      accel: ln('#eee8f4', '#6850a0'),
      people: ln('#f4e8e8', '#b04040'),
      default: ln('#eef4f0', '#608068'),
    },
  },
  'light-lavender': {
    label: 'Lavender', mode: 'light', accent: '#6844b0',
    vars: lightVars('#f4f2f8', '#6844b0'),
    nodes: {
      root: ln('#eeeafa', '#6844b0'),
      labs: ln('#fcf6e8', '#a87820'),
      acad: ln('#e8f6ee', '#308840'),
      accel: ln('#eae6f8', '#7844c0'),
      people: ln('#fae8ee', '#c03060'),
      default: ln('#f0eef4', '#7868a0'),
    },
  },
  'light-dusk': {
    label: 'Dusk', mode: 'light', accent: '#c0582a',
    vars: lightVars('#f7f2ee', '#c0582a'),
    nodes: {
      root: ln('#fcf0e8', '#c0582a'),
      labs: ln('#fcf8e0', '#b89010'),
      acad: ln('#e8f6ee', '#388848'),
      accel: ln('#f4eef8', '#8858b0'),
      people: ln('#fce8e0', '#c04820'),
      default: ln('#f8f2ec', '#907860'),
    },
  },
  'mono': {
    label: 'Mono', mode: 'mono', accent: '#888',
    vars: darkVars('#0a0a0a', '#888888'),
    nodes: {
      root: dn('rgba(20,20,20,.95)', '#aaa'),
      labs: dn('rgba(16,16,16,.95)', '#777'),
      acad: dn('rgba(16,16,16,.95)', '#777'),
      accel: dn('rgba(16,16,16,.95)', '#777'),
      people: dn('rgba(16,16,16,.95)', '#777'),
      default: dn('rgba(12,12,12,.95)', '#555'),
    },
  },
}

export const NODE_COLORS = [
  { key: 'blue', bg: '#3b82f6', border: '#2563eb' },
  { key: 'green', bg: '#22c55e', border: '#16a34a' },
  { key: 'amber', bg: '#f59e0b', border: '#d97706' },
  { key: 'red', bg: '#ef4444', border: '#dc2626' },
  { key: 'purple', bg: '#8b5cf6', border: '#7c3aed' },
  { key: 'pink', bg: '#ec4899', border: '#db2777' },
  { key: 'teal', bg: '#14b8a6', border: '#0d9488' },
  { key: 'grey', bg: '#6b7280', border: '#4b5563' },
  { key: 'white', bg: '#f3f4f6', border: '#d1d5db' },
  { key: 'dark', bg: '#1f2937', border: '#111827' },
]

const DEPT_COLORS: Record<string, string> = {
  engineering: '#3b82f6',
  design: '#ec4899',
  product: '#8b5cf6',
  marketing: '#f59e0b',
  operations: '#14b8a6',
  finance: '#22c55e',
  hr: '#ef4444',
  legal: '#6b7280',
  research: '#e0a840',
  community: '#a07ae0',
}

export function colorOf(dept: string): string {
  const key = (dept || '').toLowerCase().trim()
  if (DEPT_COLORS[key]) return DEPT_COLORS[key]
  // hash-based fallback
  let h = 0
  for (let i = 0; i < key.length; i++) h = key.charCodeAt(i) + ((h << 5) - h)
  const palette = Object.values(DEPT_COLORS)
  return palette[Math.abs(h) % palette.length]
}

export function textColorFor(hex: string): string {
  const c = hex.replace('#', '')
  const r = parseInt(c.substr(0, 2), 16)
  const g = parseInt(c.substr(2, 2), 16)
  const b = parseInt(c.substr(4, 2), 16)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.55 ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,.95)'
}

export function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '')
  const r = parseInt(c.substr(0, 2), 16)
  const g = parseInt(c.substr(2, 2), 16)
  const b = parseInt(c.substr(4, 2), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55
}

/** Resolve a node's color key/hex to full palette entry */
export function resolveNodeColor(nodeColor: string | undefined | null) {
  const entry = NODE_COLORS.find(c => c.key === nodeColor || c.border === nodeColor || c.bg === nodeColor)
  if (!entry) return null
  const light = isLightColor(entry.bg)
  return {
    bg: entry.bg,
    border: entry.border,
    text: light ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,.95)',
    desc: light ? 'rgba(0,0,0,.5)' : 'rgba(255,255,255,.5)',
    link: light ? 'rgba(0,0,0,.4)' : 'rgba(255,255,255,.4)',
    divider: light ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.15)',
    dot: light ? 'rgba(0,0,0,.2)' : 'rgba(255,255,255,.3)',
    menuBtn: light ? 'rgba(0,0,0,.4)' : 'rgba(255,255,255,.5)',
  }
}
