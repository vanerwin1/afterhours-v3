'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Phone, Calendar, CheckCircle2, MessageSquare } from 'lucide-react'

type Message = {
  role: 'ai' | 'caller'
  text: string
  delay: number
}

const TRANSCRIPT: Message[] = [
  { role: 'ai',     delay: 0,    text: "Thank you for calling Bright Smile Dental, your call is answered by our AI assistant. I'm here to help 24/7. Are you an existing patient or a new patient today?" },
  { role: 'caller', delay: 2200, text: "Hi, I'm a new patient — I have really bad tooth pain and need to be seen ASAP." },
  { role: 'ai',     delay: 4200, text: "I'm sorry to hear that — tooth pain is no fun. I can get you booked with Dr. Nguyen, who has emergency availability. I'll need to grab a few quick details. What's your full name?" },
  { role: 'caller', delay: 6500, text: "It's Sarah Mitchell." },
  { role: 'ai',     delay: 7800, text: "Great, Sarah. What's your best callback number in case we need to reach you?" },
  { role: 'caller', delay: 9500, text: "555-401-2983." },
  { role: 'ai',     delay: 11000, text: "Got it. Dr. Nguyen has a slot tomorrow at 9:00 AM. Would that work for you?" },
  { role: 'caller', delay: 13000, text: "Yes, that's perfect, thank you!" },
  { role: 'ai',     delay: 14500, text: "You're all set, Sarah. I'm sending a confirmation to the number you gave me. Is there anything else I can help you with tonight?" },
  { role: 'caller', delay: 16500, text: "No, that's everything. You're amazing!" },
  { role: 'ai',     delay: 17800, text: "Happy to help. See you tomorrow at 9:00 AM. Have a good night!" },
]

const OUTCOME_ITEMS = [
  { Icon: Calendar,      color: '#4f8ef7', text: 'Appointment booked for 9:00 AM' },
  { Icon: MessageSquare, color: '#a78bfa', text: 'SMS confirmation sent to Sarah' },
  { Icon: CheckCircle2,  color: '#22d3a0', text: 'Call summary emailed to Dr. Nguyen' },
]

function Bubble({ msg, visible }: { msg: Message; visible: boolean }) {
  const isAI = msg.role === 'ai'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex gap-3 ${isAI ? 'items-start' : 'items-start flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
          isAI
            ? 'bg-gradient-to-br from-[#4f8ef7] to-[#1a56db] text-white'
            : 'bg-[rgba(167,139,250,0.2)] border border-[rgba(167,139,250,0.3)] text-[#a78bfa]'
        }`}
      >
        {isAI ? 'AI' : 'C'}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isAI
            ? 'bg-[rgba(79,142,247,0.1)] border border-[rgba(79,142,247,0.15)] text-[#c0d4e8] rounded-tl-sm'
            : 'bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.2)] text-[#c0b4f8] rounded-tr-sm'
        }`}
      >
        {msg.text}
      </div>
    </motion.div>
  )
}

