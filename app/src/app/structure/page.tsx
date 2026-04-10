'use client'

import { useState, useEffect, useCallback } from 'react'
import Canvas from '@/components/canvas/Canvas'
import EdgeLayer from '@/components/structure/EdgeLayer'
import MindMapNodeCard from '@/components/structure/MindMapNode'
import EditModal from '@/components/structure/EditModal'
import NodeCanvas from '@/components/structure/NodeCanvas'
import { supabase } from '@/lib/supabase'
import type { MindMapNode, Edge } from '@/lib/types'

export default function StructurePage() {
  const [nodes, setNodes] = useState<MindMapNode[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [editingNode, setEditingNode] = useState<MindMapNode | null>(null)
  const [openNode, setOpenNode] = useState<MindMapNode | null>(null)

  // Fetch data on mount
  useEffect(() => {
    async function load() {
      const [nodesRes, edgesRes] = await Promise.all([
        supabase.from('nodes').select('*'),
        supabase.from('edges').select('*'),
      ])
      if (nodesRes.data) setNodes(nodesRes.data as MindMapNode[])
      if (edgesRes.data) setEdges(edgesRes.data as Edge[])
    }
    load()
  }, [])

  // Live drag: update position so edges follow
  const handleDragMove = useCallback((id: string, x: number, y: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n))
  }, [])

  // Drag end: persist to Supabase
  const handleDragEnd = useCallback(async (id: string, x: number, y: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n))
    await supabase.from('nodes').update({ x, y }).eq('id', id)
  }, [])

  // Edit save
  const handleEditSave = useCallback(async (updates: Partial<MindMapNode>) => {
    if (!editingNode) return
    const id = editingNode.id
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n))
    await supabase.from('nodes').update(updates).eq('id', id)
  }, [editingNode])

  // Color change
  const handleColorChange = useCallback(async (id: string, color: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, color } : n))
    await supabase.from('nodes').update({ color }).eq('id', id)
  }, [])

  // Add child
  const handleAddChild = useCallback(async (parentId: string) => {
    const parent = nodes.find(n => n.id === parentId)
    if (!parent) return

    const newId = crypto.randomUUID()
    const newNode: MindMapNode = {
      id: newId,
      x: parent.x + 60,
      y: parent.y + 140,
      title: 'New node',
      desc: '',
      link: '',
      type: 'default',
      color: '#505068',
      status: 'todo',
    }

    setNodes(prev => [...prev, newNode])

    await supabase.from('nodes').insert(newNode)

    const { data: edgeData } = await supabase
      .from('edges')
      .insert({ from_id: parentId, to_id: newId, edge_type: 'hierarchy' })
      .select()
      .single()

    if (edgeData) {
      setEdges(prev => [...prev, edgeData as Edge])
    }
  }, [nodes])

  // Delete node + edges
  const handleDelete = useCallback(async (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id))
    setEdges(prev => prev.filter(e => e.from_id !== id && e.to_id !== id))
    await supabase.from('nodes').delete().eq('id', id)
    // edges cascade via DB foreign key
  }, [])

  return (
    <div className="h-full relative">
      <Canvas
        overlay={(pz) => (
          <EdgeLayer edges={edges} nodes={nodes} panZoom={pz} />
        )}
      >
        {nodes.map(node => (
          <MindMapNodeCard
            key={node.id}
            node={node}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
            onEdit={setEditingNode}
            onColorChange={handleColorChange}
            onAddChild={handleAddChild}
            onDelete={handleDelete}
            onOpen={setOpenNode}
          />
        ))}
      </Canvas>

      {editingNode && (
        <EditModal
          node={editingNode}
          onSave={handleEditSave}
          onClose={() => setEditingNode(null)}
        />
      )}

      {openNode && (
        <NodeCanvas
          node={openNode}
          onClose={() => setOpenNode(null)}
        />
      )}
    </div>
  )
}
