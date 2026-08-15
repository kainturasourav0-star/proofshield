const { PrismaClient } = require("@prisma/client")
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3")
const bcrypt = require("bcryptjs")
const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") })

const url = process.env.DATABASE_URL || "file:./dev.db"
const adapter = new PrismaBetterSqlite3({ url })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // Clean DB safely (Prisma 7 compatible)
  await prisma.verification.deleteMany()
  await prisma.proofClaim.deleteMany()
  await prisma.proof.deleteMany()
  await prisma.claim.deleteMany()
  await prisma.credential.deleteMany()
  await prisma.user.deleteMany()

  // Create demo candidate
  const candidate = await prisma.user.create({
    data: {
      email: "demo@proofshield.io",
      name: "Demo Candidate",
      role: "CANDIDATE",
      password: bcrypt.hashSync("demo1234", 10),
      walletAddress: "0x8f2a7b1c3d9e5f6a8b0c2e4d6f8a0b2c4d6e8f0a",
    },
  })

  // Create demo recruiter
  const recruiter = await prisma.user.create({
    data: {
      email: "recruiter@testcompany.io",
      name: "Alice Recruiter",
      role: "RECRUITER",
      password: bcrypt.hashSync("recruiter1234", 10),
    },
  })

  // Create credentials for candidate
  const cert = await prisma.credential.create({
    data: {
      userId: candidate.id,
      type: "CERTIFICATE",
      title: "AWS Certified Solutions Architect.pdf",
      status: "COMPLETE",
      analyzedAt: new Date(),
    },
  })

  const transcript = await prisma.credential.create({
    data: {
      userId: candidate.id,
      type: "TRANSCRIPT",
      title: "Stanford University Official Transcript.pdf",
      status: "COMPLETE",
      analyzedAt: new Date(),
    },
  })

  const github = await prisma.credential.create({
    data: {
      userId: candidate.id,
      type: "GITHUB_PROFILE",
      title: "github.com/demouser-dev",
      status: "COMPLETE",
      analyzedAt: new Date(),
    },
  })

  // Create claims
  const claims = [
    {
      userId: candidate.id,
      credentialId: cert.id,
      claimType: "CERTIFICATION",
      subject: "AWS Certified Solutions Architect - Associate",
      predicate: "has",
      value: "true",
      commitment: "0xec2f9c3b8a10e4a781b0a1d48c0a23b9cd4b238a9f0e1c2b3d4f5a6b7c8d9e0f",
      isPublic: true,
    },
    {
      userId: candidate.id,
      credentialId: transcript.id,
      claimType: "GPA_THRESHOLD",
      subject: "Cumulative GPA",
      predicate: ">=",
      value: "3.85",
      commitment: "0xac3d2f9c3b8a10e4a781b0a1d48c0a23b9cd4b238a9f0e1c2b3d4f5a6b7c8d9e",
      isPublic: true,
    },
    {
      userId: candidate.id,
      credentialId: github.id,
      claimType: "PROJECT_COUNT",
      subject: "Web Repositories",
      predicate: ">=",
      value: "12",
      commitment: "0xbc3d2f9c3b8a10e4a781b0a1d48c0a23b9cd4b238a9f0e1c2b3d4f5a6b7c8d9e",
      isPublic: true,
    },
    {
      userId: candidate.id,
      credentialId: github.id,
      claimType: "SKILL_PROFICIENCY",
      subject: "TypeScript",
      predicate: ">=",
      value: "Expert",
      commitment: "0xcc3d2f9c3b8a10e4a781b0a1d48c0a23b9cd4b238a9f0e1c2b3d4f5a6b7c8d9e",
      isPublic: true,
    },
    {
      userId: candidate.id,
      credentialId: github.id,
      claimType: "SKILL_PROFICIENCY",
      subject: "React / Next.js",
      predicate: ">=",
      value: "Expert",
      commitment: "0xdc3d2f9c3b8a10e4a781b0a1d48c0a23b9cd4b238a9f0e1c2b3d4f5a6b7c8d9e",
      isPublic: true,
    },
  ]

  for (const c of claims) {
    await prisma.claim.create({ data: c })
  }

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
