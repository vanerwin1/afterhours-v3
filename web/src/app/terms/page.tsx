import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service — AfterHours.AI',
  description: 'Terms and conditions for using the AfterHours.AI platform.',
  robots: { index: true, follow: true },
}

const LAST_UPDATED = 'May 28, 2025'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#000507] text-[#ddeeff]">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 30% at 50% 0%, rgba(79,142,247,0.05) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 lg:py-24">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#7a94b8] hover:text-[#4f8ef7]
                     transition-colors duration-200 mb-10"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        {/* Header */}
        <header className="mb-12">
          <p className="text-xs font-bold tracking-[0.3em] text-[#4f8ef7] uppercase mb-4">
            Legal
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold text-[#ddeeff] mb-4">
            Terms of Service
          </h1>
          <p className="text-[#7a94b8] text-sm">Last updated: {LAST_UPDATED}</p>
        </header>

        {/* Content */}
        <div className="space-y-10 text-[#a8c0d8] leading-relaxed text-sm">

          <Section title="1. Agreement to Terms">
            <p>
              By accessing or using AfterHours.AI (&ldquo;Service&rdquo;), you agree to be bound by
              these Terms of Service (&ldquo;Terms&rdquo;). If you disagree with any part of these
              Terms, you may not use our Service.
            </p>
            <p>
              These Terms apply to all users, including visitors, registered customers, and
              businesses that have subscribed to any plan.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              AfterHours.AI provides an AI-powered phone answering service that:
            </p>
            <ul>
              <li>Answers inbound calls on your business phone number</li>
              <li>Books appointments using your configured calendar system</li>
              <li>Captures caller information and intent</li>
              <li>Sends call summaries via email and SMS</li>
              <li>Escalates urgent calls based on rules you define</li>
            </ul>
            <p>
              The Service is provided &ldquo;as is&rdquo; and we reserve the right to modify, suspend,
              or discontinue features with reasonable notice.
            </p>
          </Section>

          <Section title="3. Account Registration">
            <p>
              You must provide accurate, complete information when creating an account.
              You are responsible for:
            </p>
            <ul>
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>
            <p>
              You must be at least 18 years old and legally authorized to enter contracts to use
              the Service.
            </p>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree <strong className="text-[#ddeeff]">not</strong> to:</p>
            <ul>
              <li>Use the Service for illegal purposes, including calls that violate TCPA, HIPAA, or other applicable laws</li>
              <li>Record or transcribe calls without proper consent disclosures as required by law</li>
              <li>Impersonate any person or entity, or misrepresent your affiliation</li>
              <li>Attempt to reverse-engineer, copy, or create derivative works from our AI models</li>
              <li>Use the Service to send spam, robocalls, or unsolicited marketing</li>
              <li>Overload our infrastructure in a way that disrupts other customers</li>
            </ul>
            <p>
              You are solely responsible for ensuring your use of AI phone answering complies
              with all applicable state and federal laws, including call recording consent laws.
            </p>
          </Section>

          <Section title="5. Payment & Billing">
            <p>
              Subscription fees are billed in advance, monthly or annually based on your chosen
              plan. All payments are processed securely by Stripe.
            </p>
            <ul>
              <li><strong className="text-[#ddeeff]">Cancellation:</strong> You may cancel at any time before your next billing cycle. Access continues until the end of the paid period.</li>
              <li><strong className="text-[#ddeeff]">Refunds:</strong> We offer a 30-day money-back guarantee on your first subscription payment. After 30 days, fees are non-refundable.</li>
              <li><strong className="text-[#ddeeff]">Price changes:</strong> We will notify you at least 30 days before any price increase takes effect.</li>
              <li><strong className="text-[#ddeeff]">Overages:</strong> Calls beyond your plan limit may be charged at a per-call rate disclosed in your plan details.</li>
            </ul>
          </Section>

          <Section title="6. Call Recording & Compliance">
            <p>
              Some jurisdictions (including California and other &ldquo;two-party consent&rdquo; states)
              require <strong className="text-[#ddeeff]">all parties</strong> to consent before a call
              is recorded. You are responsible for:
            </p>
            <ul>
              <li>Configuring an appropriate disclosure in your AI agent&apos;s greeting if you enable recording</li>
              <li>Complying with all applicable federal and state call recording laws</li>
              <li>Maintaining required notices on your business phone system</li>
            </ul>
            <p>
              AfterHours.AI provides tools to configure consent language but is not responsible
              for your compliance with applicable laws.
            </p>
          </Section>

          <Section title="7. Data Ownership">
            <p>
              You own all call data, transcripts, and customer information associated with your
              account. We process this data solely to provide the Service as described in our
              Privacy Policy.
            </p>
            <p>
              You grant AfterHours.AI a limited license to process your data to provide the Service.
              We do not sell your data or use it to train models without your explicit consent.
            </p>
          </Section>

          <Section title="8. Intellectual Property">
            <p>
              AfterHours.AI and its licensors own all rights to the Service, including its
              AI models, software, branding, and documentation. Nothing in these Terms grants
              you ownership of our intellectual property.
            </p>
            <p>
              You retain ownership of any custom scripts, business information, and configurations
              you provide to personalize your AI agent.
            </p>
          </Section>

          <Section title="9. Disclaimers & Limitation of Liability">
            <p>
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTY OF ANY KIND. TO THE FULLEST
              EXTENT PERMITTED BY LAW, AFTERHOURS.AI DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED,
              INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT.
            </p>
            <p>
              IN NO EVENT WILL AFTERHOURS.AI&apos;S LIABILITY EXCEED THE GREATER OF (A) THE AMOUNT
              YOU PAID IN THE 12 MONTHS PRECEDING THE CLAIM OR (B) $100. WE ARE NOT LIABLE FOR
              INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
            </p>
          </Section>

          <Section title="10. Indemnification">
            <p>
              You agree to indemnify and hold harmless AfterHours.AI from any claims, damages,
              or expenses arising from your use of the Service, violation of these Terms, or
              infringement of any third party&apos;s rights.
            </p>
          </Section>

          <Section title="11. Termination">
            <p>
              We may terminate or suspend your account if you violate these Terms, with or without
              notice. You may terminate your account at any time by canceling your subscription.
              Upon termination, your right to use the Service ceases and we will delete your data
              per our Privacy Policy.
            </p>
          </Section>

          <Section title="12. Governing Law">
            <p>
              These Terms are governed by the laws of the State of Delaware, United States,
              without regard to conflict of law provisions. Any disputes will be resolved by
              binding arbitration in accordance with the AAA Commercial Arbitration Rules.
            </p>
          </Section>

          <Section title="13. Changes to Terms">
            <p>
              We may update these Terms at any time. Material changes will be communicated
              by email at least 14 days before taking effect. Continued use of the Service
              after the effective date constitutes acceptance of the updated Terms.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>
              Questions about these Terms?
            </p>
            <p>
              <strong className="text-[#ddeeff]">AfterHours.AI</strong><br />
              <a href="mailto:legal@afterhours.ai" className="text-[#4f8ef7] hover:underline">
                legal@afterhours.ai
              </a>
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-[#ddeeff] mb-4 pb-2 border-b border-[rgba(79,142,247,0.12)]">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
