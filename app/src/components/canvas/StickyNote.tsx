'use client'

import { useRef, useState, useCallback, type MouseEvent } from 'react'
import type { StickyNote as StickyNoteType } from '@/lib/types'

interface StickyNoteProps {
  note: StickyNoteType
  onDragEnd: (id: string, x: number, y: number) => void
  onTextChange: (id: string, text: string) => void
  onColorChange: (id: string, color: string) => void
  onDelete: (id: string) => void
}

const STICKY_COLORS: { key: string; bg: string; text: string }[] = [
  { key: 'yellow', bg: '#fef08a', text: '#713f12' },
  { key: 'pink', bg: '#fda4af', text: '#881337' },
  { key: 'blue', bg: '#93c5fd', text: '#1e3a5f' },
  { key: 'green', bg: '#86efac', text: '#14532d' },
  { key: 'orange', bg: '#fdba74', text: '#7c2d12' },
]

function stickyStyle(color: string): { bg: string; text: string } {
  return STICKY_COLORS.find((c) => c.key === color) || STICKY_COLORS[0]
}

export { STICKY_COLORS }

export default function StickyNote({ note, onDragEnd, onTextChange, onColorChange, onDelete }: StickyNoteProps) {
  const [pos, setPos] = useState({ x: note.x, y: note.y })
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [showColors, setShowColors] = useState(false)
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })
  const textRef = useRef<HTMLDivElement>(null)

  const lastId = useRef(note.id)
  const lastX = useRef(note.x)
  const lastY = useRef(note.y)
  if (note.id !== lastId.current || note.x !== lastX.current || note.y !== lastY.current) {
    lastId.current = note.id
    lastX.current = note.x
    lastY.current = note.y
    if (!dragging) {
      setPos({ x: note.x, y: note.y })
    }
  }

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      // allow text editing clicks through
      if ((e.target as HTMLElement).getAttribute('contenteditable') === 'true') return
      e.stopPropagation()
      e.preventDefault()
      setDragging(true)
      dragStart.current = { mx: e.clientX, my: e.clientY, ox: pos.x, oy: pos.y }

      const onMove = (ev: globalThis.MouseEvent) => {
        const el = (ev.target as HTMLElement).closest?.('[data-canvas-zoom]')
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
        onDragEnd(note.id, Math.round(nx), Math.round(ny))
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [pos, note.id, onDragEnd],
  )

  const style = stickyStyle(note.color)

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setShowColors(false)
      }}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: 160,
        minHeight: 100,
        background: style.bg,
        border: '1.5px solid ' + style.bg,
        borderRadius: 10,
        padding: 12,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: dragging ? 'none' : 'auto',
        boxShadow: dragging ? '0 4px 20px rgba(0,0,0,.2)' : '0 1px 4px rgba(0,0,0,.08)',
        zIndex: dragging ? 100 : 1,
        transition: dragging ? 'none' : 'box-shadow .15s',
      }}
    >
      {/* hover actions */}
      {hovered && !dragging && (
        <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 2 }}>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              setShowColors(!showColors)
            }}
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              border: '1px solid ' + style.text + '30',
              background: style.text + '10',
              color: style.text,
              cursor: 'pointer',
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ●
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(note.id)
            }}
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              border: '1px solid ' + style.text + '30',
              background: style.text + '10',
              color: style.text,
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

      {/* color picker */}
      {showColors && (
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: 0,
            display: 'flex',
            gap: 3,
            background: 'rgba(255,255,255,.95)',
            padding: '4px 6px',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,.1)',
          }}
        >
          {STICKY_COLORS.map((c) => (
            <button
              key={c.key}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onColorChange(note.id, c.key)
                setShowColors(false)
              }}
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: c.bg,
                border: c.key === note.color ? '2px solid ' + c.text : '1px solid rgba(0,0,0,.15)',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      )}

      {/* editable text */}
      <div
        ref={textRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={() => {
          if (textRef.current) {
            onTextChange(note.id, textRef.current.innerText)
          }
        }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          color: style.text,
          fontSize: 12,
          lineHeight: 1.5,
          outline: 'none',
          minHeight: 40,
          cursor: 'text',
          wordBreak: 'break-word',
        }}
      >
        {note.text}
      </div>
    </div>
  )
}
