'use client'

import { Suspense, lazy, Component, useEffect, useState, type ReactNode } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

// ── Error boundary so a Spline load failure never crashes the whole page ──
// The 3D scene is purely decorative — if Spline's CDN, the .splinecode binary,
// or WebGL fails for any reason, render a graceful gradient fallback instead.
class SplineErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: ReactNode; children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    // Log but don't crash — Spline often fails in dev mode HMR
    console.warn('[SplineScene] failed to render 3D scene, using fallback:', error.message)
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

// ── Fallback: animated gradient orb that matches the brand ──
function SplineFallback({ className }: { className?: string }) {
  return (
    <div className={`w-full h-full flex items-center justify-center relative overflow-hidden ${className ?? ''}`}>
      {/* Background gradient orbs */}
      <div
        className="absolute w-[140%] h-[140%] rounded-full opacity-30"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(79,142,247,0.5) 0%, transparent 50%), ' +
            'radial-gradient(circle at 70% 70%, rgba(167,139,250,0.4) 0%, transparent 50%)',
          filter: 'blur(40px)',
          animation: 'sFloat 14s ease-in-out infinite',
        }}
      />

      {/* Central glowing orb */}
      <div
        className="relative w-48 h-48 rounded-full flex items-center justify-center"
        style={{
          background:
            'radial-gradient(circle, rgba(79,142,247,0.9) 0%, rgba(26,86,219,0.6) 40%, transparent 70%)',
          boxShadow: '0 0 80px rgba(79,142,247,0.6), inset 0 0 60px rgba(167,139,250,0.4)',
          animation: 'sPulse 4s ease-in-out infinite',
        }}
      >
        <div
          className="w-32 h-32 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(79,142,247,0.3) 60%, transparent 100%)',
            backdropFilter: 'blur(10px)',
          }}
        />
      </div>

      {/* Rotating ring */}
      <div
        className="absolute w-72 h-72 rounded-full border-2 border-[rgba(79,142,247,0.2)]"
        style={{ animation: 'sRotate 20s linear infinite' }}
      />

      <style>{`
        @keyframes sFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-2%, 2%) scale(1.05); }
        }
        @keyframes sPulse {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes sRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// ── Loading state — same animated ring as before ──
function SplineLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative flex items-center justify-center w-24 h-24">
        <div className="absolute inset-0 rounded-full border-2 border-[rgba(79,142,247,0.15)]" />
        <div className="absolute inset-0 rounded-full border-2 border-t-[#4f8ef7] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <div className="w-2 h-2 rounded-full bg-[#4f8ef7] shadow-[0_0_12px_#4f8ef7]" />
      </div>
    </div>
  )
}

// Setting NEXT_PUBLIC_DISABLE_SPLINE=1 forces the safe fallback orb everywhere.
// We default to fallback-first behaviour because the Spline runtime has thrown
// unhandled async errors ("Data read, but end of buffer not reached") in
// production that aren't catchable by React error boundaries. We render the
// fallback immediately, then *optionally* try to swap in the real 3D scene on
// the client. If anything in that swap throws, we stay on the fallback.
export function SplineScene({ scene, className }: SplineSceneProps) {
  const [showReal, setShowReal] = useState(false)
  const disabled = process.env.NEXT_PUBLIC_DISABLE_SPLINE === '1'

  useEffect(() => {
    if (disabled) return
    // Only attempt to load the heavy 3D scene after first paint to avoid
    // blocking the hero render — and only if we successfully prefetched the
    // .splinecode binary. If the prefetch fails for any reason, the user just
    // sees the fallback orb (which already matches the brand).
    let cancelled = false
    fetch(scene, { method: 'HEAD' })
      .then((res) => {
        if (!cancelled && res.ok) setShowReal(true)
      })
      .catch(() => {
        // network/CDN issue — stay on fallback, never throw
      })
    return () => {
      cancelled = true
    }
  }, [scene, disabled])

  if (!showReal) return <SplineFallback className={className} />

  return (
    <SplineErrorBoundary fallback={<SplineFallback className={className} />}>
      <Suspense fallback={<SplineLoading />}>
        <Spline scene={scene} className={className} />
      </Suspense>
    </SplineErrorBoundary>
  )
}
