'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Plan = {
  id: string
  name: string
  monthlyPrice: number
  annualPrice: number
  description: string
  features: string[]
  cta: string
  highlight: boolean
  badge: string | null
  callsLabel: string
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 297,
    annualPrice: 2970,
    description: 'Perfect for solo operators and small offices who never want to miss a call.',
    callsLabel: '500 calls / month',
    features: [
      '500 AI-handled calls/month',
      'Booking + FAQ automation',
      'Call summaries via email',
      'Natural AI voice',
      'Email support',
    ],
    cta: 'Get Started',
    highlight: false,
    badge: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 497,
    annualPrice: 4970,
    description: "For growing businesses who can't afford to miss a single lead.",
    callsLabel: '1,500 calls / month',
    features: [
      '1,500 AI-handled calls/month',
      'Priority response & routing',
      'Extended call handling',
      'Advanced booking management',
      'SMS follow-up after calls',
      'Priority support',
      'Custom scripts & FAQs',
    ],
    cta: 'Get Started',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPrice: 897,
    annualPrice: 8970,
    description: 'Full-service AI receptionist for high-volume businesses with dedicated onboarding.',
    callsLabel: '5,000 calls / month',
    features: [
      '5,000 AI-handled calls/month',
      'Custom voice cloning',
      'Calendar + CRM integration',
      'Call recordings + transcripts',
      'Dedicated onboarding',
      'Priority phone support',
    ],
    cta: 'Get Started',
    highlight: false,
    badge: null,
  },
  {
    id: 'agency',
    name: 'Agency',
    monthlyPrice: 1497,
    annualPrice: 14970,
    description: 'White-label AI receptionist solution for agencies managing multiple clients.',
    callsLabel: 'Unlimited calls',
    features: [
      'Unlimited calls',
      'White-label + custom branding',
      'Multi-location support',
      'Dedicated account manager',
      'Priority support 24/7',
      'Custom integrations',
      'SLA guarantees',
    ],
    cta: 'Contact Sales',
    highlight: false,
    badge: null,
  },
]

