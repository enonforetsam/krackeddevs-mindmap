'use client'

import { useRef, useState, useCallback, type MouseEvent } from 'react'
import { colorOf } from '@/lib/themes'
import type { TeamMember } from '@/lib/types'

interface TeamCardProps {
  member: TeamMember
  onDragEnd: (id: string, x: number, y: number) => void
  onEdit: (member: TeamMember) => void
  onDelete: (id: string) => void
  hidden?: boolean
}

const EMP_DOT: Record<string, string> = {
  fulltime: '#22c55e',
  contract: '#f59e0b',
  parttime: '#f59e0b',
  intern: '#f59e0b',
  ambassador: '#3b82f6',
  pending: '#6b7280',
}

function hashColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  const hue = Math.abs(h) % 360
  return `hsl(${hue}, 50%, 40%)`
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function TeamCard({ member, onDragEnd, onEdit, onDelete, hidden }: TeamCardProps) {
  const [pos, setPos] = useState({ x: member.x, y: member.y })
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState(false)
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })

  // sync if parent changes position (e.g. auto layout)
  const lastId = useRef(member.id)
  const lastX = useRef(member.x)
  const lastY = useRef(member.y)
  if (member.id !== lastId.current || member.x !== lastX.current || member.y !== lastY.current) {
    lastId.current = member.id
    lastX.current = member.x
    lastY.current = member.y
    if (!dragging) {
      setPos({ x: member.x, y: member.y })
    }
  }

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      setDragging(true)
      dragStart.current = { mx: e.clientX, my: e.clientY, ox: pos.x, oy: pos.y }

      const onMove = (ev: globalThis.MouseEvent) => {
        const el = (ev.target as HTMLElement).closest('[data-canvas-zoom]')
        const zoom = el ? parseFloat(el.getAttribute('data-canvas-zoom') || '1') : 1
        const nx = dragStart.current.ox + (ev.clientX - dragStart.current.mx) / zoom
        const ny = dragStart.current.oy + (ev.clientY - dragStart.current.my) / zoom
        setPos({ x: nx, y: ny })
      }
      const onUp = (ev: globalThis.MouseEvent) => {
        setDragging(false)
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        const el = (ev.target as HTMLElement).closest?.('[data-canvas-zoom]')
        const zoom = el ? parseFloat(el.getAttribute('data-canvas-zoom') || '1') : 1
        const nx = dragStart.current.ox + (ev.clientX - dragStart.current.mx) / zoom
        const ny = dragStart.current.oy + (ev.clientY - dragStart.current.my) / zoom
        onDragEnd(member.id, Math.round(nx), Math.round(ny))
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [pos, member.id, onDragEnd],
  )

  if (hidden) return null

  const deptColor = colorOf(member.dept)
  const empDot = EMP_DOT[member.emp] || EMP_DOT.pending
  const avatarBg = hashColor(member.name)

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: 220,
        background: 'var(--panel-bg)',
        border: '1.5px solid var(--panel-border)',
        borderRadius: 10,
        padding: 14,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        backdropFilter: 'blur(24px)',
        transition: dragging ? 'none' : 'box-shadow .15s',
        boxShadow: dragging ? '0 4px 20px rgba(0,0,0,.35)' : 'none',
        zIndex: dragging ? 100 : 1,
      }}
    >
      {/* hover actions */}
      {hovered && !dragging && (
        <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 2 }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(member)
            }}
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              border: '1px solid var(--btn-border)',
              background: 'var(--btn-hover-bg)',
              color: 'var(--btn-hover-c)',
              cursor: 'pointer',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✎
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(member.id)
            }}
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              border: '1px solid var(--btn-border)',
              background: 'var(--btn-hover-bg)',
              color: '#e06060',
              cursor: 'pointer',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* avatar + name + role */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: avatarBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,.9)',
            fontSize: 13,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {initials(member.name)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: 'var(--modal-title)',
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {member.name}
          </div>
          <div
            style={{
              color: 'var(--node-desc)',
              fontSize: 11,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {member.role}
          </div>
        </div>
      </div>

      {/* dept pill + emp dot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        {member.dept && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: 6,
              background: deptColor + '18',
              color: deptColor,
              border: `1px solid ${deptColor}30`,
              textTransform: 'capitalize',
            }}
          >
            {member.dept}
          </span>
        )}
        <span
          title={member.emp}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: empDot,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 10, color: 'var(--node-desc)', textTransform: 'capitalize' }}>
          {member.emp}
        </span>
      </div>

      {/* contact rows */}
      {(member.email || member.twitter || member.github) && (
        <div
          style={{
            borderTop: '1px solid var(--panel-border)',
            paddingTop: 7,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {member.email && (
            <div style={{ fontSize: 10, color: 'var(--node-desc)', display: 'flex', gap: 4 }}>
              <span style={{ opacity: 0.6, width: 14, flexShrink: 0 }}>@</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {member.email}
              </span>
            </div>
          )}
          {member.twitter && (
            <div style={{ fontSize: 10, color: 'var(--node-desc)', display: 'flex', gap: 4 }}>
              <span style={{ opacity: 0.6, width: 14, flexShrink: 0 }}>𝕏</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {member.twitter}
              </span>
            </div>
          )}
          {member.github && (
            <div style={{ fontSize: 10, color: 'var(--node-desc)', display: 'flex', gap: 4 }}>
              <span style={{ opacity: 0.6, width: 14, flexShrink: 0 }}>GH</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {member.github}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
