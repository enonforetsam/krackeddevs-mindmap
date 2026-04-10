'use client'

import Canvas from '@/components/canvas/Canvas'

export default function TeamPage() {
  return (
    <div className="h-full relative">
      <Canvas>
        <div className="text-[var(--hud-c)] text-sm absolute top-10 left-10">
          Team view — person cards will render here
        </div>
      </Canvas>
    </div>
  )
}
