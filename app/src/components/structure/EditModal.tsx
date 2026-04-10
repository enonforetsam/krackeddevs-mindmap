'use client'

import { useState, useEffect } from 'react'
import type { MindMapNode } from '@/lib/types'

interface EditModalProps {
  node: MindMapNode
  onSave: (updates: Partial<MindMapNode>) => void
  onClose: () => void
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  border: '1.5px solid var(--input-border)',
  background: 'var(--input-bg)',
  color: 'var(--input-c)',
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 500,
  color: 'var(--modal-label)',
  marginBottom: 4,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

const NODE_TYPES = ['root', 'labs', 'acad', 'accel', 'people', 'default']

export default function EditModal({ node, onSave, onClose }: EditModalProps) {
  const [title, setTitle] = useState(node.title)
  const [desc, setDesc] = useState(node.desc)
  const [link, setLink] = useState(node.link)
  const [type, setType] = useState(node.type)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSave = () => {
    onSave({ title, desc, link, type })
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--modal-bg)',
          border: '1.5px solid var(--modal-border)',
          borderRadius: 12,
          padding: 24,
          width: 380,
          maxWidth: '90vw',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: 'var(--modal-title)' }}>
          Edit Node
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input
              style={inputStyle}
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Link</label>
            <input
              style={inputStyle}
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <label style={labelStyle}>Type</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={type}
              onChange={e => setType(e.target.value)}
            >
              {NODE_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '7px 16px',
              borderRadius: 8,
              border: '1.5px solid var(--cancel-border)',
              background: 'transparent',
              color: 'var(--cancel-c)',
              fontSize: 13,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '7px 16px',
              borderRadius: 8,
              border: '1.5px solid var(--accent)',
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
