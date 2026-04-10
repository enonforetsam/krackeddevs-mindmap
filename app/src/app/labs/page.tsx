'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Canvas from '@/components/canvas/Canvas'
import ProjectCard from '@/components/canvas/ProjectCard'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/lib/types'

const STATUSES = ['live', 'beta', 'building', 'idea', 'paused'] as const
const STATUS_COLORS: Record<string, string> = {
  live: '#22c55e',
  beta: '#3b82f6',
  building: '#f59e0b',
  idea: '#a78bfa',
  paused: '#71717a',
}

const EMPTY_PROJECT: Omit<Project, 'id'> = {
  name: '', url: '', status: 'idea', desc: '', tags: [], lead: '', x: 200, y: 200,
}

export default function LabsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({})
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [form, setForm] = useState(EMPTY_PROJECT)
  const [tagsInput, setTagsInput] = useState('')

  // Fetch projects and task counts
  useEffect(() => {
    async function load() {
      const { data: projectsData } = await supabase.from('projects').select('*')
      if (projectsData) {
        const prjs = projectsData as Project[]
        setProjects(prjs)

        // Count tasks per project via kanban_columns -> kanban_cards
        const counts: Record<string, number> = {}
        if (prjs.length > 0) {
          const { data: cols } = await supabase
            .from('kanban_columns')
            .select('id, project_id')
          if (cols && cols.length > 0) {
            const { data: cards } = await supabase
              .from('kanban_cards')
              .select('id, column_id')
            if (cards) {
              const colToProject: Record<string, string> = {}
              for (const col of cols) {
                colToProject[col.id] = col.project_id
              }
              for (const card of cards) {
                const pid = colToProject[card.column_id]
                if (pid) counts[pid] = (counts[pid] || 0) + 1
              }
            }
          }
        }
        setTaskCounts(counts)
      }
    }
    load()
  }, [])

  // Drag end — save position
  const handleDragEnd = useCallback(async (id: string, x: number, y: number) => {
    await supabase.from('projects').update({ x, y }).eq('id', id)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, x, y } : p))
  }, [])

  // Navigate to kanban board
  const handleClick = useCallback((project: Project) => {
    router.push(`/labs/${project.id}`)
  }, [router])

  // Open edit modal
  const handleEdit = useCallback((project: Project) => {
    setEditProject(project)
    setForm({
      name: project.name,
      url: project.url,
      status: project.status,
      desc: project.desc,
      tags: project.tags,
      lead: project.lead,
      x: project.x,
      y: project.y,
    })
    setTagsInput((project.tags || []).join(', '))
    setModalOpen(true)
  }, [])

  // Open new project modal
  const handleNew = useCallback(() => {
    setEditProject(null)
    setForm({ ...EMPTY_PROJECT })
    setTagsInput('')
    setModalOpen(true)
  }, [])

  // Delete project
  const handleDelete = useCallback(async (id: string) => {
    // Delete associated kanban data
    const { data: cols } = await supabase
      .from('kanban_columns')
      .select('id')
      .eq('project_id', id)
    if (cols && cols.length > 0) {
      const colIds = cols.map(c => c.id)
      await supabase.from('kanban_cards').delete().in('column_id', colIds)
    }
    await supabase.from('kanban_columns').delete().eq('project_id', id)
    await supabase.from('projects').delete().eq('id', id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }, [])

  // Save (create or update)
  const handleSave = useCallback(async () => {
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const payload = { ...form, tags }

    if (editProject) {
      await supabase.from('projects').update(payload).eq('id', editProject.id)
      setProjects(prev => prev.map(p => p.id === editProject.id ? { ...p, ...payload } : p))
    } else {
      const { data } = await supabase.from('projects').insert(payload).select().single()
      if (data) setProjects(prev => [...prev, data as Project])
    }
    setModalOpen(false)
  }, [editProject, form, tagsInput])

  const filtered = activeFilter
    ? projects.filter(p => p.status === activeFilter)
    : projects

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', borderRadius: 8, fontSize: 13,
    background: 'var(--input-bg)', border: '1.5px solid var(--input-border)',
    color: 'var(--input-c)', outline: 'none',
  }

  return (
    <div className="h-full relative">
      <Canvas>
        {filtered.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            taskCount={taskCounts[project.id] || 0}
            onDragEnd={handleDragEnd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClick={handleClick}
          />
        ))}
      </Canvas>

      {/* Top bar: filter chips + add button */}
      <div style={{
        position: 'fixed', top: 56, left: '50%', transform: 'translateX(-50%)',
        zIndex: 998, display: 'flex', gap: 6, alignItems: 'center',
        padding: '6px 10px', borderRadius: 10, backdropFilter: 'blur(24px)',
        background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
      }}>
        {/* All filter */}
        <button
          onClick={() => setActiveFilter(null)}
          style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            border: '1px solid ' + (activeFilter === null ? 'var(--accent)' : 'var(--btn-border)'),
            background: activeFilter === null ? 'var(--accent)' + '18' : 'transparent',
            color: activeFilter === null ? 'var(--accent)' : 'var(--btn-c)',
            cursor: 'pointer',
          }}
        >All</button>
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setActiveFilter(activeFilter === s ? null : s)}
            style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              textTransform: 'capitalize',
              border: '1px solid ' + (activeFilter === s ? STATUS_COLORS[s] : 'var(--btn-border)'),
              background: activeFilter === s ? STATUS_COLORS[s] + '18' : 'transparent',
              color: activeFilter === s ? STATUS_COLORS[s] : 'var(--btn-c)',
              cursor: 'pointer',
            }}
          >{s}</button>
        ))}
        <div style={{ width: 1, height: 20, background: 'var(--picker-divider)', margin: '0 4px' }} />
        <button
          onClick={handleNew}
          style={{
            padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            border: '1px solid var(--accent)',
            background: 'var(--accent)' + '18',
            color: 'var(--accent)',
            cursor: 'pointer',
          }}
        >+ Project</button>
      </div>

      {/* Edit/Create Modal */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 420, background: 'var(--modal-bg)',
              border: '1.5px solid var(--modal-border)',
              borderRadius: 12, padding: 24,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--modal-title)', marginBottom: 16 }}>
              {editProject ? 'Edit Project' : 'New Project'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--modal-label)', marginBottom: 4, display: 'block' }}>Name</label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Project name"
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--modal-label)', marginBottom: 4, display: 'block' }}>URL</label>
                <input
                  style={inputStyle}
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--modal-label)', marginBottom: 4, display: 'block' }}>Status</label>
                <select
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--modal-label)', marginBottom: 4, display: 'block' }}>Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                  value={form.desc}
                  onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                  placeholder="Brief description"
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--modal-label)', marginBottom: 4, display: 'block' }}>Tags (comma-separated)</label>
                <input
                  style={inputStyle}
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="react, api, infra"
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--modal-label)', marginBottom: 4, display: 'block' }}>Lead</label>
                <input
                  style={inputStyle}
                  value={form.lead}
                  onChange={e => setForm(f => ({ ...f, lead: e.target.value }))}
                  placeholder="Lead name"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  padding: '8px 18px', borderRadius: 8, fontSize: 13,
                  border: '1.5px solid var(--cancel-border)',
                  background: 'transparent', color: 'var(--cancel-c)',
                  cursor: 'pointer',
                }}
              >Cancel</button>
              <button
                onClick={handleSave}
                style={{
                  padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  border: '1.5px solid var(--accent)',
                  background: 'var(--accent)', color: '#fff',
                  cursor: 'pointer',
                }}
              >Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
