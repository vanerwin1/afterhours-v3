'use client'

import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Send, Check, AlertCircle, Loader2 } from 'lucide-react'

const INDUSTRIES = [
  { value: '',              label: 'Industry (optional)' },
  { value: 'dental',        label: 'Dental / Medical' },
  { value: 'legal',         label: 'Legal' },
  { value: 'home-services', label: 'Home Services' },
  { value: 'real-estate',   label: 'Real Estate' },
  { value: 'salon-spa',     label: 'Salon / Spa' },
  { value: 'auto',          label: 'Auto' },
  { value: 'other',         label: 'Other' },
]

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function LeadForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'submitting' || status === 'success') return

    const form = event.currentTarget
    const data = new FormData(form)
    // Collect UTM params from the URL for attribution.
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    const utm: Record<string, string> = {}
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
      const v = params.get(k)
      if (v) utm[k] = v
    }

    const payload = {
      name:     (data.get('name')     as string)?.trim() || undefined,
      email:    (data.get('email')    as string)?.trim(),
      phone:    (data.get('phone')    as string)?.trim() || undefined,
      company:  (data.get('company')  as string)?.trim() || undefined,
      industry: (data.get('industry') as string)?.trim() || undefined,
      message:  (data.get('message')  as string)?.trim() || undefined,
      pagePath: typeof window !== 'undefined' ? window.location.pathname : undefined,
      utm: Object.keys(utm).length > 0 ? utm : undefined,
    }

    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error ?? `HTTP ${res.status}`)
      }
      setStatus('success')
      form.reset()
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'unknown_error')
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[rgba(34,211,160,0.3)] bg-[rgba(34,211,160,0.06)]
                   p-8 text-center"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full
                        bg-[rgba(34,211,160,0.15)] border border-[rgba(34,211,160,0.3)] mb-4">
          <Check size={26} strokeWidth={2.5} className="text-[#22d3a0]" />
        </div>
        <h3 className="text-xl font-bold text-[#ddeeff] mb-2">You&apos;re in.</h3>
        <p className="text-sm text-[#7a94b8]">
          We&apos;ll be in touch within 1 business day. In the meantime, check your inbox
          for setup details.
        </p>
      </motion.div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[rgba(79,142,247,0.15)] bg-[#060d1b] p-6 lg:p-8 space-y-4"
    >
      <div>
        <p className="text-xs font-bold tracking-widest text-[#4f8ef7] uppercase mb-2">
          TALK TO SALES
        </p>
        <h3 className="text-2xl font-bold text-[#ddeeff] mb-1">Get a free setup call</h3>
        <p className="text-sm text-[#7a94b8]">
          Tell us about your business — we&apos;ll show you a tailored demo and quote in
          under 15 minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          name="name"
          placeholder="Your name"
          autoComplete="name"
          className="px-4 py-3 rounded-xl text-sm bg-[rgba(79,142,247,0.04)]
                     border border-[rgba(79,142,247,0.15)] text-[#ddeeff] placeholder:text-[#4a6280]
                     focus:outline-none focus:border-[rgba(79,142,247,0.45)]
                     focus:bg-[rgba(79,142,247,0.08)] transition-colors duration-200"
        />
        <input
          type="email"
          name="email"
          required
          placeholder="you@business.com"
          autoComplete="email"
          inputMode="email"
          className="px-4 py-3 rounded-xl text-sm bg-[rgba(79,142,247,0.04)]
                     border border-[rgba(79,142,247,0.15)] text-[#ddeeff] placeholder:text-[#4a6280]
                     focus:outline-none focus:border-[rgba(79,142,247,0.45)]
                     focus:bg-[rgba(79,142,247,0.08)] transition-colors duration-200"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone (optional)"
          autoComplete="tel"
          inputMode="tel"
          className="px-4 py-3 rounded-xl text-sm bg-[rgba(79,142,247,0.04)]
                     border border-[rgba(79,142,247,0.15)] text-[#ddeeff] placeholder:text-[#4a6280]
                     focus:outline-none focus:border-[rgba(79,142,247,0.45)]
                     focus:bg-[rgba(79,142,247,0.08)] transition-colors duration-200"
        />
        <input
          type="text"
          name="company"
          placeholder="Business name"
          autoComplete="organization"
          className="px-4 py-3 rounded-xl text-sm bg-[rgba(79,142,247,0.04)]
                     border border-[rgba(79,142,247,0.15)] text-[#ddeeff] placeholder:text-[#4a6280]
                     focus:outline-none focus:border-[rgba(79,142,247,0.45)]
                     focus:bg-[rgba(79,142,247,0.08)] transition-colors duration-200"
        />
      </div>

      <select
        name="industry"
        defaultValue=""
        className="w-full px-4 py-3 rounded-xl text-sm bg-[rgba(79,142,247,0.04)]
                   border border-[rgba(79,142,247,0.15)] text-[#ddeeff]
                   focus:outline-none focus:border-[rgba(79,142,247,0.45)]
                   focus:bg-[rgba(79,142,247,0.08)] transition-colors duration-200"
      >
        {INDUSTRIES.map((i) => (
          <option key={i.value} value={i.value} className="bg-[#060d1b] text-[#ddeeff]">
            {i.label}
          </option>
        ))}
      </select>

      <textarea
        name="message"
        rows={3}
        placeholder="Anything we should know? (call volume, languages, integrations, etc.)"
        className="w-full px-4 py-3 rounded-xl text-sm bg-[rgba(79,142,247,0.04)]
                   border border-[rgba(79,142,247,0.15)] text-[#ddeeff] placeholder:text-[#4a6280]
                   focus:outline-none focus:border-[rgba(79,142,247,0.45)]
                   focus:bg-[rgba(79,142,247,0.08)] transition-colors duration-200 resize-none"
      />

      {status === 'error' && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg
                        bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.2)]
                        text-xs text-[#f87171]">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>Couldn&apos;t send — {errorMsg}. Try again, or email{' '}
            <a href="mailto:hello@afterhours.ai" className="underline">hello@afterhours.ai</a>.
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
                   font-semibold text-white text-sm
                   bg-gradient-to-r from-[#4f8ef7] to-[#1a56db]
                   shadow-[0_0_20px_rgba(79,142,247,0.35)]
                   hover:shadow-[0_0_32px_rgba(79,142,247,0.55)]
                   disabled:opacity-60 disabled:cursor-not-allowed
                   transition-all duration-300 hover:-translate-y-0.5
                   disabled:hover:translate-y-0"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Get my free setup call
            <Send size={14} strokeWidth={2.5} />
          </>
        )}
      </button>

      <p className="text-xs text-[#4a6280] text-center">
        No credit card. We&apos;ll never share your info. Read our{' '}
        <a href="/privacy" className="underline hover:text-[#7a94b8]">privacy policy</a>.
      </p>
    </form>
  )
}
