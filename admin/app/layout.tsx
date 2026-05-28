import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: "Command Center", template: "%s — Command Center" },
  description: "AfterHours.AI admin dashboard",
  robots: "noindex, nofollow",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
