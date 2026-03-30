import { ProtectedGuard } from "@/components/auth/auth-guard"
import { DashboardPage } from "@/components/pages/dashboard-page"

export default function Page() {
  return (
    <ProtectedGuard>
      <DashboardPage />
    </ProtectedGuard>
  )
}
