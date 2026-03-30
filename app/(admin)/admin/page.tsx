import { AdminGuard } from "@/components/auth/auth-guard"
import { AdminPage } from "@/components/pages/admin-page"

export default function Page() {
  return (
    <AdminGuard>
      <AdminPage />
    </AdminGuard>
  )
}
