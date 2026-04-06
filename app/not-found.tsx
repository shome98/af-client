import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { GLOBAL_NOT_FOUND } from '@/constants/not-found.constant';
import { PUBLIC_ROUTES } from '@/constants/routes';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        {GLOBAL_NOT_FOUND.title}
      </h1>
      <p className="text-muted-foreground">{GLOBAL_NOT_FOUND.description}</p>
      <Button asChild>
        <Link href={PUBLIC_ROUTES.HOME}>{GLOBAL_NOT_FOUND.cta}</Link>
      </Button>
    </div>
  );
}

