'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/structure', label: 'Structure' },
  { href: '/team', label: 'Team' },
  { href: '/labs', label: 'Tech Labs' },
]

export default function ViewTabs() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-3.5 left-1/2 -translate-x-1/2 z-[999] flex gap-0.5 p-1 rounded-lg backdrop-blur-2xl"
      style={{
        background: 'var(--panel-bg)',
        border: '1px solid var(--panel-border)',
        boxShadow: '0 2px 12px rgba(0,0,0,.2)',
      }}
    >
      {tabs.map(tab => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-5 py-2 rounded-md text-xs font-medium transition-all ${
              active
                ? 'text-[var(--accent)]'
                : 'text-[var(--btn-c)] hover:text-[var(--btn-hover-c)] hover:bg-[var(--btn-hover-bg)]'
            }`}
            style={active ? { background: 'var(--btn-hover-bg)' } : {}}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
