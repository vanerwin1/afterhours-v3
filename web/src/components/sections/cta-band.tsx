'use client'

import { motion } from 'framer-motion'

export function CTABand() {
  return (
    <section className="relative py-24 px-6 lg:px-12 overflow-hidden bg-[#000507]">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(79,142,247,0.3) 0%, transparent 70%)',
          }}
        />
        {/* Animated border ring */}
        <div
          className="absolute inset-8 rounded-3xl opacity-30"
          style={{
            background:
              'linear-gradient(135deg, rgba(79,142,247,0.1), transparent, rgba(167,139,250,0.1))',
            border: '1px solid rgba(79,142,247,0.2)',
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-xs font-bold tracking-[0.3em] text-[#4f8ef7] uppercase mb-6"
        >
          STOP LEAVING MONEY AT THE TONE
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl lg:text-6xl font-bold text-[#ddeeff] leading-tight mb-6"
        >
          Your competitors are{' '}
          <span className="bg-gradient-to-r from-[#4f8ef7] via-[#82b4ff] to-[#a78bfa] bg-clip-text text-transparent">
            answering right now.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-[#7a94b8] mb-10 max-w-2xl mx-auto"
        >
          Every unanswered call is revenue walking out the door. Set up AfterHours.AI
          in 24 hours and start capturing every lead, every night.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <a
            href="#pricing"
            className="group relative px-10 py-4 rounded-xl font-bold text-white text-lg overflow-hidden
                       bg-gradient-to-r from-[#4f8ef7] to-[#1a56db]
                       shadow-[0_0_40px_rgba(79,142,247,0.5)]
                       hover:shadow-[0_0_60px_rgba(79,142,247,0.7)]
                       transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto"
          >
            Start Free Trial →
          </a>
          <a
            href="#how-it-works"
            className="px-10 py-4 rounded-xl font-semibold text-[#ddeeff] text-lg
                       border border-[rgba(79,142,247,0.3)]
                       bg-[rgba(79,142,247,0.06)]
                       hover:border-[rgba(79,142,247,0.5)]
                       transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto text-center"
          >
            See How It Works
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex flex-wrap justify-center gap-6 text-sm text-[#4a6280]"
        >
          {[
            '✓ No credit card required',
            '✓ Live in 24 hours',
            '✓ 30-day money-back guarantee',
            '✓ Cancel anytime',
          ].map((b) => (
            <span key={b} className="flex items-center gap-1.5">
              {b}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
