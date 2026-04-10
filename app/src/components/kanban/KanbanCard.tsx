'use client'

import { useState, useRef, useCallback, type DragEvent } from 'react'
import type { KanbanCard as KanbanCardType } from '@/lib/types'

const CARD_COLORS = [
  { key: 'yellow', value: '#fef08a' },
  { key: 'pink', value: '#fda4af' },
  { key: 'blue', value: '#93c5fd' },
  { key: 'green', value: '#86efac' },
  { key: 'orange', value: '#fdba74' },
  { key: 'grey', value: '#d1d5db' },
]

interface KanbanCardProps {
  card: KanbanCardType
  onUpdate: (id: string, updates: Partial<KanbanCardType>) => void
  onDelete: (id: string) => void
}

export default function KanbanCard({ card, onUpdate, onDelete }: KanbanCardProps) {
  const [showColors, setShowColors] = useState(false)
  const [hovered, setHovered] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  const handleBlur = useCallback(() => {
    const newText = textRef.current?.innerText?.trim() || ''
    if (newText !== card.text) {
      onUpdate(card.id, { text: newText })
    }
  }, [card.id, card.text, onUpdate])

  const handleDragStart = useCallback((e: DragEvent) => {
    e.dataTransfer.setData('text/plain', card.id)
    e.dataTransfer.effectAllowed = 'move'
  }, [card.id])

  const bgColor = card.color || '#fef08a'
  const dateStr = new Date(card.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowColors(false) }}
      style={{
        background: bgColor,
        borderRadius: 8,
        padding: 10,
        cursor: 'grab',
        position: 'relative',
        border: '1px solid rgba(0,0,0,.08)',
      }}
    >
      {/* Delete button */}
      {hovered && (
        <button
          onClick={() => onDelete(card.id)}
          style={{
            position: 'absolute', top: 4, right: 4,
            width: 20, height: 20, borderRadius: 4,
            border: 'none', background: 'rgba(0,0,0,.1)',
            color: 'rgba(0,0,0,.5)', cursor: 'pointer',
            fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
          }}
        >×</button>
      )}

      {/* Text */}
      <div
        ref={textRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        style={{
          fontSize: 13, color: 'rgba(0,0,0,.8)', outline: 'none',
          minHeight: 20, lineHeight: 1.4, wordBreak: 'break-word',
          cursor: 'text',
        }}
      >
        {card.text}
      </div>

      {/* Footer: date + color toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
        <span style={{ fontSize: 10, color: 'rgba(0,0,0,.35)' }}>{dateStr}</span>
        <button
          onClick={() => setShowColors(!showColors)}
          style={{
            width: 16, height: 16, borderRadius: '50%',
            background: bgColor, border: '2px solid rgba(0,0,0,.15)',
            cursor: 'pointer',
          }}
        />
      </div>

      {/* Color picker */}
      {showColors && (
        <div style={{
          display: 'flex', gap: 4, marginTop: 6, padding: 4,
          background: 'rgba(255,255,255,.7)', borderRadius: 6,
        }}>
          {CARD_COLORS.map(c => (
            <button
              key={c.key}
              onClick={() => { onUpdate(card.id, { color: c.value }); setShowColors(false) }}
              style={{
                width: 18, height: 18, borderRadius: '50%',
                background: c.value, border: card.color === c.value ? '2px solid rgba(0,0,0,.4)' : '1px solid rgba(0,0,0,.1)',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
