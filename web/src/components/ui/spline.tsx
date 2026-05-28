'use client'

import { Suspense, lazy } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative flex items-center justify-center w-24 h-24">
            {/* Animated ring loader matching AfterHours brand */}
            <div className="absolute inset-0 rounded-full border-2 border-[rgba(79,142,247,0.15)]" />
            <div className="absolute inset-0 rounded-full border-2 border-t-[#4f8ef7] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="w-2 h-2 rounded-full bg-[#4f8ef7] shadow-[0_0_12px_#4f8ef7]" />
          </div>
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  )
}
