'use client'

import { motion } from 'framer-motion'
import { Mic2, PhoneCall, BotMessageSquare, LayoutDashboard } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    title: 'We Clone Your Voice',
    body: "We capture your team's tone, scripts, and FAQs. Your AI agent sounds like your best receptionist — not a robot.",
    Icon: Mic2,
    color: '#4f8ef7',
    glow: 'rgba(79,142,247,0.25)',
  },
  {
    num: '02',
    title: 'Calls Route to AI',
    body: 'Forward your after-hours line (or all calls) to AfterHours.AI. Callers hear a familiar, professional voice immediately.',
    Icon: PhoneCall,
    color: '#22d3a0',
    glow: 'rgba(34,211,160,0.25)',
  },
  {
    num: '03',
    title: 'AI Handles Everything',
    body: 'Books appointments, answers FAQs, captures lead details, and handles urgencies — all in real time, no hold music.',
    Icon: BotMessageSquare,
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.25)',
  },
  {
    num: '04',
    title: 'You Get the Summary',
    body: 'Every call lands in your dashboard with a transcript, action items, and booking confirmations. Wake up to new revenue.',
    Icon: LayoutDashboard,
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.25)',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-28 px-6 lg:px-12 overflow-hidden bg-[#000507]"
    >
      {/* Background line */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-0 right-0 h-px opacity-10"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(79,142,247,0.8), rgba(167,139,250,0.8), transparent)',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-xs font-semibold tracking-widest text-[#4f8ef7] uppercase mb-4">
            HOW IT WORKS
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#ddeeff] mb-5">
            Up and running in{' '}
            <span className="bg-gradient-to-r from-[#4f8ef7] to-[#a78bfa] bg-clip-text text-transparent">
              24 hours
            </span>
          </h2>
          <p className="text-lg text-[#7a94b8] max-w-2xl mx-auto">
            No complex integrations. No training your staff. Just set it up once and
            let your AI receptionist handle the rest.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="relative grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-4">
          {/* Connecting line behind cards */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-[rgba(79,142,247,0.2)] to-transparent z-0" />

          {STEPS.map((step, i) => {
            const { Icon } = step
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative group z-10"
              >
                <div
                  className="relative p-7 rounded-2xl border border-[rgba(79,142,247,0.12)]
                              bg-[#060d1b] hover:border-[rgba(79,142,247,0.3)]
                              transition-all duration-300 hover:-translate-y-1
                              hover:shadow-[0_8px_40px_rgba(79,142,247,0.12)]"
                >
                  {/* Step number */}
                  <div className="flex items-center gap-3 mb-5">
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center border"
                      style={{
                        color: step.color,
                        borderColor: `${step.color}40`,
                        background: `${step.color}12`,
                        boxShadow: `0 0 16px ${step.glow}`,
                      }}
                    >
                      <Icon size={18} strokeWidth={1.75} />
                    </span>
                    <span className="text-xs font-bold tracking-widest text-[#4a6280] uppercase">
                      Step {step.num}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-[#ddeeff] mb-3">{step.title}</h3>
                  <p className="text-sm text-[#7a94b8] leading-relaxed">{step.body}</p>

                  {/* Arrow connector (all but last) */}
                  {i < STEPS.length - 1 && (
                    <div
                      className="hidden lg:flex absolute -right-5 top-9 z-20 w-10 h-10
                                 items-center justify-center rounded-full
                                 bg-[#000507] border border-[rgba(79,142,247,0.15)]
                                 text-[#4f8ef7] text-xs"
                    >
                      →
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-14"
        >
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white
                       bg-gradient-to-r from-[#4f8ef7] to-[#1a56db]
                       shadow-[0_0_24px_rgba(79,142,247,0.4)]
                       hover:shadow-[0_0_40px_rgba(79,142,247,0.6)]
                       transition-all duration-300 hover:-translate-y-0.5"
          >
            Get Started Free
            <span className="text-lg">→</span>
          </a>
          <p className="mt-3 text-xs text-[#4a6280]">No credit card required · Live in 24 hours</p>
        </motion.div>
      </div>
    </section>
  )
}
