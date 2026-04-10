'use client'

import { useState, useRef, useCallback, type DragEvent } from 'react'
import type { KanbanColumn as KanbanColumnType, KanbanCard as KanbanCardType } from '@/lib/types'
import KanbanCard from './KanbanCard'

interface KanbanColumnProps {
  column: KanbanColumnType
  cards: KanbanCardType[]
  onAddCard: (columnId: string) => void
  onUpdateCard: (id: string, updates: Partial<KanbanCardType>) => void
  onDeleteCard: (id: string) => void
  onMoveCard: (cardId: string, toColumnId: string, position: number) => void
  onRenameColumn: (id: string, name: string) => void
  onDeleteColumn: (id: string) => void
}

export default function KanbanColumn({
  column,
  cards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onMoveCard,
  onRenameColumn,
  onDeleteColumn,
}: KanbanColumnProps) {
  const [dragOver, setDragOver] = useState(false)
  const nameRef = useRef<HTMLDivElement>(null)

  const handleNameBlur = useCallback(() => {
    const newName = nameRef.current?.innerText?.trim() || ''
    if (newName && newName !== column.name) {
      onRenameColumn(column.id, newName)
    }
  }, [column.id, column.name, onRenameColumn])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const cardId = e.dataTransfer.getData('text/plain')
    if (cardId) {
      onMoveCard(cardId, column.id, cards.length)
    }
  }, [column.id, cards.length, onMoveCard])

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        width: 280,
        minWidth: 280,
        background: dragOver ? 'var(--btn-hover-bg)' : 'var(--panel-bg)',
        border: '1.5px solid var(--panel-border)',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
        transition: 'background .15s',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '12px 12px 8px',
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid var(--panel-border)',
      }}>
        <div
          ref={nameRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleNameBlur}
          style={{
            flex: 1, fontSize: 13, fontWeight: 600,
            color: 'var(--modal-title)', outline: 'none',
            cursor: 'text',
          }}
        >
          {column.name}
        </div>
        <span style={{
          fontSize: 11, color: 'var(--hud-c)', fontWeight: 500,
          background: 'var(--btn-hover-bg)', padding: '1px 6px', borderRadius: 8,
        }}>
          {cards.length}
        </span>
        <button
          onClick={() => onAddCard(column.id)}
          style={{
            width: 24, height: 24, borderRadius: 6,
            border: '1px solid var(--btn-border)',
            background: 'transparent', color: 'var(--btn-c)',
            cursor: 'pointer', fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >+</button>
        <button
          onClick={() => onDeleteColumn(column.id)}
          style={{
            width: 24, height: 24, borderRadius: 6,
            border: '1px solid var(--btn-border)',
            background: 'transparent', color: '#ef4444',
            cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >×</button>
      </div>

      {/* Cards */}
      <div style={{
        padding: 8, display: 'flex', flexDirection: 'column', gap: 8,
        overflowY: 'auto', flex: 1,
      }}>
        {cards.map(card => (
          <KanbanCard
            key={card.id}
            card={card}
            onUpdate={onUpdateCard}
            onDelete={onDeleteCard}
          />
        ))}
      </div>
    </div>
  )
}
