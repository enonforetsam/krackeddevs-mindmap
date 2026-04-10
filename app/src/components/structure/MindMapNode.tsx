'use client'

import { useState, useRef, useCallback, memo } from 'react'
import type { MindMapNode as NodeType } from '@/lib/types'
import { NODE_COLORS, textColorFor, resolveNodeColor } from '@/lib/themes'

interface MindMapNodeProps {
  node: NodeType
  onDragEnd: (id: string, x: number, y: number) => void
  onDragMove: (id: string, x: number, y: number) => void
  onEdit: (node: NodeType) => void
  onColorChange: (id: string, color: string) => void
  onAddChild: (parentId: string) => void
  onDelete: (id: string) => void
  onOpen: (node: NodeType) => void
}

const NODE_W = 220

function MindMapNodeCardInner({
  node,
  onDragEnd,
  onDragMove,
  onEdit,
  onColorChange,
  onAddChild,
  onDelete,
  onOpen,
}: MindMapNodeProps) {
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const nodeStart = useRef({ x: 0, y: 0 })
  const [pos, setPos] = useState({ x: node.x, y: node.y })
  const posRef = useRef(pos)

  // Resolve node color
  const resolved = resolveNodeColor(node.color)
  const hasCustomColor = !!resolved
  const nodeBg = resolved ? resolved.bg : 'var(--panel-bg)'
  const nodeBorder = resolved ? resolved.border : (node.color || '#505068')
  const nodeTextColor = resolved ? resolved.text : 'var(--modal-title)'
  const nodeDescColor = resolved ? resolved.desc : 'var(--node-desc)'
  const nodeLinkColor = resolved ? resolved.link : 'var(--accent)'
  const nodeDivider = resolved ? resolved.divider : 'var(--node-link-border)'
  const dotColor = resolved ? resolved.dot : nodeBorder
  const menuBtnColor = resolved ? resolved.menuBtn : 'var(--btn-c)'

  const rafId = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    dragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY }
    nodeStart.current = { x: posRef.current.x, y: posRef.current.y }

    const canvasEl = (e.target as HTMLElement).closest('[data-canvas-zoom]')
    const getZoom = () => canvasEl ? parseFloat(canvasEl.getAttribute('data-canvas-zoom') || '1') : 1

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      const scale = getZoom()
      const newX = nodeStart.current.x + (ev.clientX - dragStart.current.x) / scale
      const newY = nodeStart.current.y + (ev.clientY - dragStart.current.y) / scale
      posRef.current = { x: newX, y: newY }
      cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(() => {
        setPos({ ...posRef.current })
        onDragMove(node.id, posRef.current.x, posRef.current.y)
      })
    }

    const onUp = () => {
      if (dragging.current) {
        dragging.current = false
        cancelAnimationFrame(rafId.current)
        onDragEnd(node.id, posRef.current.x, posRef.current.y)
      }
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [node.id, onDragEnd, onDragMove])

  // Sync pos when node prop changes from external source
  if (!dragging.current && (pos.x !== node.x || pos.y !== node.y)) {
    const newPos = { x: node.x, y: node.y }
    posRef.current = newPos
    setPos(newPos)
  }

  const actionBtnStyle: React.CSSProperties = {
    padding: '5px 10px',
    fontSize: 11,
    fontFamily: 'inherit',
    background: 'transparent',
    border: 'none',
    color: 'var(--modal-text)',
    cursor: 'pointer',
    textAlign: 'left',
    borderRadius: 6,
    width: '100%',
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: NODE_W,
        background: nodeBg,
        border: `1.5px solid ${nodeBorder}`,
        borderRadius: 10,
        padding: '12px 14px',
        cursor: 'grab',
        userSelect: 'none',
        backdropFilter: 'blur(12px)',
        zIndex: menuOpen || colorPickerOpen ? 100 : 1,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setMenuOpen(false)
        setColorPickerOpen(false)
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: dotColor,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: nodeTextColor,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {node.title}
        </span>

        {/* Menu toggle */}
        {hovered && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(v => !v)
              setColorPickerOpen(false)
            }}
            onMouseDown={e => e.stopPropagation()}
            style={{
              background: 'transparent',
              border: 'none',
              color: menuBtnColor,
              cursor: 'pointer',
              fontSize: 16,
              lineHeight: 1,
              padding: '0 2px',
              flexShrink: 0,
            }}
          >
            &#x22EF;
          </button>
        )}
      </div>

      {/* Description */}
      {node.desc && (
        <div
          style={{
            fontSize: 11,
            color: nodeDescColor,
            lineHeight: 1.4,
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {node.desc}
        </div>
      )}

      {/* Link */}
      {node.link && (
        <div
          style={{
            fontSize: 10,
            color: nodeLinkColor,
            borderTop: `1px solid ${nodeDivider}`,
            paddingTop: 6,
            marginTop: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {node.link}
        </div>
      )}

      {/* Inline menu */}
      {menuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            background: 'var(--modal-bg)',
            border: '1.5px solid var(--modal-border)',
            borderRadius: 10,
            padding: 4,
            minWidth: 140,
            zIndex: 200,
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          <button
            style={actionBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--btn-hover-bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            onClick={e => { e.stopPropagation(); setMenuOpen(false); onEdit(node) }}
          >
            Edit
          </button>
          <button
            style={actionBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--btn-hover-bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            onClick={e => {
              e.stopPropagation()
              setMenuOpen(false)
              setColorPickerOpen(v => !v)
            }}
          >
            Color
          </button>
          <button
            style={actionBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--btn-hover-bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            onClick={e => { e.stopPropagation(); setMenuOpen(false); onAddChild(node.id) }}
          >
            Add Child
          </button>
          <button
            style={actionBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--btn-hover-bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            onClick={e => { e.stopPropagation(); setMenuOpen(false); onOpen(node) }}
          >
            Open
          </button>
          <div style={{ height: 1, background: 'var(--picker-divider)', margin: '2px 0' }} />
          <button
            style={{ ...actionBtnStyle, color: '#ef4444' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--btn-hover-bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            onClick={e => { e.stopPropagation(); setMenuOpen(false); onDelete(node.id) }}
          >
            Delete
          </button>
        </div>
      )}

      {/* Color picker */}
      {colorPickerOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            background: 'var(--modal-bg)',
            border: '1.5px solid var(--modal-border)',
            borderRadius: 10,
            padding: 10,
            zIndex: 200,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            width: 180,
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          {NODE_COLORS.map(c => (
            <button
              key={c.key}
              onClick={e => {
                e.stopPropagation()
                onColorChange(node.id, c.key)
                setColorPickerOpen(false)
              }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: c.bg,
                border: (node.color === c.key || node.color === c.border) ? `2px solid ${textColorFor(c.bg)}` : '2px solid transparent',
                cursor: 'pointer',
                padding: 0,
              }}
              title={c.key}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const MindMapNodeCard = memo(MindMapNodeCardInner)
export default MindMapNodeCard
