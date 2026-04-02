import { ProtectedGuard } from '@/components/auth/auth-guard';
import { ApiTester } from '@/components/api-tester/api-tester';

interface ApiTestPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApiTestPage({ params }: ApiTestPageProps) {
  const { id } = await params;

  return (
    <ProtectedGuard>
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <ApiTester apiId={id} />
      </div>
    </ProtectedGuard>
  );
}
