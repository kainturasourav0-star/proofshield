import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardRedirectPage() {
  const session = await auth()
  if (!session || !session.user) {
    redirect("/auth/login")
  }

  if (session.user.role === "RECRUITER" || session.user.role === "ADMIN") {
    redirect("/recruiter-dashboard")
  } else {
    redirect("/student-dashboard")
  }
}
