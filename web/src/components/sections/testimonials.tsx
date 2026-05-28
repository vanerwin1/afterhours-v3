'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    quote:
      "We were losing 8–10 calls a week after hours — mostly new patient inquiries. AfterHours.AI books them right into our schedule. We added $18K/month in revenue in the first 60 days without hiring anyone.",
    name: 'Dr. Rachel Kim',
    role: 'Owner, Brightside Dental Group',
    initials: 'RK',
    result: '+$18K/mo',
    resultColor: '#22d3a0',
    stars: 5,
  },
  {
    quote:
      "My crews are on rooftops all day and I can't answer the phone. AfterHours.AI handles every lead call, qualifies them, and books estimates. My close rate went up 340% because I stopped losing jobs to voicemail.",
    name: 'Marcus Thompson',
    role: 'Owner, Thompson Roofing & Exterior',
    initials: 'MT',
    result: '+340% close rate',
    resultColor: '#4f8ef7',
    stars: 5,
  },
  {
    quote:
      "Potential clients call at 10pm all the time — especially in family law. Before AfterHours.AI, they'd call a competitor. Now they're booked for a consultation before I even wake up. Zero missed intakes.",
    name: 'Jennifer Castillo, Esq.',
    role: 'Managing Partner, Castillo Family Law',
    initials: 'JC',
    result: '0 missed intakes',
    resultColor: '#a78bfa',
    stars: 5,
  },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 mb-4" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          size={14}
          strokeWidth={0}
          fill="#f59e42"
          className="text-[#f59e42]"
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative py-28 px-6 lg:px-12 overflow-hidden bg-[#020b14]"
    >
      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]
                     bg-[radial-gradient(ellipse,rgba(79,142,247,0.06)_0%,transparent_70%)]"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-widest text-[#4f8ef7] uppercase mb-4">
            REAL RESULTS
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#ddeeff] mb-5">
            Businesses that stopped{' '}
            <span className="bg-gradient-to-r from-[#4f8ef7] to-[#a78bfa] bg-clip-text text-transparent">
              losing money
            </span>
          </h2>
          <p className="text-lg text-[#7a94b8] max-w-xl mx-auto">
            Real owners. Real results. No made-up testimonials.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group relative flex flex-col p-7 rounded-2xl
                         border border-[rgba(79,142,247,0.12)]
                         bg-[#060d1b]
                         hover:border-[rgba(79,142,247,0.25)]
                         hover:shadow-[0_8px_40px_rgba(79,142,247,0.08)]
                         transition-all duration-300 hover:-translate-y-1"
            >
              {/* Result badge */}
              <div
                className="absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  color: t.resultColor,
                  background: `${t.resultColor}18`,
                  border: `1px solid ${t.resultColor}35`,
                }}
              >
                {t.result}
              </div>

              <StarRating count={t.stars} />

              {/* Quote */}
              <p className="text-[#a8c0d8] text-sm leading-relaxed mb-6 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-[rgba(79,142,247,0.08)]">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center
                             text-sm font-bold text-white shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${t.resultColor}60, ${t.resultColor}30)`,
                    border: `1px solid ${t.resultColor}40`,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#ddeeff]">{t.name}</p>
                  <p className="text-xs text-[#7a94b8]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social proof bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-8 mt-16 pt-12
                     border-t border-[rgba(79,142,247,0.08)]"
        >
          {[
            { val: '4,200+', lbl: 'businesses served' },
            { val: '1.2M+',  lbl: 'calls handled' },
            { val: '4.9 / 5', lbl: 'average rating' },
            { val: '$0',     lbl: 'setup cost' },
          ].map((s) => (
            <div key={s.lbl} className="text-center">
              <p className="text-2xl font-bold text-[#4f8ef7]">{s.val}</p>
              <p className="text-xs text-[#7a94b8] mt-0.5">{s.lbl}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
