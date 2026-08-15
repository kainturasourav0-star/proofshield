import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register"
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      
      const isStudentRoute = nextUrl.pathname.startsWith('/dashboard') || 
                             nextUrl.pathname.startsWith('/student-dashboard') || 
                             nextUrl.pathname.startsWith('/credentials') || 
                             nextUrl.pathname.startsWith('/passport') || 
                             nextUrl.pathname.startsWith('/proofs') || 
                             nextUrl.pathname.startsWith('/settings') || 
                             nextUrl.pathname.startsWith('/ledger')
      // Note: /verify/[shareToken] (public proof receipts) must stay public —
      // only the recruiter tool at /verify itself requires auth.
      const isRecruiterRoute = nextUrl.pathname.startsWith('/recruiter-dashboard') ||
                               nextUrl.pathname === '/verify' || 
                               nextUrl.pathname.startsWith('/requirements')
      
      if (isStudentRoute || isRecruiterRoute) {
        if (isLoggedIn) return true
        return false // Redirect to pages.signIn
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as any
      }
      return session
    },
  },
  providers: [], // defined in auth.ts
} satisfies NextAuthConfig
