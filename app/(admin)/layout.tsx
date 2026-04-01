import { AdminGuard } from '@/components/auth/auth-guard';
import { AdminSidebarLayout } from '@/components/layouts/admin-sidebar-layout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminSidebarLayout>{children}</AdminSidebarLayout>
    </AdminGuard>
  );
}