function PlanCard({
  plan,
  billing,
  index,
}: {
  plan: Plan
  billing: 'monthly' | 'annual'
  index: number
}) {
  const [loading, setLoading] = useState(false)

  const price = billing === 'annual' ? plan.annualPrice : plan.monthlyPrice
  const perMonth =
    billing === 'annual'
      ? Math.round(plan.annualPrice / 12)
      : plan.monthlyPrice
  const savings =
    billing === 'annual'
      ? Math.round((plan.monthlyPrice * 12 - plan.annualPrice) / (plan.monthlyPrice * 12) * 100)
      : 0

  const handleClick = async () => {
    if (plan.id === 'agency' && billing !== 'annual') {
      window.location.href = 'mailto:hello@afterhours.ai?subject=Agency Plan Inquiry'
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.id, billing }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Checkout error:', data.error)
        alert('Something went wrong. Please try again.')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={cn(
        'relative flex flex-col p-7 rounded-2xl border transition-all duration-300',
        plan.highlight
          ? 'border-[rgba(79,142,247,0.5)] bg-[#060d1b] shadow-[0_0_60px_rgba(79,142,247,0.18),inset_0_1px_0_rgba(79,142,247,0.15)]'
          : 'border-[rgba(79,142,247,0.12)] bg-[#060d1b] hover:border-[rgba(79,142,247,0.25)]'
      )}
    >
      {/* Badge */}
      {plan.badge && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2
                     px-4 py-1 rounded-full text-xs font-bold text-white
                     bg-gradient-to-r from-[#4f8ef7] to-[#1a56db]
                     shadow-[0_0_20px_rgba(79,142,247,0.5)] whitespace-nowrap"
        >
          {plan.badge}
        </div>
      )}

      {/* Annual savings badge */}
      {billing === 'annual' && savings > 0 && (
        <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold text-[#22d3a0] bg-[rgba(34,211,160,0.12)] border border-[rgba(34,211,160,0.25)]">
          Save {savings}%
        </div>
      )}

      {/* Plan name */}
      <p className="text-xs font-semibold text-[#7a94b8] uppercase tracking-wider mb-3">
        {plan.name}
      </p>

      {/* Price */}
      <div className="mb-1">
        {billing === 'annual' ? (
          <div>
            <div className="flex items-end gap-1">
              <span className={cn(
                'text-4xl font-bold',
                plan.highlight ? 'text-[#4f8ef7]' : 'text-[#ddeeff]'
              )}>
                ${perMonth.toLocaleString()}
              </span>
              <span className="text-[#7a94b8] mb-1.5 text-base">/mo</span>
            </div>
            <p className="text-xs text-[#4a6280] mt-0.5">
              ${price.toLocaleString()} billed annually
            </p>
          </div>
        ) : (
          <div className="flex items-end gap-1">
            <span className={cn(
              'text-4xl font-bold',
              plan.highlight ? 'text-[#4f8ef7]' : 'text-[#ddeeff]'
            )}>
              ${price.toLocaleString()}
            </span>
            <span className="text-[#7a94b8] mb-1.5 text-base">/mo</span>
          </div>
        )}
      </div>

      {/* Calls label */}
      <p className="text-xs font-medium text-[#22d3a0] mb-3">{plan.callsLabel}</p>

      <p className="text-sm text-[#7a94b8] mb-6">{plan.description}</p>

      {/* CTA */}
      <button
        onClick={handleClick}
        disabled={loading}
        className={cn(
          'w-full py-3 rounded-xl font-semibold text-center text-sm mb-6 transition-all duration-300 disabled:opacity-50',
          plan.highlight
            ? 'bg-gradient-to-r from-[#4f8ef7] to-[#1a56db] text-white shadow-[0_0_20px_rgba(79,142,247,0.4)] hover:shadow-[0_0_32px_rgba(79,142,247,0.6)] hover:-translate-y-0.5'
            : 'border border-[rgba(79,142,247,0.3)] text-[#ddeeff] bg-[rgba(79,142,247,0.06)] hover:border-[rgba(79,142,247,0.5)] hover:bg-[rgba(79,142,247,0.1)]'
        )}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Redirecting…
          </span>
        ) : (
          plan.cta
        )}
      </button>

      {/* Features */}
      <ul className="space-y-2.5 mt-auto">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-[#a8c0d8]">
            <span className="text-[#22d3a0] mt-0.5 shrink-0">✓</span>
            {f}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

export function Pricing() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')

  return (
    <section
      id="pricing"
      className="relative py-28 px-6 lg:px-12 overflow-hidden bg-[#000507]"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px]
                     bg-[radial-gradient(ellipse,rgba(79,142,247,0.07)_0%,transparent_70%)]"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-xs font-semibold tracking-widest text-[#4f8ef7] uppercase mb-4">
            PRICING
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#ddeeff] mb-5">
            One missed call pays{' '}
            <span className="bg-gradient-to-r from-[#4f8ef7] to-[#a78bfa] bg-clip-text text-transparent">
              for a year
            </span>
          </h2>
          <p className="text-lg text-[#7a94b8] max-w-xl mx-auto">
            Most businesses recoup the cost in the first week. No long-term contracts. Cancel anytime.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center justify-center gap-3 mb-12"
        >
          <button
            onClick={() => setBilling('monthly')}
            className={cn(
              'text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200',
              billing === 'monthly'
                ? 'text-[#ddeeff] bg-[rgba(79,142,247,0.12)] border border-[rgba(79,142,247,0.3)]'
                : 'text-[#7a94b8] hover:text-[#ddeeff]'
            )}
          >
            Monthly
          </button>

          <div
            className="relative w-12 h-6 rounded-full cursor-pointer bg-[rgba(79,142,247,0.2)] border border-[rgba(79,142,247,0.3)] flex items-center px-0.5"
            onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
          >
            <div
              className={cn(
                'w-5 h-5 rounded-full bg-[#4f8ef7] shadow-[0_0_8px_rgba(79,142,247,0.6)] transition-transform duration-200',
                billing === 'annual' ? 'translate-x-6' : 'translate-x-0'
              )}
            />
          </div>

          <button
            onClick={() => setBilling('annual')}
            className={cn(
              'flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200',
              billing === 'annual'
                ? 'text-[#ddeeff] bg-[rgba(79,142,247,0.12)] border border-[rgba(79,142,247,0.3)]'
                : 'text-[#7a94b8] hover:text-[#ddeeff]'
            )}
          >
            Annual
            <span className="text-[10px] font-bold text-[#22d3a0] bg-[rgba(34,211,160,0.12)] border border-[rgba(34,211,160,0.25)] px-1.5 py-0.5 rounded-full">
              Save ~17%
            </span>
          </button>
        </motion.div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} billing={billing} index={i} />
          ))}
        </div>

        {/* Fine print */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-10 text-xs text-[#4a6280]"
        >
          All plans include a 30-day money-back guarantee. No setup fees. Cancel any time.
        </motion.p>
      </div>
    </section>
  )
}
