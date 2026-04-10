'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Canvas, { type PanZoom } from '@/components/canvas/Canvas'
import TeamCard from '@/components/canvas/TeamCard'
import StickyNote from '@/components/canvas/StickyNote'
import { supabase } from '@/lib/supabase'
import type { TeamMember, StickyNote as StickyNoteType } from '@/lib/types'

const DEPARTMENTS = ['engineering', 'design', 'product', 'marketing', 'operations', 'finance', 'hr', 'legal', 'research', 'community']
const EMP_TYPES = ['fulltime', 'contract', 'parttime', 'intern', 'ambassador', 'pending'] as const

interface EditModal {
  open: boolean
  member: Partial<TeamMember> & { id?: string }
  isNew: boolean
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [stickies, setStickies] = useState<StickyNoteType[]>([])
  const [modal, setModal] = useState<EditModal>({ open: false, member: {}, isNew: false })
  const [deptFilter, setDeptFilter] = useState<string | null>(null)
  const [empFilter, setEmpFilter] = useState<string | null>(null)
  const pzRef = useRef<PanZoom>({ pan: { x: 80, y: 80 }, zoom: 1 })

  // ---- data loading ----
  useEffect(() => {
    async function load() {
      const [mRes, sRes] = await Promise.all([
        supabase.from('team_members').select('*'),
        supabase.from('sticky_notes').select('*').eq('view', 'team'),
      ])
      if (mRes.data) setMembers(mRes.data as TeamMember[])
      if (sRes.data) setStickies(sRes.data as StickyNoteType[])
    }
    load()
  }, [])

