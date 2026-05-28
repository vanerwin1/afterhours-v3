import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash("admin123!", 12)
  const user = await prisma.user.upsert({
    where: { email: "admin@afterhours.ai" },
    update: {},
    create: {
      email: "admin@afterhours.ai",
      name: "Super Admin",
      password: hash,
      role: "super_admin",
    },
  })
  console.log("Seeded admin user:", user.email)

  // Seed default feature flags
  const flags = [
    {
      key: "ai_agent",
      name: "AI Agent",
      description: "Enable the Claude AI receptionist",
      enabled: true,
    },
    {
      key: "tts",
      name: "TTS Audio",
      description: "Enable ElevenLabs TTS voice",
      enabled: true,
    },
    {
      key: "payments",
      name: "Payments",
      description: "Enable Stripe checkout",
      enabled: true,
    },
    {
      key: "demo_mode",
      name: "Demo Mode",
      description: "Show demo badge on site",
      enabled: false,
    },
  ]
  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: flag,
    })
  }
  console.log("Seeded", flags.length, "feature flags")

  // Seed default settings
  await prisma.setting.upsert({
    where: { key: "maintenance_mode" },
    update: {},
    create: { key: "maintenance_mode", value: false },
  })
  console.log("Seeded default settings")
}

main().catch(console.error).finally(() => prisma.$disconnect())
