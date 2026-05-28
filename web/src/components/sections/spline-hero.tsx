'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { SplineScene } from '@/components/ui/spline'
import { Spotlight } from '@/components/ui/spotlight'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ── Animated stat pill ───────────────────────────────────────────────────────
function StatPill({
  value,
  label,
  delay = 0,
}: {
  value: string
  label: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center px-5 py-3 rounded-xl border border-[rgba(79,142,247,0.18)]
                 bg-[rgba(79,142,247,0.06)] backdrop-blur-sm"
    >
      <span
        className="text-2xl font-bold bg-gradient-to-r from-[#4f8ef7] via-[#82b4ff] to-[#a78bfa]
                   bg-clip-text text-transparent"
      >
        {value}
      </span>
      <span className="text-xs text-[#7a94b8] mt-0.5 text-center leading-tight">{label}</span>
    </motion.div>
  )
}

// ── Live-indicator badge ─────────────────────────────────────────────────────
function LiveBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                 border border-[rgba(34,211,160,0.3)] bg-[rgba(34,211,160,0.08)]
                 text-[#22d3a0] text-xs font-medium mb-6"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22d3a0] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22d3a0]" />
      </span>
      AI ANSWERING · LIVE 24 / 7
    </motion.div>
  )
}

// ── Glow orbit ring (decorative) ─────────────────────────────────────────────
function GlowRing({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'absolute rounded-full border border-[rgba(79,142,247,0.08)] pointer-events-none',
        className
      )}
    />
  )
}

// ── Main SplineHero component ────────────────────────────────────────────────
interface SplineHeroProps {
  /** Override the default Spline scene URL */
  sceneUrl?: string
  className?: string
}

export function SplineHero({
  sceneUrl = 'https://prod.spline.design/kZDDjO5HlviKgjXA/scene.splinecode',
  className,
}: SplineHeroProps) {
  return (
    <section
      id="home"
      className={cn(
        'relative w-full min-h-screen flex items-center overflow-hidden',
        'bg-[#000507]',
        className
      )}
    >
      {/* ── Background atmosphere ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Deep blue aurora */}
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20
                     bg-[radial-gradient(circle,rgba(79,142,247,0.6)_0%,transparent_70%)]
                     blur-3xl"
          style={{ animation: 'aOrb1 18s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-15
                     bg-[radial-gradient(circle,rgba(167,139,250,0.5)_0%,transparent_70%)]
                     blur-3xl"
          style={{ animation: 'aOrb2 22s ease-in-out infinite' }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(79,142,247,1) 1px, transparent 1px),' +
              'linear-gradient(90deg, rgba(79,142,247,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Orbit rings */}
        <GlowRing className="w-[520px] h-[520px] -bottom-32 -right-32" />
        <GlowRing className="w-[360px] h-[360px] -bottom-12 -right-12" />
      </div>

      {/* ── Spotlight ── */}
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="rgba(79,142,247,0.7)"
      />

      {/* ── Content wrapper ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* ── LEFT: Copy ── */}
          <div className="flex flex-col">
            <LiveBadge />

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
            >
              <span className="text-[#ddeeff]">Never Miss</span>
              <br />
              <span
                className="bg-gradient-to-r from-[#4f8ef7] via-[#82b4ff] to-[#a78bfa]
                           bg-clip-text text-transparent"
              >
                Another Call.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-lg text-[#7a94b8] leading-relaxed mb-8 max-w-xl"
            >
              AfterHours.AI answers every call, books appointments, and captures leads —
              even while you sleep. Sound exactly like your team. Zero missed revenue.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.38 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <a
                href="#how-it-works"
                className="group relative px-7 py-3.5 rounded-xl font-semibold text-white overflow-hidden
                           bg-gradient-to-r from-[#4f8ef7] to-[#1a56db]
                           shadow-[0_0_24px_rgba(79,142,247,0.4)]
                           hover:shadow-[0_0_36px_rgba(79,142,247,0.6)]
                           transition-all duration-300 hover:-translate-y-0.5"
              >
                <span className="relative z-10">Get Started Free →</span>
                <div
                  className="absolute inset-0 bg-gradient-to-r from-[#82b4ff] to-[#4f8ef7]
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </a>
              <a
                href="#how-it-works"
                className="px-7 py-3.5 rounded-xl font-semibold text-[#ddeeff]
                           border border-[rgba(79,142,247,0.3)]
                           bg-[rgba(79,142,247,0.06)]
                           hover:border-[rgba(79,142,247,0.6)]
                           hover:bg-[rgba(79,142,247,0.12)]
                           transition-all duration-300 hover:-translate-y-0.5"
              >
                See How It Works
              </a>
            </motion.div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-3">
              <StatPill value="< 2s" label="Answer time" delay={0.5} />
              <StatPill value="99.9%" label="Uptime SLA" delay={0.58} />
              <StatPill value="24 / 7" label="Always on" delay={0.66} />
              <StatPill value="$0" label="Setup cost" delay={0.74} />
            </div>

            {/* Trust micro-copy */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2"
            >
              {[
                'No credit card required',
                'Live in 24 hours',
                '30-day guarantee',
              ].map((text) => (
                <span key={text} className="flex items-center gap-1.5 text-xs text-[#4a6280]">
                  <Check size={12} strokeWidth={2.5} className="text-[#22d3a0] shrink-0" />
                  {text}
                </span>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: Spline 3D Card ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <Card
              className="relative w-full aspect-[4/3] overflow-hidden
                         border-[rgba(79,142,247,0.2)] bg-[#020b14]
                         shadow-[0_0_60px_rgba(79,142,247,0.15),inset_0_1px_0_rgba(79,142,247,0.1)]"
            >
              {/* Inner spotlight */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24
                           bg-gradient-to-b from-[rgba(79,142,247,0.12)] to-transparent
                           blur-2xl pointer-events-none z-10"
              />

              {/* Spline scene */}
              <SplineScene
                scene={sceneUrl}
                className="w-full h-full"
              />

              {/* Bottom label overlay */}
              <div
                className="absolute bottom-0 left-0 right-0 p-5
                           bg-gradient-to-t from-[rgba(2,11,20,0.95)] via-[rgba(2,11,20,0.6)] to-transparent
                           z-20"
              >
                <p className="text-xs font-semibold text-[#4f8ef7] uppercase tracking-widest mb-0.5">
                  AI Voice Agent
                </p>
                <p className="text-sm text-[#7a94b8]">
                  Hears, understands, and books — in real time
                </p>
              </div>

              {/* Corner badge */}
              <div
                className="absolute top-4 right-4 z-20 flex items-center gap-1.5
                           px-2.5 py-1 rounded-full
                           bg-[rgba(34,211,160,0.12)] border border-[rgba(34,211,160,0.25)]
                           text-[#22d3a0] text-xs font-medium"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22d3a0] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#22d3a0]" />
                </span>
                LIVE
              </div>
            </Card>

            {/* Glow halo behind card */}
            <div
              className="absolute inset-0 -z-10 rounded-xl blur-3xl opacity-30
                         bg-gradient-to-br from-[#4f8ef7] via-transparent to-[#a78bfa]"
            />
          </motion.div>

        </div>
      </div>
    </section>
  )
}
