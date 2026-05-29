import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import * as OTPAuth from "otpauth"
import { prisma } from "./prisma"
import { authConfig } from "../auth.config"
import type { Role } from "@prisma/client"

const ROLE_ORDER: Role[] = ["viewer", "admin", "super_admin"]

export function roleAtLeast(userRole: Role, minRole: Role): boolean {
  return ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(minRole)
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 30 * 60 },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials, req) {
        const ip =
          (req as Request)?.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
        const email = (credentials?.email as string)?.toLowerCase().trim()
        const password = credentials?.password as string
        const totpCode = credentials?.totp as string | undefined

        const logAttempt = async (
          userId: string | null,
          success: boolean,
          failReason?: string
        ) => {
          await prisma.loginAttempt
            .create({
              data: { email, ip, success, userId, failReason },
            })
            .catch(() => {})
        }

        // Fallback (break-glass) admin — env-var-based credentials so the
        // dashboard can be unlocked even if the DB is unreachable OR empty.
        // Checked FIRST so it works regardless of DB state.
        const fallbackEmail = process.env.ADMIN_FALLBACK_EMAIL?.toLowerCase().trim()
        const fallbackHash  = process.env.ADMIN_FALLBACK_HASH
        const fallbackRole  = (process.env.ADMIN_FALLBACK_ROLE ?? "super_admin") as Role

        if (fallbackEmail && fallbackHash && email === fallbackEmail) {
          const passwordValid = await bcrypt.compare(password, fallbackHash)
          if (passwordValid) {
            console.warn("[auth] authenticated via fallback admin credentials")
            return {
              id: "fallback-admin",
              email: fallbackEmail,
              name: "Admin",
              image: null,
              role: fallbackRole,
            }
          }
        }

        try {
          const user = await prisma.user.findUnique({ where: { email } })

          if (!user || !user.password) {
            await logAttempt(null, false, "user_not_found")
            return null
          }
          if (user.banned) {
            await logAttempt(user.id, false, "user_banned")
            return null
          }

          const passwordValid = await bcrypt.compare(password, user.password)
          if (!passwordValid) {
            await logAttempt(user.id, false, "invalid_password")
            return null
          }

          if (user.twoFactorEnabled && user.twoFactorSecret) {
            if (!totpCode) {
              await logAttempt(user.id, false, "2fa_required")
              throw new Error("2FA_REQUIRED")
            }
            const totp = new OTPAuth.TOTP({
              secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret),
              digits: 6,
              period: 30,
            })
            const delta = totp.validate({ token: totpCode, window: 1 })
            if (delta === null) {
              await logAttempt(user.id, false, "2fa_failed")
              throw new Error("2FA_INVALID")
            }
          }

          await Promise.all([
            logAttempt(user.id, true),
            prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date(), lastLoginIp: ip },
            }),
          ])

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (err) {
          // If error is from 2FA logic, re-throw
          if (err instanceof Error && (err.message === "2FA_REQUIRED" || err.message === "2FA_INVALID")) {
            throw err
          }

          // DB unavailable (e.g. Vercel → Supabase blocked) — fall back to
          // env-var based credentials so the admin can still log in.
          const fallbackEmail = process.env.ADMIN_FALLBACK_EMAIL
          const fallbackHash  = process.env.ADMIN_FALLBACK_HASH
          const fallbackRole  = (process.env.ADMIN_FALLBACK_ROLE ?? "super_admin") as Role

          if (fallbackEmail && fallbackHash && email === fallbackEmail.toLowerCase()) {
            const passwordValid = await bcrypt.compare(password, fallbackHash)
            if (passwordValid) {
              console.warn("[auth] DB unavailable — authenticated via fallback credentials")
              return {
                id: "fallback-admin",
                email: fallbackEmail,
                name: "Admin (offline)",
                image: null,
                role: fallbackRole,
              }
            }
          }

          console.error("[auth] DB unreachable and no fallback matched:", err instanceof Error ? err.message : err)
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      // Persist role + id into the JWT on first sign-in
      if (user) {
        token.id = user.id
        token.role = (user as { role?: Role }).role
      }
      return token
    },
    session({ session, token }) {
      // Expose id + role to the client session
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
  },
  pages: { signIn: "/login", error: "/login" },
  events: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await prisma.user
          .update({
            where: { id: user.id! },
            data: { lastLoginAt: new Date() },
          })
          .catch(() => {})
      }
    },
  },
})

export async function requireRole(minRole: Role): Promise<void> {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  const userRole = session.user.role as Role
  if (!roleAtLeast(userRole, minRole)) {
    throw new Error("Forbidden")
  }
}

// Extend session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: Role
    }
  }
  interface User {
    role: Role
  }
}

// JWT type augmentation — next-auth v5 merges this into the main module
declare module "next-auth" {
  interface JWT {
    id?: string
    role?: Role
  }
}
