'use client'

import { useRef, useState, useCallback, type ReactNode, type MouseEvent, type WheelEvent } from 'react'

export interface PanZoom {
  pan: { x: number; y: number }
  zoom: number
}

interface CanvasProps {
  children: ReactNode
  className?: string
  overlay?: (pz: PanZoom) => ReactNode
  onPanZoomChange?: (pz: PanZoom) => void
}

export default function Canvas({ children, className = '', overlay, onPanZoomChange }: CanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [pan, setPan] = useState({ x: 80, y: 80 })
  const [zoom, setZoom] = useState(1)
  const [panning, setPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0 })
  const panOrigin = useRef({ x: 0, y: 0 })

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.target !== wrapRef.current) return
    setPanning(true)
    panStart.current = { x: e.clientX, y: e.clientY }
    panOrigin.current = { ...pan }

    const onMove = (ev: globalThis.MouseEvent) => {
      const newPan = {
        x: panOrigin.current.x + (ev.clientX - panStart.current.x),
        y: panOrigin.current.y + (ev.clientY - panStart.current.y),
      }
      setPan(newPan)
      onPanZoomChange?.({ pan: newPan, zoom })
    }
    const onUp = () => {
      setPanning(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [pan, zoom, onPanZoomChange])

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const newZoom = Math.min(Math.max(zoom * (e.deltaY < 0 ? 1.1 : 0.9), 0.3), 3)
    const newPan = {
      x: mx - (mx - pan.x) * (newZoom / zoom),
      y: my - (my - pan.y) * (newZoom / zoom),
    }
    setPan(newPan)
    setZoom(newZoom)
    onPanZoomChange?.({ pan: newPan, zoom: newZoom })
  }, [pan, zoom, onPanZoomChange])

  return (
    <div
      ref={wrapRef}
      className={`absolute inset-0 overflow-hidden ${panning ? 'cursor-grabbing' : 'cursor-grab'} ${className}`}
      style={{
        background: 'var(--bg)',
        backgroundImage: 'radial-gradient(circle, var(--grid-c) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
      data-canvas-zoom={zoom}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
    >
      {overlay?.({ pan, zoom })}

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1,
          height: 1,
          transformOrigin: '0 0',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          willChange: 'transform',
        }}
      >
        {children}
      </div>

      <div
        className="absolute bottom-3.5 right-3.5 text-[11px] font-mono px-3 py-1.5 rounded-lg backdrop-blur-2xl"
        style={{
          color: 'var(--hud-c)',
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
        }}
      >
        <span style={{ color: 'var(--hud-val)' }}>{Math.round(zoom * 100)}%</span> zoom
      </div>
    </div>
  )
}
