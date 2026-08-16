#!/usr/bin/env node

/**
 * Environment Configuration Validator
 * Validates presence of critical environment keys for ADIKT Commerce
 */

const requiredVars = [
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_SECRET",
  "COOKIE_SECRET",
  "MEDUSA_PUBLISHABLE_KEY",
]

console.log("🔍 Checking ADIKT environment variables...")

const missing = requiredVars.filter((v) => !process.env[v])

if (missing.length > 0) {
  console.warn(
    `⚠️ Note: The following variables are not currently set in process.env (defaults will be used during local mock):`
  )
  missing.forEach((m) => console.warn(`   - ${m}`))
  console.log(`\n💡 To customize, copy .env.example to .env and configure real credentials.\n`)
} else {
  console.log("✅ All required environment variables are configured!\n")
}
