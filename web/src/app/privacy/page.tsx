import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy — AfterHours.AI',
  description: 'How AfterHours.AI collects, uses, and protects your data.',
  robots: { index: true, follow: true },
}

const LAST_UPDATED = 'May 28, 2025'

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-[#7a94b8] text-sm">Last updated: {LAST_UPDATED}</p>
        </header>

        {/* Content */}
        <div className="prose prose-invert prose-sm max-w-none space-y-10 text-[#a8c0d8] leading-relaxed">

          <Section title="1. Who We Are">
            <p>
              AfterHours.AI (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the AI phone answering and
              appointment booking platform at <strong className="text-[#ddeeff]">afterhours.ai</strong>.
              This Privacy Policy explains how we collect, use, share, and protect your information
              when you use our website and services.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <Subheading>2.1 Information You Provide</Subheading>
            <ul>
              <li><strong className="text-[#ddeeff]">Account information:</strong> Name, email address, phone number, and business details when you sign up.</li>
              <li><strong className="text-[#ddeeff]">Payment information:</strong> Billing details are processed by Stripe and never stored on our servers.</li>
              <li><strong className="text-[#ddeeff]">Configuration data:</strong> Scripts, FAQs, calendar links, and business rules you set up for your AI agent.</li>
            </ul>

            <Subheading>2.2 Information Collected Automatically</Subheading>
            <ul>
              <li><strong className="text-[#ddeeff]">Usage data:</strong> Pages visited, features used, click patterns, and session duration.</li>
              <li><strong className="text-[#ddeeff]">Device data:</strong> IP address, browser type, operating system, and referring URLs.</li>
              <li><strong className="text-[#ddeeff]">Cookies:</strong> We use essential cookies for authentication and optional analytics cookies (see Section 5).</li>
            </ul>

            <Subheading>2.3 Call Data</Subheading>
            <ul>
              <li><strong className="text-[#ddeeff]">Transcripts:</strong> Conversations handled by your AI agent are transcribed and stored in your account.</li>
              <li><strong className="text-[#ddeeff]">Caller information:</strong> Phone numbers, names, and information callers volunteer during a call.</li>
              <li><strong className="text-[#ddeeff]">Recordings:</strong> Call recordings (on Business and Agency plans) stored securely and accessible only by you.</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul>
              <li>To provide, maintain, and improve our AI phone answering service.</li>
              <li>To process payments and send receipts.</li>
              <li>To send call summaries, booking confirmations, and alerts you configure.</li>
              <li>To respond to your support requests.</li>
              <li>To detect and prevent fraud or abuse.</li>
              <li>To analyze aggregate usage and improve our models (never tied to identifiable callers).</li>
              <li>To send product updates and marketing emails (you can opt out anytime).</li>
            </ul>
          </Section>

          <Section title="4. How We Share Your Information">
            <p>
              We do <strong className="text-[#ddeeff]">not</strong> sell your personal information.
              We share data only in limited circumstances:
            </p>
            <ul>
              <li><strong className="text-[#ddeeff]">Service providers:</strong> Stripe (payments), Resend (email), Twilio (voice/SMS), Supabase (database), Vercel (hosting). Each is bound by data processing agreements.</li>
              <li><strong className="text-[#ddeeff]">AI model providers:</strong> Call audio may be processed by AI voice providers under strict confidentiality terms.</li>
              <li><strong className="text-[#ddeeff]">Legal requirements:</strong> If required by law, court order, or to protect rights and safety.</li>
              <li><strong className="text-[#ddeeff]">Business transfers:</strong> In the event of a merger or acquisition, with notice to you.</li>
            </ul>
          </Section>

          <Section title="5. Cookies & Tracking">
            <p>
              We use cookies strictly for:
            </p>
            <ul>
              <li><strong className="text-[#ddeeff]">Essential cookies:</strong> Authentication tokens and session management (cannot be disabled without breaking the service).</li>
              <li><strong className="text-[#ddeeff]">Analytics cookies:</strong> Anonymous usage statistics to improve the product. You can opt out via your browser settings or by emailing us.</li>
            </ul>
            <p>We do not use advertising or tracking cookies.</p>
          </Section>

          <Section title="6. Data Retention">
            <p>
              We retain your account data as long as your account is active. After cancellation:
            </p>
            <ul>
              <li>Account data is deleted within <strong className="text-[#ddeeff]">90 days</strong>.</li>
              <li>Call transcripts and recordings are deleted within <strong className="text-[#ddeeff]">30 days</strong> unless you request earlier deletion.</li>
              <li>Payment records are retained for <strong className="text-[#ddeeff]">7 years</strong> to comply with tax law.</li>
            </ul>
          </Section>

          <Section title="7. Your Rights">
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li><strong className="text-[#ddeeff]">Access</strong> the personal data we hold about you.</li>
              <li><strong className="text-[#ddeeff]">Correct</strong> inaccurate data.</li>
              <li><strong className="text-[#ddeeff]">Delete</strong> your data (&ldquo;right to be forgotten&rdquo;).</li>
              <li><strong className="text-[#ddeeff]">Export</strong> your data in a portable format.</li>
              <li><strong className="text-[#ddeeff]">Opt out</strong> of marketing communications.</li>
            </ul>
            <p>
              To exercise these rights, email{' '}
              <a href="mailto:privacy@afterhours.ai" className="text-[#4f8ef7] hover:underline">
                privacy@afterhours.ai
              </a>
              . We will respond within 30 days.
            </p>
          </Section>

          <Section title="8. Security">
            <p>
              We protect your data with TLS encryption in transit, AES-256 encryption at rest,
              role-based access controls, and regular security audits. No system is perfectly
              secure — if you discover a vulnerability, please disclose it responsibly to{' '}
              <a href="mailto:security@afterhours.ai" className="text-[#4f8ef7] hover:underline">
                security@afterhours.ai
              </a>.
            </p>
          </Section>

          <Section title="9. Children">
            <p>
              Our service is not directed at children under 13. We do not knowingly collect
              data from children. If you believe we have, contact us and we will delete it promptly.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this policy periodically. We will notify you of material changes
              by email or by posting a notice on our website at least 14 days before the changes
              take effect.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              Questions about this policy? Contact us at:
            </p>
            <p>
              <strong className="text-[#ddeeff]">AfterHours.AI</strong><br />
              <a href="mailto:privacy@afterhours.ai" className="text-[#4f8ef7] hover:underline">
                privacy@afterhours.ai
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

function Subheading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold text-[#c0d4e8] mt-5 mb-2">{children}</h3>
  )
}
