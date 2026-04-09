import { ProtectedGuard } from '@/components/auth/auth-guard';
import { ApiDetailView } from '@/components/registry/api-detail-view';

interface ApiDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApiDetailPage({ params }: ApiDetailPageProps) {
  const { id } = await params;

  return (
    <ProtectedGuard>
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <ApiDetailView apiId={id} />
      </div>
    </ProtectedGuard>
  );
}
