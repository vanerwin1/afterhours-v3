'use client'

import { motion } from 'framer-motion'
import { Check, X, Minus } from 'lucide-react'

type CheckState = 'yes' | 'no' | 'partial'

type Row = {
  feature: string
  afterhours: CheckState
  voicemail: CheckState
  receptionist: CheckState
  detail?: string
}

const ROWS: Row[] = [
  {
    feature: 'Answers every call 24/7',
    afterhours: 'yes',
    voicemail: 'yes',
    receptionist: 'no',
    detail: 'Human receptionists only cover business hours',
  },
  {
    feature: 'Books appointments automatically',
    afterhours: 'yes',
    voicemail: 'no',
    receptionist: 'yes',
    detail: 'Voicemail requires manual callback to book',
  },
  {
    feature: 'Captures caller info & intent',
    afterhours: 'yes',
    voicemail: 'partial',
    receptionist: 'yes',
    detail: 'Voicemail only captures what callers choose to say',
  },
  {
    feature: 'Sounds like a real person',
    afterhours: 'yes',
    voicemail: 'no',
    receptionist: 'yes',
  },
  {
    feature: 'Sends SMS / email summaries',
    afterhours: 'yes',
    voicemail: 'no',
    receptionist: 'partial',
    detail: 'Receptionists may send notes but not automatically',
  },
  {
    feature: 'Answers in < 2 seconds',
    afterhours: 'yes',
    voicemail: 'yes',
    receptionist: 'no',
    detail: 'Humans need time to pick up, often callers hear several rings',
  },
  {
    feature: 'Handles simultaneous calls',
    afterhours: 'yes',
    voicemail: 'yes',
    receptionist: 'no',
    detail: 'One receptionist = one call at a time',
  },
  {
    feature: 'Zero per-hire cost',
    afterhours: 'yes',
    voicemail: 'yes',
    receptionist: 'no',
    detail: 'Receptionists cost $35K–$55K/year + benefits',
  },
  {
    feature: 'Custom scripts & personality',
    afterhours: 'yes',
    voicemail: 'no',
    receptionist: 'partial',
    detail: 'Hard to train consistently across staff',
  },
  {
    feature: 'Escalation & emergency routing',
    afterhours: 'yes',
    voicemail: 'no',
    receptionist: 'yes',
  },
]

const ICON_MAP: Record<CheckState, { icon: typeof Check; color: string; bg: string; label: string }> = {
  yes: {
    icon: Check,
    color: '#22d3a0',
    bg: 'rgba(34,211,160,0.12)',
    label: 'Yes',
  },
  no: {
    icon: X,
    color: '#f87171',
    bg: 'rgba(248,113,113,0.1)',
    label: 'No',
  },
  partial: {
    icon: Minus,
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.12)',
    label: 'Partial',
  },
}

function StatusCell({ state }: { state: CheckState }) {
  const { icon: Icon, color, bg, label } = ICON_MAP[state]
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto"
      style={{ background: bg }}
      aria-label={label}
    >
      <Icon size={16} strokeWidth={2.5} style={{ color }} />
    </div>
  )
}

