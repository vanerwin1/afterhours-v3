'use client'

import { motion } from 'framer-motion'

// Integration logos rendered as SVG text/shapes to avoid external dependencies
const INTEGRATIONS = [
  { name: 'Calendly', icon: '📅', color: '#006BFF' },
  { name: 'Google Calendar', icon: '🗓', color: '#4285F4' },
  { name: 'Acuity', icon: '⚡', color: '#52c041' },
  { name: 'Salesforce', icon: '☁️', color: '#00A1E0' },
  { name: 'HubSpot', icon: '🔶', color: '#FF7A59' },
  { name: 'Stripe', icon: '💳', color: '#6772E5' },
  { name: 'Twilio', icon: '📞', color: '#F22F46' },
  { name: 'Zapier', icon: '⚡', color: '#FF4A00' },
]

const STATS = [
  { value: '4,200+', label: 'businesses served' },
  { value: '2.1M', label: 'calls handled' },
  { value: '99.9%', label: 'uptime last 12 months' },
  { value: '4.9 / 5', label: 'average rating' },
]

export function LogoStrip() {
  return (
    <section className="relative py-16 px-6 lg:px-12 bg-[#020b14] border-y border-[rgba(79,142,247,0.08)]">
      <div className="max-w-7xl mx-auto">

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-14"
        >
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-center"
            >
              <p className="text-3xl lg:text-4xl font-bold text-[#ddeeff] tracking-tight">
                {value}
              </p>
              <p className="text-sm text-[#7a94b8] mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="border-t border-[rgba(79,142,247,0.08)] mb-10" />

        {/* Integrations */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-widest text-[#4a6280] uppercase">
            Integrates with your existing tools
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4"
        >
          {INTEGRATIONS.map(({ name }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="px-5 py-2 rounded-lg border border-[rgba(79,142,247,0.1)]
                         bg-[rgba(79,142,247,0.04)] hover:border-[rgba(79,142,247,0.2)]
                         hover:bg-[rgba(79,142,247,0.08)] transition-all duration-200
                         text-sm font-medium text-[#7a94b8] hover:text-[#a8c0d8]"
            >
              {name}
            </motion.div>
          ))}
          <span className="text-sm text-[#4a6280]">+ more via Zapier</span>
        </motion.div>
      </div>
    </section>
  )
}
