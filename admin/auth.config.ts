import type { NextAuthConfig } from "next-auth"

// Edge-safe auth config — no Prisma imports.
// Used by middleware.ts (runs in Edge Runtime).
// Full config with providers + adapter lives in lib/auth.ts.
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt", maxAge: 30 * 60 },
  providers: [], // providers are Node-only; added in lib/auth.ts
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role as import("@prisma/client").Role
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as import("@prisma/client").Role
      }
      return session
    },
  },
}
