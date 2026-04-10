'use client'

import { useState, useEffect } from 'react'
import { THEMES } from '@/lib/themes'

function applyTheme(key: string) {
  const theme = THEMES[key]
  if (!theme) return
  const root = document.documentElement
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v))
  localStorage.setItem('kd-theme', key)
}

export default function ThemePicker() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('dark-default')

  useEffect(() => {
    const saved = localStorage.getItem('kd-theme')
    if (saved && THEMES[saved]) {
      setCurrent(saved)
      applyTheme(saved)
    }
  }, [])

  const pick = (key: string) => {
    setCurrent(key)
    applyTheme(key)
    setOpen(false)
  }

  const darkThemes = Object.entries(THEMES).filter(([, t]) => t.mode === 'dark')
  const lightThemes = Object.entries(THEMES).filter(([, t]) => t.mode === 'light')
  const monoThemes = Object.entries(THEMES).filter(([, t]) => t.mode === 'mono')

  const accent = THEMES[current]?.accent || '#6c8aff'

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          fontSize: 11, fontWeight: 500,
          cursor: 'pointer',
          background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
          padding: '6px 12px', borderRadius: 8,
          backdropFilter: 'blur(16px)', color: 'var(--btn-c)',
          transition: 'all .15s',
        }}
      >
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: accent, flexShrink: 0,
        }} />
        Theme
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
            onClick={() => setOpen(false)}
          />

          {/* Picker */}
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 6,
            zIndex: 999,
            background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
            borderRadius: 10, backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 30px rgba(0,0,0,.4)',
            overflow: 'hidden', minWidth: 240,
          }}>
            <div style={{ display: 'flex' }}>
              {/* Dark column */}
              <div style={{ padding: '10px 8px', minWidth: 110 }}>
                <div style={{
                  fontSize: 9, fontWeight: 600, letterSpacing: '.1em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--hud-c)', marginBottom: 6, padding: '0 6px',
                }}>Dark</div>
                {darkThemes.map(([key, theme]) => (
                  <ThemeOption key={key} themeKey={key} theme={theme} active={current === key} onClick={pick} />
                ))}
              </div>

              {/* Divider */}
              <div style={{ width: 1, background: 'var(--picker-divider)' }} />

              {/* Light column */}
              <div style={{ padding: '10px 8px', minWidth: 110 }}>
                <div style={{
                  fontSize: 9, fontWeight: 600, letterSpacing: '.1em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--hud-c)', marginBottom: 6, padding: '0 6px',
                }}>Light</div>
                {lightThemes.map(([key, theme]) => (
                  <ThemeOption key={key} themeKey={key} theme={theme} active={current === key} onClick={pick} />
                ))}
              </div>
            </div>

            {/* Mono row */}
            {monoThemes.length > 0 && (
              <div style={{ borderTop: '1px solid var(--picker-divider)', padding: '6px 8px 8px' }}>
                {monoThemes.map(([key, theme]) => (
                  <ThemeOption key={key} themeKey={key} theme={theme} active={current === key} onClick={pick} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function ThemeOption({ themeKey, theme, active, onClick }: {
  themeKey: string
  theme: { label: string; accent: string }
  active: boolean
  onClick: (key: string) => void
}) {
  return (
    <div
      onClick={() => onClick(themeKey)}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '6px 8px', borderRadius: 6, cursor: 'pointer',
        fontSize: 11, fontWeight: 500,
        color: active ? 'var(--btn-hover-c)' : 'var(--btn-c)',
        background: active ? 'var(--btn-hover-bg)' : 'transparent',
        border: active ? '1px solid var(--btn-hover-border)' : '1px solid transparent',
        transition: 'all .15s', whiteSpace: 'nowrap' as const,
      }}
    >
      <span style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: theme.accent,
        transform: active ? 'scale(1.2)' : 'scale(1)',
        transition: 'transform .15s',
      }} />
      {theme.label}
    </div>
  )
}
