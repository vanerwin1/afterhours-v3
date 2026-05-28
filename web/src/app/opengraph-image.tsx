import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'AfterHours.AI — AI Phone Answering & Booking for Small Businesses'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #000507 0%, #020b14 60%, #040f1f 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow orbs */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,142,247,0.25) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #4f8ef7, #1a56db)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 900,
              color: 'white',
              boxShadow: '0 0 30px rgba(79,142,247,0.5)',
            }}
          >
            A
          </div>
          <span style={{ fontSize: 36, fontWeight: 800, color: '#ddeeff', letterSpacing: '-0.5px' }}>
            AfterHours<span style={{ color: '#4f8ef7' }}>.AI</span>
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: '#ddeeff',
            textAlign: 'center',
            lineHeight: 1.05,
            letterSpacing: '-1.5px',
            marginBottom: 24,
            maxWidth: 900,
          }}
        >
          Never Miss{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #4f8ef7, #82b4ff, #a78bfa)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Another Call.
          </span>
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: 24,
            color: '#7a94b8',
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.5,
            marginBottom: 48,
          }}
        >
          AI voice agent that answers calls, books appointments, and captures leads 24/7.
          Setup in 24 hours. No credit card required.
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { value: '< 2s', label: 'Answer Time' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '24/7', label: 'Always On' },
            { value: '$0', label: 'Setup Cost' },
          ].map(({ value, label }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 28px',
                borderRadius: 16,
                border: '1px solid rgba(79,142,247,0.2)',
                background: 'rgba(79,142,247,0.08)',
              }}
            >
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  background: 'linear-gradient(90deg, #4f8ef7, #a78bfa)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  letterSpacing: '-0.5px',
                }}
              >
                {value}
              </span>
              <span style={{ fontSize: 14, color: '#7a94b8', marginTop: 4 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
