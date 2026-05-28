'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calculator, TrendingUp } from 'lucide-react'

export function ROICalculator() {
  const [callsPerWeek, setCallsPerWeek] = useState(15)
  const [clientValue, setClientValue]   = useState(1500)
  const [closeRate, setCloseRate]       = useState(30)

  const stats = useMemo(() => {
    const missedCallsPerWeek   = Math.round(callsPerWeek * 0.22)        // ~22% missed
    const missedCallsPerYear   = missedCallsPerWeek * 52
    const convertedLeads       = Math.round(missedCallsPerYear * (closeRate / 100))
    const annualRevenueLost    = convertedLeads * clientValue
    const monthlyRevenueLost   = Math.round(annualRevenueLost / 12)
    const roiMultiplier        = Math.round(annualRevenueLost / 297 / 12)  // vs Starter plan monthly
    return { missedCallsPerWeek, missedCallsPerYear, convertedLeads, annualRevenueLost, monthlyRevenueLost, roiMultiplier }
  }, [callsPerWeek, clientValue, closeRate])

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `$${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
      : `$${n}`

  return (
    <section id="roi" className="relative py-24 px-6 lg:px-12 bg-[#020b14]">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(79,142,247,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                          border border-[rgba(79,142,247,0.2)] bg-[rgba(79,142,247,0.07)]
                          text-[#4f8ef7] text-xs font-semibold mb-5">
            <Calculator size={13} />
            ROI CALCULATOR
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#ddeeff] mb-4">
            How much are you{' '}
            <span className="bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#fbbf24] bg-clip-text text-transparent">
              losing right now?
            </span>
          </h2>
          <p className="text-[#7a94b8] text-lg">
            Adjust the sliders to see your actual missed revenue.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="rounded-2xl border border-[rgba(79,142,247,0.15)] bg-[#060d1b]
                     shadow-[0_0_60px_rgba(79,142,247,0.08)] overflow-hidden"
        >
          {/* Inputs */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-[rgba(79,142,247,0.08)]">
            <SliderInput
              label="Calls per week"
              value={callsPerWeek}
              min={2}
              max={100}
              step={1}
              onChange={setCallsPerWeek}
              display={`${callsPerWeek} calls`}
            />
            <SliderInput
              label="Avg. new client value"
              value={clientValue}
              min={200}
              max={20000}
              step={100}
              onChange={setClientValue}
              display={fmt(clientValue)}
            />
            <SliderInput
              label="Your close rate"
              value={closeRate}
              min={5}
              max={80}
              step={5}
              onChange={setCloseRate}
              display={`${closeRate}%`}
            />
          </div>

          {/* Results */}
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <ResultStat
                label="Missed calls / week"
                value={`~${stats.missedCallsPerWeek}`}
                color="#f87171"
                sub="(22% go unanswered)"
              />
              <ResultStat
                label="Lost leads / year"
                value={`${stats.convertedLeads}`}
                color="#fbbf24"
                sub="that never booked"
              />
              <ResultStat
                label="Lost revenue / mo"
                value={fmt(stats.monthlyRevenueLost)}
                color="#f87171"
                sub="walking out the door"
              />
              <ResultStat
                label="Lost revenue / yr"
                value={fmt(stats.annualRevenueLost)}
                color="#f87171"
                sub="total opportunity cost"
                large
              />
            </div>

            {/* ROI callout */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5
                            rounded-xl border border-[rgba(34,211,160,0.2)]
                            bg-[rgba(34,211,160,0.04)] p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(34,211,160,0.12)] border border-[rgba(34,211,160,0.25)]
                                flex items-center justify-center text-[#22d3a0]">
                  <TrendingUp size={18} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm text-[#7a94b8]">
                    AfterHours.AI Starter is{' '}
                    <span className="text-[#22d3a0] font-semibold">$297/mo</span>
                  </p>
                  <p className="text-xs text-[#4a6280] mt-0.5">
                    That&apos;s a{' '}
                    <span className="text-[#22d3a0] font-bold">{stats.roiMultiplier}× ROI</span>
                    {' '}based on your numbers
                  </p>
                </div>
              </div>
              <a
                href="#pricing"
                className="shrink-0 px-6 py-2.5 rounded-xl font-semibold text-sm text-white
                           bg-gradient-to-r from-[#4f8ef7] to-[#1a56db]
                           shadow-[0_0_20px_rgba(79,142,247,0.35)]
                           hover:shadow-[0_0_32px_rgba(79,142,247,0.55)]
                           transition-all duration-300 hover:-translate-y-0.5"
              >
                Start Free →
              </a>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-6 text-xs text-[#4a6280]"
        >
          Based on industry research: ~22% of small business calls go unanswered (Invoca, 2024).
        </motion.p>
      </div>
    </section>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (n: number) => void
  display: string
}) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-[#7a94b8]">{label}</label>
        <span className="text-sm font-bold text-[#4f8ef7]">{display}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                     bg-[rgba(79,142,247,0.15)]
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-[#4f8ef7]
                     [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(79,142,247,0.6)]
                     [&::-webkit-slider-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, rgba(79,142,247,0.6) 0%, rgba(79,142,247,0.6) ${pct}%, rgba(79,142,247,0.12) ${pct}%, rgba(79,142,247,0.12) 100%)`,
          }}
        />
      </div>
    </div>
  )
}

function ResultStat({
  label,
  value,
  color,
  sub,
  large = false,
}: {
  label: string
  value: string
  color: string
  sub: string
  large?: boolean
}) {
  return (
    <div className={`flex flex-col ${large ? 'col-span-2 md:col-span-1' : ''}`}>
      <p className="text-xs text-[#4a6280] mb-1">{label}</p>
      <p
        className={`font-bold leading-none ${large ? 'text-4xl' : 'text-2xl'}`}
        style={{ color }}
      >
        {value}
      </p>
      <p className="text-xs text-[#4a6280] mt-1">{sub}</p>
    </div>
  )
}
