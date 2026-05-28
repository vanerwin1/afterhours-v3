import { ArrowLeft, PhoneOff } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#000507] flex flex-col items-center justify-center p-6 text-center">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(79,142,247,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center
                       bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.25)]
                       shadow-[0_0_40px_rgba(248,113,113,0.15)]"
          >
            <PhoneOff size={36} strokeWidth={1.5} className="text-[#f87171]" />
          </div>
        </div>

        {/* Text */}
        <p className="text-xs font-bold tracking-[0.3em] text-[#4f8ef7] uppercase mb-4">404</p>
        <h1 className="text-3xl font-bold text-[#ddeeff] mb-3">
          Call not connected
        </h1>
        <p className="text-[#7a94b8] mb-8">
          Looks like this page went to voicemail. But unlike a missed call, we can
          help you get back on track.
        </p>

        {/* CTA */}
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                     bg-gradient-to-r from-[#4f8ef7] to-[#1a56db] text-white
                     font-semibold text-sm
                     shadow-[0_0_20px_rgba(79,142,247,0.35)]
                     hover:shadow-[0_0_32px_rgba(79,142,247,0.55)]
                     transition-all duration-300 hover:-translate-y-0.5"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Back to home
        </a>
      </div>
    </div>
  )
}