  // ---- team member CRUD ----
  const saveMemberPos = useCallback(async (id: string, x: number, y: number) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, x, y } : m)))
    await supabase.from('team_members').update({ x, y }).eq('id', id)
  }, [])

  const deleteMember = useCallback(async (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id))
    await supabase.from('team_members').delete().eq('id', id)
  }, [])

  const openEditModal = useCallback((member: TeamMember) => {
    setModal({ open: true, member: { ...member }, isNew: false })
  }, [])

  const openAddModal = useCallback(() => {
    setModal({
      open: true,
      member: { name: '', role: '', dept: 'engineering', emp: 'fulltime', email: '', twitter: '', github: '', x: 100, y: 100 },
      isNew: true,
    })
  }, [])

  const saveModal = useCallback(async () => {
    const m = modal.member
    if (!m.name) return
    if (modal.isNew) {
      const { data } = await supabase
        .from('team_members')
        .insert({
          name: m.name,
          role: m.role || '',
          dept: m.dept || 'engineering',
          emp: m.emp || 'fulltime',
          email: m.email || '',
          twitter: m.twitter || '',
          github: m.github || '',
          x: m.x ?? 100,
          y: m.y ?? 100,
        })
        .select()
        .single()
      if (data) setMembers((prev) => [...prev, data as TeamMember])
    } else if (m.id) {
      await supabase
        .from('team_members')
        .update({
          name: m.name,
          role: m.role || '',
          dept: m.dept || '',
          emp: m.emp || '',
          email: m.email || '',
          twitter: m.twitter || '',
          github: m.github || '',
        })
        .eq('id', m.id)
      setMembers((prev) => prev.map((old) => (old.id === m.id ? { ...old, ...m } as TeamMember : old)))
    }
    setModal({ open: false, member: {}, isNew: false })
  }, [modal])

  // ---- sticky CRUD ----
  const saveStickyPos = useCallback(async (id: string, x: number, y: number) => {
    setStickies((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)))
    await supabase.from('sticky_notes').update({ x, y }).eq('id', id)
  }, [])

  const saveStickyText = useCallback(async (id: string, text: string) => {
    setStickies((prev) => prev.map((s) => (s.id === id ? { ...s, text } : s)))
    await supabase.from('sticky_notes').update({ text }).eq('id', id)
  }, [])

  const saveStickyColor = useCallback(async (id: string, color: string) => {
    setStickies((prev) => prev.map((s) => (s.id === id ? { ...s, color } : s)))
    await supabase.from('sticky_notes').update({ color }).eq('id', id)
  }, [])

  const deleteSticky = useCallback(async (id: string) => {
    setStickies((prev) => prev.filter((s) => s.id !== id))
    await supabase.from('sticky_notes').delete().eq('id', id)
  }, [])

  const addSticky = useCallback(async () => {
    const { data } = await supabase
      .from('sticky_notes')
      .insert({ view: 'team', x: 200, y: 200, text: 'New note', color: 'yellow' })
      .select()
      .single()
    if (data) setStickies((prev) => [...prev, data as StickyNoteType])
  }, [])

  // ---- auto layout ----
  const autoLayout = useCallback(() => {
    const cols = 4
    const gapX = 250
    const gapY = 220
    const updated = members.map((m, i) => ({
      ...m,
      x: (i % cols) * gapX,
      y: Math.floor(i / cols) * gapY,
    }))
    setMembers(updated)
    updated.forEach((m) => {
      supabase.from('team_members').update({ x: m.x, y: m.y }).eq('id', m.id)
    })
  }, [members])

  // ---- reset view - remount Canvas to reset pan/zoom ----
  const [canvasKey, setCanvasKey] = useState(0)
  const resetView = useCallback(() => {
    setCanvasKey((k) => k + 1)
  }, [])

  // ---- filter logic ----
  const activeDepts = Array.from(new Set(members.map((m) => m.dept).filter(Boolean)))
  const activeEmps = Array.from(new Set(members.map((m) => m.emp).filter(Boolean)))

  const isHidden = (m: TeamMember) => {
    if (deptFilter && m.dept !== deptFilter) return true
    if (empFilter && m.emp !== empFilter) return true
    return false
  }

  // ---- modal field helper ----
  const setField = (key: string, value: string) => {
    setModal((prev) => ({ ...prev, member: { ...prev.member, [key]: value } }))
  }

  const btnStyle: React.CSSProperties = {
    padding: '6px 12px',
    borderRadius: 8,
    border: '1.5px solid var(--btn-border)',
    background: 'transparent',
    color: 'var(--btn-c)',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: '3px 9px',
    borderRadius: 6,
    border: active ? '1.5px solid var(--accent)' : '1.5px solid var(--btn-border)',
    background: active ? 'var(--accent)' + '18' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--btn-c)',
    fontSize: 11,
    cursor: 'pointer',
    textTransform: 'capitalize',
  })

  return (
    <div className="h-full relative">
      <Canvas
        key={canvasKey}
        onPanZoomChange={(pz) => { pzRef.current = pz }}
        overlay={() => (
          <>
            {/* floating toolbar */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
                display: 'flex',
                gap: 6,
                zIndex: 200,
                background: 'var(--panel-bg)',
                border: '1.5px solid var(--panel-border)',
                borderRadius: 10,
                padding: '6px 8px',
                backdropFilter: 'blur(24px)',
              }}
            >
              <button style={btnStyle} onClick={openAddModal}>
                + Person
              </button>
              <button style={btnStyle} onClick={addSticky}>
                + Sticky
              </button>
              <button style={btnStyle} onClick={resetView}>
                Reset view
              </button>
              <button style={btnStyle} onClick={autoLayout}>
                Auto layout
              </button>
            </div>

            {/* filter chips */}
            {(activeDepts.length > 0 || activeEmps.length > 0) && (
              <div
                style={{
                  position: 'absolute',
                  top: 56,
                  left: 14,
                  display: 'flex',
                  gap: 4,
                  flexWrap: 'wrap',
                  zIndex: 200,
                  maxWidth: 500,
                }}
              >
                {activeDepts.map((d) => (
                  <button
                    key={d}
                    style={chipStyle(deptFilter === d) as React.CSSProperties}
                    onClick={() => setDeptFilter(deptFilter === d ? null : d)}
                  >
                    {d}
                  </button>
                ))}
                <span style={{ width: 1, background: 'var(--panel-border)', margin: '0 2px' }} />
                {activeEmps.map((e) => (
                  <button
                    key={e}
                    style={chipStyle(empFilter === e) as React.CSSProperties}
                    onClick={() => setEmpFilter(empFilter === e ? null : e)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      >
        {/* team cards */}
        {members.map((m) => (
          <TeamCard
            key={m.id}
            member={m}
            onDragEnd={saveMemberPos}
            onEdit={openEditModal}
            onDelete={deleteMember}
            hidden={isHidden(m)}
          />
        ))}

        {/* sticky notes */}
        {stickies.map((s) => (
          <StickyNote
            key={s.id}
            note={s}
            onDragEnd={saveStickyPos}
            onTextChange={saveStickyText}
            onColorChange={saveStickyColor}
            onDelete={deleteSticky}
          />
        ))}
      </Canvas>

      {/* edit / add modal */}
      {modal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,.5)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setModal({ open: false, member: {}, isNew: false })}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--modal-bg)',
              border: '1.5px solid var(--modal-border)',
              borderRadius: 10,
              padding: 24,
              width: 360,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ color: 'var(--modal-title)', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
              {modal.isNew ? 'Add Person' : 'Edit Person'}
            </div>

            {/* Name */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--modal-label)' }}>Name</span>
              <input
                value={modal.member.name || ''}
                onChange={(e) => setField('name', e.target.value)}
                style={inputStyle}
              />
            </label>

            {/* Role */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--modal-label)' }}>Role</span>
              <input
                value={modal.member.role || ''}
                onChange={(e) => setField('role', e.target.value)}
                style={inputStyle}
              />
            </label>

            {/* Department */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--modal-label)' }}>Department</span>
              <select
                value={modal.member.dept || 'engineering'}
                onChange={(e) => setField('dept', e.target.value)}
                style={inputStyle}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            {/* Employment type */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--modal-label)' }}>Employment type</span>
              <select
                value={modal.member.emp || 'fulltime'}
                onChange={(e) => setField('emp', e.target.value)}
                style={inputStyle}
              >
                {EMP_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            {/* Email */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--modal-label)' }}>Email</span>
              <input
                value={modal.member.email || ''}
                onChange={(e) => setField('email', e.target.value)}
                style={inputStyle}
              />
            </label>

            {/* Twitter */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--modal-label)' }}>Twitter / X</span>
              <input
                value={modal.member.twitter || ''}
                onChange={(e) => setField('twitter', e.target.value)}
                style={inputStyle}
              />
            </label>

            {/* GitHub */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--modal-label)' }}>GitHub</span>
              <input
                value={modal.member.github || ''}
                onChange={(e) => setField('github', e.target.value)}
                style={inputStyle}
              />
            </label>

            {/* actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <button
                onClick={() => setModal({ open: false, member: {}, isNew: false })}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '1.5px solid var(--cancel-border)',
                  background: 'transparent',
                  color: 'var(--cancel-c)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveModal}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '1.5px solid var(--accent)',
                  background: 'var(--accent)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {modal.isNew ? 'Add' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '7px 10px',
  borderRadius: 8,
  border: '1.5px solid var(--input-border)',
  background: 'var(--input-bg)',
  color: 'var(--input-c)',
  fontSize: 13,
  outline: 'none',
}
