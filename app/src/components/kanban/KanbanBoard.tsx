'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Project, KanbanColumn as KanbanColumnType, KanbanCard as KanbanCardType } from '@/lib/types'
import KanbanColumn from './KanbanColumn'

const STATUS_COLORS: Record<string, string> = {
  live: '#22c55e',
  beta: '#3b82f6',
  building: '#f59e0b',
  idea: '#a78bfa',
  paused: '#71717a',
}

interface KanbanBoardProps {
  projectId: string
}

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [columns, setColumns] = useState<KanbanColumnType[]>([])
  const [cards, setCards] = useState<KanbanCardType[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch project, columns, cards
  useEffect(() => {
    async function load() {
      const [pRes, cRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('kanban_columns').select('*').eq('project_id', projectId).order('position'),
      ])
      if (pRes.data) setProject(pRes.data as Project)
      if (cRes.data) {
        const cols = cRes.data as KanbanColumnType[]
        setColumns(cols)
        if (cols.length > 0) {
          const colIds = cols.map(c => c.id)
          const { data: cardsData } = await supabase
            .from('kanban_cards')
            .select('*')
            .in('column_id', colIds)
            .order('position')
          if (cardsData) setCards(cardsData as KanbanCardType[])
        }
      }
      setLoading(false)
    }
    load()
  }, [projectId])

  // Add column
  const addColumn = useCallback(async () => {
    const name = 'New Column'
    const position = columns.length
    const { data } = await supabase
      .from('kanban_columns')
      .insert({ project_id: projectId, name, position })
      .select()
      .single()
    if (data) setColumns(prev => [...prev, data as KanbanColumnType])
  }, [columns.length, projectId])

  // Delete column
  const deleteColumn = useCallback(async (id: string) => {
    await supabase.from('kanban_cards').delete().eq('column_id', id)
    await supabase.from('kanban_columns').delete().eq('id', id)
    setColumns(prev => prev.filter(c => c.id !== id))
    setCards(prev => prev.filter(c => c.column_id !== id))
  }, [])

  // Rename column
  const renameColumn = useCallback(async (id: string, name: string) => {
    await supabase.from('kanban_columns').update({ name }).eq('id', id)
    setColumns(prev => prev.map(c => c.id === id ? { ...c, name } : c))
  }, [])

  // Add card
  const addCard = useCallback(async (columnId: string) => {
    const colCards = cards.filter(c => c.column_id === columnId)
    const position = colCards.length
    const { data } = await supabase
      .from('kanban_cards')
      .insert({ column_id: columnId, text: 'New task', color: '#fef08a', position })
      .select()
      .single()
    if (data) setCards(prev => [...prev, data as KanbanCardType])
  }, [cards])

  // Update card
  const updateCard = useCallback(async (id: string, updates: Partial<KanbanCardType>) => {
    await supabase.from('kanban_cards').update(updates).eq('id', id)
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }, [])

  // Delete card
  const deleteCard = useCallback(async (id: string) => {
    await supabase.from('kanban_cards').delete().eq('id', id)
    setCards(prev => prev.filter(c => c.id !== id))
  }, [])

  // Move card between columns
  const moveCard = useCallback(async (cardId: string, toColumnId: string, position: number) => {
    await supabase.from('kanban_cards').update({ column_id: toColumnId, position }).eq('id', cardId)
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, column_id: toColumnId, position } : c))
  }, [])

  if (loading) {
    return (
      <div style={{
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--hud-c)', fontSize: 14,
      }}>
        Loading...
      </div>
    )
  }

  if (!project) {
    return (
      <div style={{
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--hud-c)', fontSize: 14,
      }}>
        Project not found
      </div>
    )
  }

  const statusColor = STATUS_COLORS[project.status] || '#71717a'

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', paddingTop: 56 }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid var(--panel-border)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => router.push('/labs')}
          style={{
            padding: '6px 14px', borderRadius: 8,
            border: '1.5px solid var(--btn-border)',
            background: 'transparent', color: 'var(--btn-c)',
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}
        >
          ← Back
        </button>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--modal-title)' }}>
          {project.name}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px',
          padding: '3px 10px', borderRadius: 20,
          background: statusColor + '20', color: statusColor,
        }}>
          {project.status}
        </span>
      </div>

      {/* Columns */}
      <div style={{
        flex: 1, display: 'flex', gap: 16, padding: 24,
        overflowX: 'auto', overflowY: 'hidden', alignItems: 'flex-start',
      }}>
        {columns.map(col => (
          <KanbanColumn
            key={col.id}
            column={col}
            cards={cards.filter(c => c.column_id === col.id).sort((a, b) => a.position - b.position)}
            onAddCard={addCard}
            onUpdateCard={updateCard}
            onDeleteCard={deleteCard}
            onMoveCard={moveCard}
            onRenameColumn={renameColumn}
            onDeleteColumn={deleteColumn}
          />
        ))}

        {/* Add column button */}
        <button
          onClick={addColumn}
          style={{
            width: 280, minWidth: 280, minHeight: 80,
            borderRadius: 10, border: '1.5px dashed var(--btn-border)',
            background: 'transparent', color: 'var(--btn-c)',
            cursor: 'pointer', fontSize: 14, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6,
          }}
        >
          + Add column
        </button>
      </div>
    </div>
  )
}
