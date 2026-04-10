'use client'

import type { MindMapNode, Edge } from '@/lib/types'
import type { PanZoom } from '@/components/canvas/Canvas'

const NODE_W = 220
const NODE_H = 100

interface EdgeLayerProps {
  edges: Edge[]
  nodes: MindMapNode[]
  panZoom: PanZoom
}

export default function EdgeLayer({ edges, nodes, panZoom }: EdgeLayerProps) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  const { pan, zoom } = panZoom

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {edges.map(edge => {
        const src = nodeMap.get(edge.from_id)
        const tgt = nodeMap.get(edge.to_id)
        if (!src || !tgt) return null

        const x1 = pan.x + (src.x + NODE_W / 2) * zoom
        const y1 = pan.y + (src.y + NODE_H / 2) * zoom
        const x2 = pan.x + (tgt.x + NODE_W / 2) * zoom
        const y2 = pan.y + (tgt.y + NODE_H / 2) * zoom

        const dashed = edge.edge_type === 'supports'
        const strokeColor = src.color || '#505068'

        return (
          <line
            key={edge.id}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={strokeColor}
            strokeWidth={1.5 * zoom}
            strokeOpacity={0.35}
            strokeDasharray={dashed ? `${6 * zoom} ${4 * zoom}` : undefined}
          />
        )
      })}
    </svg>
  )
}
