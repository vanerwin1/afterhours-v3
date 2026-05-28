'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '#how-it-works',  label: 'How It Works',  sectionId: 'how-it-works' },
  { href: '#testimonials',  label: 'Reviews',        sectionId: 'testimonials' },
  { href: '#pricing',       label: 'Pricing',        sectionId: 'pricing'      },
  { href: '#faq',           label: 'FAQ',             sectionId: 'faq'          },
]

function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry that is most visible
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible.length > 0) setActive(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: [0.1, 0.5] }
    )

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [ids])

  return active
}

export function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const activeSection = useActiveSection(NAV_LINKS.map((l) => l.sectionId))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        role="banner"
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-[rgba(0,5,7,0.85)] backdrop-blur-xl border-b border-[rgba(79,142,247,0.1)] shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
            : 'bg-transparent'
        )}
      >
        <nav
          role="navigation"
          aria-label="Primary navigation"
          className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between"
        >
          {/* Logo */}
          <a
            href="#home"
            className="flex items-center gap-2 group focus-visible:outline-none"
            aria-label="AfterHours.AI home"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                         bg-gradient-to-br from-[#4f8ef7] to-[#1a56db]
                         shadow-[0_0_16px_rgba(79,142,247,0.4)]
                         group-hover:shadow-[0_0_24px_rgba(79,142,247,0.6)]
                         transition-shadow duration-300"
            >
              A
            </div>
            <span className="font-bold text-[#ddeeff] text-lg tracking-tight">
              AfterHours<span className="text-[#4f8ef7]">.AI</span>
            </span>
          </a>

          {/* Desktop links */}
          <ul role="list" className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.sectionId
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={cn(
                      'relative px-4 py-2 rounded-lg text-sm transition-all duration-200',
                      isActive
                        ? 'text-[#4f8ef7] bg-[rgba(79,142,247,0.1)]'
                        : 'text-[#7a94b8] hover:text-[#ddeeff] hover:bg-[rgba(79,142,247,0.08)]'
                    )}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#4f8ef7]" />
                    )}
                  </a>
                </li>
              )
            })}
          </ul>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            <a
              href="#pricing"
              aria-label="Get started with AfterHours.AI"
              className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold
                         text-white bg-gradient-to-r from-[#4f8ef7] to-[#1a56db]
                         shadow-[0_0_16px_rgba(79,142,247,0.35)]
                         hover:shadow-[0_0_24px_rgba(79,142,247,0.55)]
                         transition-all duration-300 hover:-translate-y-0.5"
            >
              Start Free →
            </a>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5
                         rounded-lg border border-[rgba(79,142,247,0.2)]
                         bg-[rgba(79,142,247,0.06)] hover:bg-[rgba(79,142,247,0.12)]
                         transition-colors duration-200"
            >
              <span
                className={cn(
                  'w-5 h-0.5 bg-[#ddeeff] transition-all duration-300 origin-center',
                  mobileOpen && 'rotate-45 translate-y-2'
                )}
              />
              <span
                className={cn(
                  'w-5 h-0.5 bg-[#ddeeff] transition-all duration-300',
                  mobileOpen && 'opacity-0'
                )}
              />
              <span
                className={cn(
                  'w-5 h-0.5 bg-[#ddeeff] transition-all duration-300 origin-center',
                  mobileOpen && '-rotate-45 -translate-y-2'
                )}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 transition-all duration-300 md:hidden',
          mobileOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
      >
        <div
          className="absolute inset-0 bg-[rgba(0,5,7,0.95)] backdrop-blur-xl"
          onClick={() => setMobileOpen(false)}
        />
        <nav
          className={cn(
            'absolute top-16 left-0 right-0 p-6 transition-all duration-300',
            mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          )}
        >
          <ul className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.sectionId
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block px-4 py-3.5 rounded-xl text-base transition-all duration-200',
                      isActive
                        ? 'text-[#4f8ef7] bg-[rgba(79,142,247,0.1)]'
                        : 'text-[#ddeeff] hover:bg-[rgba(79,142,247,0.1)] hover:text-[#4f8ef7]'
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              )
            })}
            <li className="mt-4">
              <a
                href="#pricing"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3.5 rounded-xl text-base font-semibold text-white text-center
                           bg-gradient-to-r from-[#4f8ef7] to-[#1a56db]
                           shadow-[0_0_20px_rgba(79,142,247,0.4)]"
              >
                Start Free Trial →
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  )
}