export function Comparison() {
  return (
    <section
      id="comparison"
      className="relative py-28 px-6 lg:px-12 overflow-hidden bg-[#020b14]"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px]
                     bg-[radial-gradient(ellipse,rgba(79,142,247,0.07)_0%,transparent_70%)]"
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-semibold tracking-widest text-[#4f8ef7] uppercase mb-4">
            COMPARISON
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#ddeeff] mb-5">
            Why not just use{' '}
            <span className="bg-gradient-to-r from-[#f87171] to-[#fbbf24] bg-clip-text text-transparent">
              voicemail?
            </span>
          </h2>
          <p className="text-lg text-[#7a94b8] max-w-xl mx-auto">
            Voicemail loses leads. Receptionists cost a fortune and only work 9-to-5.
            AfterHours.AI gives you the best of both, 24/7.
          </p>
        </motion.div>

        {/* Table — overflow-x-auto for mobile */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="rounded-2xl overflow-x-auto border border-[rgba(79,142,247,0.15)]"
        >
        <div className="min-w-[640px]">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-px bg-[rgba(79,142,247,0.08)]">
            <div className="bg-[#060d1b] px-6 py-4" />

            {/* AfterHours.AI column header — highlighted */}
            <div
              className="bg-[#0a1628] px-4 py-4 text-center border-x border-[rgba(79,142,247,0.25)]
                         relative overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background:
                    'radial-gradient(ellipse at top, rgba(79,142,247,0.15), transparent 70%)',
                }}
              />
              <p className="relative text-xs font-bold tracking-widest text-[#4f8ef7] uppercase mb-1">
                AfterHours.AI
              </p>
              <p className="relative text-[10px] text-[#22d3a0] font-medium">from $297/mo</p>
            </div>

            <div className="bg-[#060d1b] px-4 py-4 text-center">
              <p className="text-xs font-semibold text-[#7a94b8] uppercase tracking-wider">
                Voicemail
              </p>
              <p className="text-[10px] text-[#4a6280] mt-1">free / built-in</p>
            </div>

            <div className="bg-[#060d1b] px-4 py-4 text-center">
              <p className="text-xs font-semibold text-[#7a94b8] uppercase tracking-wider whitespace-nowrap">
                Human Receptionist
              </p>
              <p className="text-[10px] text-[#4a6280] mt-1">$35–55K/yr</p>
            </div>
          </div>

          {/* Data rows */}
          {ROWS.map((row, i) => (
            <div
              key={row.feature}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-px bg-[rgba(79,142,247,0.06)]"
            >
              {/* Feature label */}
              <div
                className={`bg-[#060d1b] px-6 py-4 flex flex-col justify-center ${
                  i === ROWS.length - 1 ? '' : 'border-b border-[rgba(79,142,247,0.06)]'
                }`}
              >
                <span className="text-sm text-[#a8c0d8] font-medium">{row.feature}</span>
                {row.detail && (
                  <span className="text-xs text-[#4a6280] mt-0.5">{row.detail}</span>
                )}
              </div>

              {/* AfterHours.AI cell — highlighted column */}
              <div
                className={`bg-[#0a1628] px-4 py-4 flex items-center justify-center
                            border-x border-[rgba(79,142,247,0.2)] min-w-[100px]
                            ${i === ROWS.length - 1 ? '' : 'border-b border-b-[rgba(79,142,247,0.08)]'}`}
              >
                <StatusCell state={row.afterhours} />
              </div>

              {/* Voicemail cell */}
              <div
                className={`bg-[#060d1b] px-4 py-4 flex items-center justify-center min-w-[100px]
                            ${i === ROWS.length - 1 ? '' : 'border-b border-[rgba(79,142,247,0.06)]'}`}
              >
                <StatusCell state={row.voicemail} />
              </div>

              {/* Receptionist cell */}
              <div
                className={`bg-[#060d1b] px-4 py-4 flex items-center justify-center min-w-[120px]
                            ${i === ROWS.length - 1 ? '' : 'border-b border-[rgba(79,142,247,0.06)]'}`}
              >
                <StatusCell state={row.receptionist} />
              </div>
            </div>
          ))}
        </div>{/* end min-w-[640px] */}
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-center gap-6 mt-6 text-xs text-[#4a6280]"
        >
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded flex items-center justify-center bg-[rgba(34,211,160,0.12)]">
              <Check size={10} strokeWidth={2.5} className="text-[#22d3a0]" />
            </div>
            Yes
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded flex items-center justify-center bg-[rgba(251,191,36,0.12)]">
              <Minus size={10} strokeWidth={2.5} className="text-[#fbbf24]" />
            </div>
            Partial
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded flex items-center justify-center bg-[rgba(248,113,113,0.1)]">
              <X size={10} strokeWidth={2.5} className="text-[#f87171]" />
            </div>
            No
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-10"
        >
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white
                       bg-gradient-to-r from-[#4f8ef7] to-[#1a56db]
                       shadow-[0_0_24px_rgba(79,142,247,0.4)]
                       hover:shadow-[0_0_36px_rgba(79,142,247,0.6)]
                       transition-all duration-300 hover:-translate-y-0.5"
          >
            Start for Free — No Card Required
          </a>
        </motion.div>
      </div>
    </section>
  )
}
