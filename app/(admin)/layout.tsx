import { AdminGuard } from '@/components/auth/auth-guard';
import { UserSidebarLayout } from '@/components/layouts/user-sidebar-layout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <UserSidebarLayout>{children}</UserSidebarLayout>
    </AdminGuard>
  );
}
