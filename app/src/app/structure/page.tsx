'use client'

import Canvas from '@/components/canvas/Canvas'

export default function StructurePage() {
  return (
    <div className="h-full relative">
      <Canvas>
        <div className="text-[var(--hud-c)] text-sm absolute top-10 left-10">
          Structure view — mind map nodes will render here
        </div>
      </Canvas>
    </div>
  )
}
