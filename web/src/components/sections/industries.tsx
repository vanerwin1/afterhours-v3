'use client'

import { motion } from 'framer-motion'
import {
  HeartPulse,
  Scale,
  Home,
  Wrench,
  Sparkles,
  Building2,
  Car,
  GraduationCap,
} from 'lucide-react'

const INDUSTRIES = [
  { Icon: HeartPulse,    label: 'Dental & Medical',    color: '#4f8ef7' },
  { Icon: Scale,         label: 'Law Firms',            color: '#a78bfa' },
  { Icon: Home,          label: 'Real Estate',          color: '#22d3a0' },
  { Icon: Wrench,        label: 'Home Services',        color: '#fbbf24' },
  { Icon: Sparkles,      label: 'Med Spas & Wellness',  color: '#f472b6' },
  { Icon: Building2,     label: 'Insurance',            color: '#22d3ee' },
  { Icon: Car,           label: 'Auto Services',        color: '#f87171' },
  { Icon: GraduationCap, label: 'Tutoring & Coaching',  color: '#34d399' },
]

export function Industries() {
  return (
    <section id="industries" className="relative py-20 px-6 lg:px-12 bg-[#000507]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-semibold tracking-widest text-[#4f8ef7] uppercase mb-3">
            BUILT FOR YOUR INDUSTRY
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#ddeeff]">
            Any business where a missed call{' '}
            <span className="bg-gradient-to-r from-[#4f8ef7] to-[#a78bfa] bg-clip-text text-transparent">
              means lost revenue
            </span>
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {INDUSTRIES.map(({ Icon, label, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group flex flex-col items-center gap-3 p-5 rounded-xl
                         border border-[rgba(79,142,247,0.08)]
                         bg-[#060d1b]
                         hover:border-[rgba(79,142,247,0.22)]
                         hover:-translate-y-0.5
                         transition-all duration-300 cursor-default"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300"
                style={{
                  color,
                  background: `${color}10`,
                  borderColor: `${color}25`,
                }}
              >
                <Icon size={18} strokeWidth={1.75} />
              </div>
              <p className="text-xs font-medium text-[#7a94b8] text-center leading-snug group-hover:text-[#a8c0d8] transition-colors duration-200">
                {label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-8 text-xs text-[#4a6280]"
        >
          Don&apos;t see your industry?{' '}
          <a href="mailto:hello@afterhours.ai" className="text-[#4f8ef7] hover:underline">
            We likely support it →
          </a>
        </motion.p>
      </div>
    </section>
  )
}
