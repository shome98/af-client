import { ProtectedGuard } from "@/components/auth/auth-guard"
import { ProfilePage } from "@/components/pages/profile-page"

export default function Page() {
  return (
    <ProtectedGuard>
      <ProfilePage />
    </ProtectedGuard>
  )
}
