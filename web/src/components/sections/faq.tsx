'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQS = [
  {
    q: 'Does it actually sound like a real person?',
    a: "Yes. We use the latest AI voice models — callers consistently can't tell the difference. You can also opt for voice cloning on the Professional plan, which captures your team's specific tone, pace, and personality.",
  },
  {
    q: 'How long does setup take?',
    a: "Most businesses are live in 24 hours. You fill out a short onboarding form (FAQs, booking rules, your calendar link), we configure the agent, and you forward your after-hours number. That's it.",
  },
  {
    q: 'What happens if a caller has a real emergency?',
    a: "You define escalation rules. AfterHours.AI can detect urgency keywords, immediately offer a callback, send you an SMS alert, or connect to an emergency contact line — whatever protocol makes sense for your business.",
  },
  {
    q: 'Does it work with my scheduling software?',
    a: "We integrate with Calendly, Acuity, Google Calendar, Jane App, Mindbody, Salesforce, and most major CRMs. Custom integrations are available on the Enterprise plan.",
  },
  {
    q: 'Can I cancel anytime?',
    a: "Absolutely. No long-term contracts. You can cancel before your next billing date with no fees. We also offer a 30-day money-back guarantee on all plans — try it risk-free.",
  },
  {
    q: 'What industries is AfterHours.AI best for?',
    a: "Dental and medical practices, law firms, real estate agencies, home service businesses (roofing, HVAC, plumbing), and any service business where a missed after-hours call means lost revenue.",
  },
]

function FAQItem({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: i * 0.06 }}
      className="border-b border-[rgba(79,142,247,0.1)] last:border-0"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left
                   text-[#ddeeff] hover:text-[#4f8ef7] transition-colors duration-200
                   focus-visible:outline-none focus-visible:text-[#4f8ef7]"
        aria-expanded={open}
      >
        <span className="font-medium text-base">{q}</span>
        <span
          className="shrink-0 w-6 h-6 rounded-full border border-[rgba(79,142,247,0.25)]
                     flex items-center justify-center text-[#4f8ef7] text-sm
                     transition-transform duration-300"
          style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
        >
          +
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[#7a94b8] text-sm leading-relaxed pr-10">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FAQ() {
  return (
    <section
      id="faq"
      className="relative py-28 px-6 lg:px-12 overflow-hidden bg-[#020b14]"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold tracking-widest text-[#4f8ef7] uppercase mb-4">
            FAQ
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#ddeeff] mb-5">
            Questions, answered
          </h2>
          <p className="text-lg text-[#7a94b8]">
            Still not sure? These are the questions we hear most often.
          </p>
        </motion.div>

        {/* FAQ list */}
        <div className="rounded-2xl border border-[rgba(79,142,247,0.1)] bg-[#060d1b] px-8">
          {FAQS.map((item, i) => (
            <FAQItem key={item.q} q={item.q} a={item.a} i={i} />
          ))}
        </div>

        {/* Bottom nudge */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-10 text-sm text-[#7a94b8]"
        >
          Have a question not listed here?{' '}
          <a
            href="mailto:hello@afterhours.ai"
            className="text-[#4f8ef7] hover:underline"
          >
            Email us anytime →
          </a>
        </motion.p>
      </div>
    </section>
  )
}
