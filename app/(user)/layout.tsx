import { ProtectedGuard } from '@/components/auth/auth-guard';
import { UserSidebarLayout } from '@/components/layouts/user-sidebar-layout';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedGuard>
      <UserSidebarLayout>{children}</UserSidebarLayout>
    </ProtectedGuard>
  );
}
