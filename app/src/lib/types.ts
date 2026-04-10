export interface MindMapNode {
  id: string
  x: number
  y: number
  title: string
  desc: string
  link: string
  type: string
  color?: string
  status: string
}

export interface Edge {
  id: string
  from_id: string
  to_id: string
  edge_type: string // 'hierarchy' | 'supports'
}

export interface TeamMember {
  id: string
  name: string
  role: string
  dept: string
  emp: string
  email: string
  twitter: string
  github: string
  x: number
  y: number
}

export interface Project {
  id: string
  name: string
  url: string
  status: string
  desc: string
  tags: string[]
  lead: string
  x: number
  y: number
}

export interface KanbanColumn {
  id: string
  project_id: string
  name: string
  position: number
}

export interface KanbanCard {
  id: string
  column_id: string
  text: string
  color: string
  position: number
  created_at: string
}

export interface CanvasItem {
  id: string
  node_id: string
  type: 'text' | 'sticky' | 'shape' | 'subbox'
  x: number
  y: number
  text?: string
  title?: string
  body?: string
  shape?: string
  color?: string
}

export interface StickyNote {
  id: string
  view: string // 'team' | 'structure'
  x: number
  y: number
  text: string
  color: string
}
