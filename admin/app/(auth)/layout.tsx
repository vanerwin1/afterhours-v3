import { Suspense } from "react"
import { SessionProvider } from "@/components/layout/session-provider"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Suspense>{children}</Suspense>
    </SessionProvider>
  )
}
