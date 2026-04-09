import { ProtectedGuard } from '@/components/auth/auth-guard';
import { ApiEditForm } from '@/components/registry/api-edit-form';

interface ApiEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApiEditPage({ params }: ApiEditPageProps) {
  const { id } = await params;

  return (
    <ProtectedGuard>
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <ApiEditForm apiId={id} />
      </div>
    </ProtectedGuard>
  );
}
