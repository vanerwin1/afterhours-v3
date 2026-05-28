'use client'

import { motion } from 'framer-motion'
import { PhoneMissed, TrendingDown, Clock, DollarSign } from 'lucide-react'

const STATS = [
  {
    Icon: PhoneMissed,
    value: '85%',
    label: 'of callers who can\'t reach you call a competitor instead',
    color: '#f87171',
    glow: 'rgba(248,113,113,0.2)',
  },
  {
    Icon: TrendingDown,
    value: '1 in 5',
    label: 'small business calls goes completely unanswered',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.2)',
  },
  {
    Icon: Clock,
    value: '3 sec',
    label: 'is all it takes — callers hang up if no one picks up quickly',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.2)',
  },
  {
    Icon: DollarSign,
    value: '$2–5K',
    label: 'average lifetime value of one new dental or legal client',
    color: '#22d3a0',
    glow: 'rgba(34,211,160,0.2)',
  },
]

export function PainStrip() {
  return (
    <section className="relative py-16 px-6 lg:px-12 bg-[#020b14] border-y border-[rgba(79,142,247,0.06)]">
      {/* Subtle background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(79,142,247,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-xs font-bold tracking-[0.25em] text-[#f87171] uppercase mb-10"
        >
          THE COST OF MISSED CALLS
        </motion.p>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(({ Icon, value, label, color, glow }, i) => (
            <motion.div
              key={value + label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex items-start gap-4 p-5 rounded-xl
                         bg-[#060d1b] border border-[rgba(79,142,247,0.08)]
                         hover:border-[rgba(79,142,247,0.18)] transition-colors duration-300"
            >
              {/* Icon */}
              <div
                className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border"
                style={{
                  color,
                  background: `${color}10`,
                  borderColor: `${color}30`,
                  boxShadow: `0 0 12px ${glow}`,
                }}
              >
                <Icon size={18} strokeWidth={1.75} />
              </div>

              {/* Text */}
              <div>
                <p
                  className="text-2xl font-bold leading-none mb-1"
                  style={{ color }}
                >
                  {value}
                </p>
                <p className="text-xs text-[#7a94b8] leading-snug">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bridge line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-center mt-10 text-sm text-[#4a6280]"
        >
          AfterHours.AI answers every call in{' '}
          <span className="text-[#4f8ef7] font-medium">under 2 seconds</span>
          {' '}— day, night, weekends, holidays.
        </motion.p>
      </div>
    </section>
  )
}
