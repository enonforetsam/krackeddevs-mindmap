'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { MindMapNode, CanvasItem } from '@/lib/types'

const STICKY_BG: Record<string, string> = {
  yellow: '#fef3a8', pink: '#ffc8d4', blue: '#b8e0ff', green: '#c4f0c4', orange: '#ffd7a8',
}
const STICKY_COLORS = Object.keys(STICKY_BG)

interface NodeCanvasProps {
  node: MindMapNode
  onClose: () => void
}

export default function NodeCanvas({ node, onClose }: NodeCanvasProps) {
  const [items, setItems] = useState<CanvasItem[]>([])
  const [pan, setPan] = useState({ x: 60, y: 60 })
  const [zoom, setZoom] = useState(1)
  const [panning, setPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0 })
  const panOrigin = useRef({ x: 0, y: 0 })
  const dragId = useRef<string | null>(null)
  const dragOff = useRef({ x: 0, y: 0 })
  const areaRef = useRef<HTMLDivElement>(null)

  const borderColor = node.color || '#505068'

  useEffect(() => {
    supabase.from('canvas_items').select('*').eq('node_id', node.id).then(({ data }) => {
      if (data) setItems(data as CanvasItem[])
    })
  }, [node.id])

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Canvas coords
  const toCanvas = useCallback((cx: number, cy: number) => {
    const r = areaRef.current?.getBoundingClientRect()
    if (!r) return { x: 0, y: 0 }
    return { x: (cx - r.left - pan.x) / zoom, y: (cy - r.top - pan.y) / zoom }
  }, [pan, zoom])

  const center = useCallback(() => {
    const r = areaRef.current?.getBoundingClientRect()
    if (!r) return { x: 100, y: 100 }
    return { x: (r.width / 2 - pan.x) / zoom, y: (r.height / 2 - pan.y) / zoom }
  }, [pan, zoom])

  // Pan
  const handlePanDown = useCallback((e: React.MouseEvent) => {
    if (e.target !== areaRef.current) return
    setPanning(true)
    panStart.current = { x: e.clientX, y: e.clientY }
    panOrigin.current = { ...pan }
    const onMove = (ev: MouseEvent) => {
      setPan({ x: panOrigin.current.x + (ev.clientX - panStart.current.x), y: panOrigin.current.y + (ev.clientY - panStart.current.y) })
    }
    const onUp = () => {
      setPanning(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [pan])

  // Zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const r = areaRef.current?.getBoundingClientRect()
    if (!r) return
    const mx = e.clientX - r.left, my = e.clientY - r.top
    const nz = Math.min(Math.max(zoom * (e.deltaY < 0 ? 1.1 : 0.9), 0.3), 3)
    setPan({ x: mx - (mx - pan.x) * (nz / zoom), y: my - (my - pan.y) * (nz / zoom) })
    setZoom(nz)
  }, [pan, zoom])

  // Item drag
  const startItemDrag = useCallback((e: React.MouseEvent, id: string) => {
    const editable = (e.target as HTMLElement).closest('[contenteditable]')
    if (editable && document.activeElement === editable) return
    if ((e.target as HTMLElement).closest('.mc-actions, .mc-colors')) return
    e.stopPropagation()
    e.preventDefault()
    dragId.current = id
    const it = items.find(i => i.id === id)
    if (!it) return
    const pos = toCanvas(e.clientX, e.clientY)
    dragOff.current = { x: pos.x - it.x, y: pos.y - it.y }
    const onMove = (ev: MouseEvent) => {
      const p = toCanvas(ev.clientX, ev.clientY)
      setItems(prev => prev.map(i => i.id === id ? { ...i, x: p.x - dragOff.current.x, y: p.y - dragOff.current.y } : i))
    }
    const onUp = () => {
      if (dragId.current) {
        const it = items.find(i => i.id === dragId.current)
        if (it) supabase.from('canvas_items').update({ x: it.x, y: it.y }).eq('id', it.id)
      }
      dragId.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [items, toCanvas])

  // CRUD
  const addItem = useCallback(async (type: CanvasItem['type'], extra: Partial<CanvasItem> = {}) => {
    const c = center()
    const newItem: Omit<CanvasItem, 'id'> & { id: string } = {
      id: crypto.randomUUID(),
      node_id: node.id,
      type,
      x: c.x - 60,
      y: c.y - 30,
      text: '',
      title: '',
      body: '',
      shape: extra.shape || '',
      color: extra.color || 'yellow',
    }
    setItems(prev => [...prev, newItem])
    await supabase.from('canvas_items').insert(newItem)
  }, [node.id, center])

  const updateItem = useCallback(async (id: string, updates: Partial<CanvasItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
    await supabase.from('canvas_items').update(updates).eq('id', id)
  }, [])

  const deleteItem = useCallback(async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from('canvas_items').delete().eq('id', id)
  }, [])

  const btnStyle: React.CSSProperties = {
    padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 500,
    border: '1px solid var(--btn-border)', background: 'transparent',
    color: 'var(--btn-c)', cursor: 'pointer', fontFamily: 'inherit',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: '85vw', height: '80vh', maxWidth: 1100, maxHeight: 750,
        background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
        borderRadius: 12, display: 'flex', flexDirection: 'column',
        overflow: 'hidden', boxShadow: '0 16px 60px rgba(0,0,0,.5)',
        backdropFilter: 'blur(20px)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', borderBottom: '1px solid var(--picker-divider)',
          flexShrink: 0,
        }}>
          <button onClick={onClose} style={{
            ...btnStyle, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            ← Close
          </button>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: borderColor, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--modal-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {node.title}
            </div>
            {node.desc && (
              <div style={{ fontSize: 11, color: 'var(--hud-c)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {node.desc}
              </div>
            )}
          </div>
          <div style={{
            display: 'flex', gap: 3, background: 'var(--input-bg)',
            border: '1px solid var(--panel-border)', borderRadius: 6, padding: '3px 5px',
          }}>
            <button style={btnStyle} onClick={() => addItem('text')}>Text</button>
            <button style={btnStyle} onClick={() => addItem('sticky', { color: 'yellow' })}>Sticky</button>
            <button style={btnStyle} onClick={() => addItem('shape', { shape: 'rect' })}>▭</button>
            <button style={btnStyle} onClick={() => addItem('shape', { shape: 'circle' })}>○</button>
            <button style={btnStyle} onClick={() => addItem('subbox')}>Box</button>
          </div>
        </div>

        {/* Canvas area */}
        <div
          ref={areaRef}
          style={{
            flex: 1, position: 'relative', overflow: 'hidden',
            cursor: panning ? 'grabbing' : 'grab',
            background: 'var(--bg)',
            backgroundImage: 'radial-gradient(circle, var(--grid-c) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            borderRadius: '0 0 12px 12px',
          }}
          onMouseDown={handlePanDown}
          onWheel={handleWheel}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, width: 1, height: 1,
            transformOrigin: '0 0', transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
            willChange: 'transform',
          }}>
            {items.map(it => (
              <CanvasItemEl
                key={it.id}
                item={it}
                onMouseDown={(e) => startItemDrag(e, it.id)}
                onUpdate={updateItem}
                onDelete={deleteItem}
              />
            ))}
          </div>

          {/* Zoom HUD */}
          <div style={{
            position: 'absolute', bottom: 14, right: 14,
            fontSize: 11, color: 'var(--hud-c)', fontFamily: 'monospace',
            background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
            padding: '6px 12px', borderRadius: 8, backdropFilter: 'blur(16px)',
          }}>
            <span style={{ color: 'var(--hud-val)' }}>{Math.round(zoom * 100)}%</span> zoom
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Individual canvas items ── */
function CanvasItemEl({ item, onMouseDown, onUpdate, onDelete }: {
  item: CanvasItem
  onMouseDown: (e: React.MouseEvent) => void
  onUpdate: (id: string, u: Partial<CanvasItem>) => void
  onDelete: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)

  const delBtn = (
    <div className="mc-actions" style={{
      position: 'absolute', top: -10, right: -6,
      display: hovered ? 'flex' : 'none', gap: 2,
      background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
      borderRadius: 6, padding: '2px 3px', backdropFilter: 'blur(12px)',
      boxShadow: '0 2px 8px rgba(0,0,0,.2)',
    }}>
      <button onClick={(e) => { e.stopPropagation(); onDelete(item.id) }} style={{
        width: 22, height: 22, borderRadius: 5, border: 'none', cursor: 'pointer',
        fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', color: '#f43f5e',
      }}>×</button>
    </div>
  )

  if (item.type === 'text') {
    return (
      <div
        onMouseDown={onMouseDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'absolute', left: item.x, top: item.y,
          minWidth: 120, maxWidth: 300,
          background: 'var(--panel-bg)', border: '1.5px solid var(--panel-border)',
          borderRadius: 8, padding: '10px 12px',
          cursor: 'grab', userSelect: 'none',
        }}
      >
        {delBtn}
        <div
          contentEditable suppressContentEditableWarning
          onBlur={(e) => onUpdate(item.id, { text: e.currentTarget.innerText })}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ outline: 'none', fontSize: 13, lineHeight: 1.5, color: 'var(--modal-text)', minHeight: 20, cursor: 'text', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
        >
          {item.text || ''}
        </div>
      </div>
    )
  }

  if (item.type === 'sticky') {
    const bg = STICKY_BG[item.color || 'yellow'] || STICKY_BG.yellow
    return (
      <div
        onMouseDown={onMouseDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'absolute', left: item.x, top: item.y,
          width: 180, minHeight: 120,
          padding: '12px 12px 32px', borderRadius: 8,
          background: bg, color: '#2a2410',
          cursor: 'grab', userSelect: 'none',
          boxShadow: '0 2px 10px rgba(0,0,0,.12)',
        }}
      >
        {delBtn}
        <div
          contentEditable suppressContentEditableWarning
          onBlur={(e) => onUpdate(item.id, { text: e.currentTarget.innerText })}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ outline: 'none', fontSize: 13, lineHeight: 1.5, minHeight: 60, cursor: 'text', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
        >
          {item.text || ''}
        </div>
        {hovered && (
          <div className="mc-colors" style={{ position: 'absolute', bottom: 6, left: 10, display: 'flex', gap: 4 }}>
            {STICKY_COLORS.map(c => (
              <span
                key={c}
                onClick={(e) => { e.stopPropagation(); onUpdate(item.id, { color: c }) }}
                style={{ width: 12, height: 12, borderRadius: '50%', background: STICKY_BG[c], cursor: 'pointer', border: '1px solid rgba(0,0,0,.2)' }}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (item.type === 'shape') {
    const isCircle = item.shape === 'circle'
    return (
      <div
        onMouseDown={onMouseDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'absolute', left: item.x, top: item.y,
          cursor: 'grab', userSelect: 'none',
        }}
      >
        {delBtn}
        <div style={{
          width: isCircle ? 80 : 120, height: 80,
          border: '1.5px solid var(--panel-border)',
          borderRadius: isCircle ? '50%' : 8,
          background: 'var(--input-bg)',
        }} />
      </div>
    )
  }

  if (item.type === 'subbox') {
    return (
      <div
        onMouseDown={onMouseDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'absolute', left: item.x, top: item.y,
          width: 180, background: 'var(--panel-bg)',
          border: '1.5px solid var(--panel-border)',
          borderRadius: 10, padding: '12px 14px',
          cursor: 'grab', userSelect: 'none',
        }}
      >
        {delBtn}
        <div
          contentEditable suppressContentEditableWarning
          onBlur={(e) => onUpdate(item.id, { title: e.currentTarget.innerText })}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ fontSize: 13, fontWeight: 600, color: 'var(--modal-text)', marginBottom: 4, outline: 'none', cursor: 'text' }}
        >
          {item.title || ''}
        </div>
        <div
          contentEditable suppressContentEditableWarning
          onBlur={(e) => onUpdate(item.id, { body: e.currentTarget.innerText })}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ fontSize: 11.5, lineHeight: 1.5, color: 'var(--node-desc)', outline: 'none', cursor: 'text' }}
        >
          {item.body || ''}
        </div>
      </div>
    )
  }

  return null
}
