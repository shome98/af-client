import { GuestGuard } from "@/components/auth/auth-guard"
import { LoginPage } from "@/components/pages/login-page"

export default function Page() {
  return (
    <GuestGuard>
      <LoginPage />
    </GuestGuard>
  )
}
