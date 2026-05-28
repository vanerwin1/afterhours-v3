import { Navbar }           from '@/components/layout/navbar'
import { Footer }           from '@/components/layout/footer'
import { SplineHero }       from '@/components/sections/spline-hero'
import { PainStrip }        from '@/components/sections/pain-strip'
import { HowItWorks }       from '@/components/sections/how-it-works'
import { Industries }       from '@/components/sections/industries'
import { ROICalculator }    from '@/components/sections/roi-calculator'
import { Testimonials }     from '@/components/sections/testimonials'
import { Pricing }          from '@/components/sections/pricing'
import { FAQ }              from '@/components/sections/faq'
import { CTABand }          from '@/components/sections/cta-band'
import { AuroraBackground } from '@/components/ui/aurora-background'

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero — full viewport, Spline 3D handles its own background */}
      <SplineHero />

      {/* Pain-point stats strip — bridges hero promise to how-it-works */}
      <PainStrip />

      {/*
        Aurora zone — everything from "How It Works" through Footer.
        intensity="subtle" keeps the effect calm: a barely-there deep-blue
        shimmer that shifts slowly across the dark background. It matches the
        site's #000507 dark palette without competing with section content.
      */}
      <AuroraBackground
        intensity="subtle"
        // Remove the min-height constraint from the base component since we're
        // using it as a scroll-length wrapper, not a full-viewport hero
        className="min-h-0 bg-transparent"
      >
        <HowItWorks />
        <Industries />
        <ROICalculator />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTABand />
        <Footer />
      </AuroraBackground>
    </>
  )
}
