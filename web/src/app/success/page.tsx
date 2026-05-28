'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Mail, Clock, Headphones, ArrowLeft } from 'lucide-react'

const PLAN_NAMES: Record<string, string> = {
  starter:  'Starter',
  pro:      'Pro',
  business: 'Business',
  agency:   'Agency',
}

const PLAN_COLORS: Record<string, string> = {
  starter:  '#4f8ef7',
  pro:      '#22d3a0',
  business: '#a78bfa',
  agency:   '#fbbf24',
}

const NEXT_STEPS = [
  {
    Icon: Mail,
    title: 'Check your inbox',
    body: "A welcome email is on its way with your account details and next steps.",
    color: '#4f8ef7',
  },
  {
    Icon: Headphones,
    title: "We'll reach out",
    body: "Our onboarding team contacts you within 24 hours to configure your AI receptionist.",
    color: '#22d3a0',
  },
  {
    Icon: Clock,
    title: 'Go live in 24 hrs',
    body: "Once configured, forward your after-hours calls. Your AI goes live same day.",
    color: '#a78bfa',
  },
]

function SuccessContent() {
  const params  = useSearchParams()
  const plan    = params.get('plan') ?? 'starter'
  const billing = params.get('billing') ?? 'monthly'
  const color   = PLAN_COLORS[plan] ?? '#4f8ef7'
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-[#000507] flex flex-col items-center justify-center p-6">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 20%, ${color}08 0%, transparent 70%)`,
        }}
      />

      <div
        className={`max-w-lg w-full relative z-10 transition-all duration-700 ${
          show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Check icon */}
        <div className="flex justify-center mb-8">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${color}20 0%, ${color}05 100%)`,
              border: `2px solid ${color}40`,
              boxShadow: `0 0 60px ${color}30`,
            }}
          >
            <CheckCircle2
              size={48}
              strokeWidth={1.5}
              style={{ color }}
            />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#ddeeff] mb-3">
            You&apos;re in!
          </h1>
          <p className="text-[#7a94b8] text-lg">
            Welcome to AfterHours{' '}
            <span className="font-semibold" style={{ color }}>
              {PLAN_NAMES[plan] ?? 'Starter'}
            </span>
            {billing === 'annual' && (
              <span className="ml-1 text-sm text-[#22d3a0] font-medium">(annual)</span>
            )}
          </p>
          <p className="text-[#4a6280] text-sm mt-2 max-w-sm mx-auto">
            Your AI receptionist is being configured. Here&apos;s what happens next:
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-10">
          {NEXT_STEPS.map(({ Icon, title, body, color: c }, i) => (
            <div
              key={title}
              className={`flex items-start gap-4 p-5 rounded-xl border
                         bg-[#060d1b] transition-all duration-500`}
              style={{
                borderColor: `${c}20`,
                transitionDelay: `${i * 100 + 300}ms`,
                opacity: show ? 1 : 0,
                transform: show ? 'translateY(0)' : 'translateY(12px)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                style={{
                  color: c,
                  background: `${c}10`,
                  borderColor: `${c}30`,
                }}
              >
                <Icon size={18} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#ddeeff] mb-0.5">{title}</p>
                <p className="text-xs text-[#7a94b8] leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                       border border-[rgba(79,142,247,0.25)] text-[#ddeeff] text-sm font-medium
                       bg-[rgba(79,142,247,0.06)] hover:bg-[rgba(79,142,247,0.12)]
                       hover:border-[rgba(79,142,247,0.4)] transition-all duration-200"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Back to home
          </a>
          <a
            href={`mailto:hello@afterhours.ai?subject=Onboarding - ${PLAN_NAMES[plan] ?? 'Starter'} Plan`}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                       text-sm font-semibold text-white
                       bg-gradient-to-r from-[#4f8ef7] to-[#1a56db]
                       shadow-[0_0_16px_rgba(79,142,247,0.35)]
                       hover:shadow-[0_0_24px_rgba(79,142,247,0.55)]
                       transition-all duration-300"
          >
            <Mail size={16} strokeWidth={2} />
            Contact onboarding
          </a>
        </div>

        {/* Trust note */}
        <p className="text-center mt-8 text-xs text-[#4a6280]">
          Questions? Email us at{' '}
          <a href="mailto:hello@afterhours.ai" className="text-[#4f8ef7] hover:underline">
            hello@afterhours.ai
          </a>
          {' '}— we typically respond within a few hours.
        </p>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#000507] flex items-center justify-center">
        <div className="text-[#7a94b8] text-sm">Loading…</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
