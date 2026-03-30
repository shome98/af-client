import { GuestGuard } from "@/components/auth/auth-guard"
import { RegisterPage } from "@/components/pages/register-page"

export default function Page() {
  return (
    <GuestGuard>
      <RegisterPage />
    </GuestGuard>
  )
}
