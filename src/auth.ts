import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db/prisma"
import { authConfig } from "./auth.config"
import bcrypt from "bcryptjs"
import { demoCandidateUser, demoRecruiterUser } from "@/lib/demo-data"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null

        const email = String(credentials.email).trim().toLowerCase()
        const password = String(credentials.password)
        const demoFallback =
          email === demoCandidateUser.email && password === "demo1234"
            ? demoCandidateUser
            : email === demoRecruiterUser.email && password === "recruiter1234"
              ? demoRecruiterUser
              : null

        try {
          const user = await prisma.user.findUnique({ where: { email } })
          if (user?.password) {
            const isMatch = await bcrypt.compare(password, user.password)
            if (isMatch) return { id: user.id, email: user.email, role: user.role } as any
          }
        } catch (error) {
          if (!demoFallback) throw error
        }

        // Vercel’s preview deployment may not have a writable/seeded SQLite file.
        // Keep the advertised demo accounts usable without changing real-user auth.
        if (demoFallback) return demoFallback as any
        return null
      },
    }),
  ],
})