function TypingIndicator({ visible }: { visible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={visible ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3"
    >
      <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#4f8ef7] to-[#1a56db] flex items-center justify-center text-xs font-bold text-white">
        AI
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[rgba(79,142,247,0.1)] border border-[rgba(79,142,247,0.15)]">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#4f8ef7]"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export function DemoTranscript() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [showTyping, setShowTyping] = useState(false)
  const [started, setStarted] = useState(false)
  const [showOutcome, setShowOutcome] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom as messages appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [visibleCount, showTyping])

  // Replay animation when section is in view
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          runTranscript()
        }
      },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [started])

  function runTranscript() {
    TRANSCRIPT.forEach((msg, i) => {
      // Show typing before each AI message
      if (msg.role === 'ai' && i > 0) {
        setTimeout(() => setShowTyping(true), msg.delay - 600)
        setTimeout(() => setShowTyping(false), msg.delay - 100)
      }
      setTimeout(() => setVisibleCount(i + 1), msg.delay)
    })
    // Show outcome after last message
    setTimeout(() => setShowOutcome(true), TRANSCRIPT[TRANSCRIPT.length - 1].delay + 1000)
  }

  return (
    <section
      id="demo"
      className="relative py-28 px-6 lg:px-12 overflow-hidden bg-[#000507]"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px]
                     bg-[radial-gradient(ellipse,rgba(79,142,247,0.05)_0%,transparent_70%)]"
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10" ref={containerRef}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-semibold tracking-widest text-[#4f8ef7] uppercase mb-4">
            LIVE DEMO
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#ddeeff] mb-5">
            Hear it for yourself —{' '}
            <span className="bg-gradient-to-r from-[#4f8ef7] to-[#a78bfa] bg-clip-text text-transparent">
              this just happened.
            </span>
          </h2>
          <p className="text-lg text-[#7a94b8] max-w-xl mx-auto">
            An after-hours call at 11:43 PM. Patient in pain. No staff awake.
            AfterHours.AI handled it in under 60 seconds.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Call transcript window */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-2xl border border-[rgba(79,142,247,0.15)] bg-[#060d1b] overflow-hidden"
          >
            {/* Window chrome */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[rgba(79,142,247,0.1)] bg-[rgba(6,13,27,0.8)]">
              <Phone size={14} className="text-[#22d3a0]" />
              <span className="text-xs font-medium text-[#7a94b8]">
                Incoming call — 11:43 PM · Bright Smile Dental
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22d3a0] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22d3a0]" />
                </div>
                <span className="text-[10px] text-[#22d3a0] font-medium">LIVE</span>
              </div>
            </div>

            {/* Messages area */}
            <div
              ref={scrollRef}
              className="p-5 space-y-4 h-[480px] overflow-y-auto scrollbar-thin"
              style={{ scrollbarColor: 'rgba(79,142,247,0.2) transparent' }}
            >
              {TRANSCRIPT.map((msg, i) => (
                <Bubble key={i} msg={msg} visible={i < visibleCount} />
              ))}
              <TypingIndicator visible={showTyping} />
              {/* Outcome summary */}
              {showOutcome && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-6 p-4 rounded-xl bg-[rgba(34,211,160,0.06)] border border-[rgba(34,211,160,0.15)]"
                >
                  <p className="text-xs font-bold text-[#22d3a0] uppercase tracking-wider mb-3">
                    Call completed — automated follow-up sent
                  </p>
                  <div className="space-y-2">
                    {OUTCOME_ITEMS.map(({ Icon, color, text }) => (
                      <div key={text} className="flex items-center gap-2.5">
                        <Icon size={14} style={{ color }} />
                        <span className="text-xs text-[#a8c0d8]">{text}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Stats sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Call stats */}
            <div className="rounded-2xl border border-[rgba(79,142,247,0.15)] bg-[#060d1b] p-5">
              <p className="text-xs font-bold text-[#4a6280] uppercase tracking-wider mb-4">
                Call Stats
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Answer time',    value: '< 2s', color: '#22d3a0' },
                  { label: 'Call duration',  value: '1m 48s', color: '#4f8ef7' },
                  { label: 'Booking time',   value: '47s', color: '#a78bfa' },
                  { label: 'Staff woken',    value: '0', color: '#22d3a0' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-[#7a94b8]">{label}</span>
                    <span className="text-sm font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue captured */}
            <div className="rounded-2xl border border-[rgba(34,211,160,0.2)] bg-[rgba(34,211,160,0.04)] p-5">
              <p className="text-xs font-bold text-[#22d3a0] uppercase tracking-wider mb-2">
                Revenue Captured
              </p>
              <p className="text-3xl font-bold text-[#ddeeff] mb-1">$3,200</p>
              <p className="text-xs text-[#7a94b8]">
                Estimated lifetime value of one new dental patient — from one call at midnight.
              </p>
            </div>

            {/* What if voicemail */}
            <div className="rounded-2xl border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.04)] p-5">
              <p className="text-xs font-bold text-[#f87171] uppercase tracking-wider mb-2">
                With Voicemail Instead
              </p>
              <p className="text-sm text-[#7a94b8] leading-relaxed">
                Sarah would have hung up. Called a competitor. You&apos;d have woken up to a missed
                call with no name, no number, and no appointment.
              </p>
            </div>

            <a
              href="#pricing"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
                         font-semibold text-white text-sm
                         bg-gradient-to-r from-[#4f8ef7] to-[#1a56db]
                         shadow-[0_0_20px_rgba(79,142,247,0.35)]
                         hover:shadow-[0_0_32px_rgba(79,142,247,0.55)]
                         transition-all duration-300 hover:-translate-y-0.5"
            >
              Set Up Your AI Receptionist →
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
