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

export function textColorFor(hex: string): string {
  const c = hex.replace('#', '')
  const r = parseInt(c.substr(0, 2), 16)
  const g = parseInt(c.substr(2, 2), 16)
  const b = parseInt(c.substr(4, 2), 16)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.55 ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,.95)'
}
