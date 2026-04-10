'use client'

import { useRef, useState, useCallback, type MouseEvent } from 'react'
import type { Project } from '@/lib/types'

const STATUS_COLORS: Record<string, string> = {
  live: '#22c55e',
  beta: '#3b82f6',
  building: '#f59e0b',
  idea: '#a78bfa',
  paused: '#71717a',
}

interface ProjectCardProps {
  project: Project
  taskCount: number
  onDragEnd: (id: string, x: number, y: number) => void
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
  onClick: (project: Project) => void
}

export default function ProjectCard({
  project,
  taskCount,
  onDragEnd,
  onEdit,
  onDelete,
  onClick,
}: ProjectCardProps) {
  const [hovered, setHovered] = useState(false)
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const posStart = useRef({ x: project.x, y: project.y })
  const [pos, setPos] = useState({ x: project.x, y: project.y })
  const hasMoved = useRef(false)

  // Sync pos when project changes from outside
  const prevId = useRef(project.id)
  if (prevId.current !== project.id || (!dragging.current && (pos.x !== project.x || pos.y !== project.y))) {
    prevId.current = project.id
    if (!dragging.current) {
      setPos({ x: project.x, y: project.y })
    }
  }

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('a, button')) return
    e.stopPropagation()
    dragging.current = true
    hasMoved.current = false
    dragStart.current = { x: e.clientX, y: e.clientY }
    posStart.current = { x: pos.x, y: pos.y }

    const parent = (e.currentTarget as HTMLElement).parentElement
    const zoom = parent ? parseFloat(parent.style.transform?.match(/scale\(([\d.]+)\)/)?.[1] || '1') : 1

    const onMove = (ev: globalThis.MouseEvent) => {
      const dx = (ev.clientX - dragStart.current.x) / zoom
      const dy = (ev.clientY - dragStart.current.y) / zoom
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true
      setPos({
        x: posStart.current.x + dx,
        y: posStart.current.y + dy,
      })
    }
    const onUp = (ev: globalThis.MouseEvent) => {
      dragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      const dx = (ev.clientX - dragStart.current.x) / zoom
      const dy = (ev.clientY - dragStart.current.y) / zoom
      if (hasMoved.current) {
        onDragEnd(project.id, Math.round(posStart.current.x + dx), Math.round(posStart.current.y + dy))
      }
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [pos.x, pos.y, project.id, onDragEnd])

  const handleClick = useCallback(() => {
    if (!hasMoved.current) {
      onClick(project)
    }
  }, [onClick, project])

  const handleDoubleClick = useCallback(() => {
    onClick(project)
  }, [onClick, project])

  const statusColor = STATUS_COLORS[project.status] || '#71717a'

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: 280,
        background: 'var(--panel-bg)',
        border: '1.5px solid var(--panel-border)',
        borderRadius: 10,
        padding: 16,
        cursor: dragging.current ? 'grabbing' : 'grab',
        userSelect: 'none',
        backdropFilter: 'blur(24px)',
        transition: dragging.current ? 'none' : 'box-shadow .15s',
        boxShadow: hovered ? 'var(--node-hover-shadow)' : 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Hover actions */}
      {hovered && (
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(project) }}
            style={{
              width: 26, height: 26, borderRadius: 6,
              border: '1px solid var(--btn-border)',
              background: 'var(--btn-hover-bg)',
              color: 'var(--btn-hover-c)',
              cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✎</button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(project.id) }}
            style={{
              width: 26, height: 26, borderRadius: 6,
              border: '1px solid var(--btn-border)',
              background: 'var(--btn-hover-bg)',
              color: '#ef4444',
              cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>
      )}

      {/* Header: name + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ color: 'var(--modal-title)', fontSize: 14, fontWeight: 600, flex: 1 }}>
          {project.name}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px',
          padding: '2px 8px', borderRadius: 20,
          background: statusColor + '20', color: statusColor,
        }}>
          {project.status}
        </span>
      </div>

      {/* Description */}
      {project.desc && (
        <div style={{ fontSize: 12, color: 'var(--node-desc)', marginBottom: 8, lineHeight: 1.4 }}>
          {project.desc}
        </div>
      )}

      {/* URL */}
      {project.url && (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'inline-block', fontSize: 11, color: 'var(--accent)',
            marginBottom: 8, textDecoration: 'none', wordBreak: 'break-all',
          }}
        >
          {project.url}
        </a>
      )}

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {project.tags.map((tag, i) => (
            <span key={i} style={{
              fontSize: 10, padding: '2px 7px', borderRadius: 6,
              background: 'var(--btn-hover-bg)', color: 'var(--btn-c)',
              border: '1px solid var(--btn-border)',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: lead + task count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        {project.lead && (
          <span style={{ fontSize: 11, color: 'var(--hud-c)' }}>
            {project.lead}
          </span>
        )}
        <span style={{ fontSize: 11, color: 'var(--hud-val)', marginLeft: 'auto' }}>
          {taskCount} task{taskCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
