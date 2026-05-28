export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      role="contentinfo"
      className="bg-[#020b14] border-t border-[rgba(79,142,247,0.08)] py-16 px-6 lg:px-12"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                           bg-gradient-to-br from-[#4f8ef7] to-[#1a56db]"
              >
                A
              </div>
              <span className="font-bold text-[#ddeeff] text-lg">
                AfterHours<span className="text-[#4f8ef7]">.AI</span>
              </span>
            </div>
            <p className="text-sm text-[#7a94b8] leading-relaxed max-w-xs">
              AI-powered phone answering and appointment booking that works while you don't.
              Never miss another lead, no matter the hour.
            </p>
            <div className="flex items-center gap-2 mt-5">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22d3a0] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22d3a0]" />
              </div>
              <span className="text-xs text-[#22d3a0] font-medium">All systems operational</span>
            </div>
          </div>

          {/* Product links */}
          <nav aria-label="Product links">
            <p className="text-xs font-bold uppercase tracking-widest text-[#4a6280] mb-4">
              Product
            </p>
            <ul className="space-y-2.5">
              {[
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Pricing',      href: '#pricing' },
                { label: 'Integrations', href: '#faq' },
                { label: 'Security',     href: '#faq' },
                { label: 'Changelog',    href: 'mailto:hello@afterhours.ai?subject=Changelog' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-[#7a94b8] hover:text-[#ddeeff] transition-colors duration-200"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company links */}
          <nav aria-label="Company links">
            <p className="text-xs font-bold uppercase tracking-widest text-[#4a6280] mb-4">
              Company
            </p>
            <ul className="space-y-2.5">
              {[
                { label: 'About',   href: 'mailto:hello@afterhours.ai?subject=About AfterHours.AI' },
                { label: 'Blog',    href: 'mailto:hello@afterhours.ai?subject=Blog' },
                { label: 'Reviews', href: '#testimonials' },
                { label: 'FAQ',     href: '#faq' },
                { label: 'Contact', href: 'mailto:hello@afterhours.ai' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-[#7a94b8] hover:text-[#ddeeff] transition-colors duration-200"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[rgba(79,142,247,0.08)]">
          <p className="text-xs text-[#4a6280]">
            © {year} AfterHours.AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {[
              { label: 'Privacy Policy',    href: '/privacy' },
              { label: 'Terms of Service',  href: '/terms' },
              { label: 'HIPAA Compliance',  href: 'mailto:hello@afterhours.ai?subject=HIPAA Compliance' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-xs text-[#4a6280] hover:text-[#7a94b8] transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
