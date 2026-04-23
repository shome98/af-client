import type { Metadata } from 'next';

import { LegalPage } from '@/components/legal/legal-page';
import { APP } from '@/constants/landing.constant';
import { LEGAL_PAGES } from '@/constants/legal.constant';

const page = LEGAL_PAGES.disclaimer;

export const metadata: Metadata = {
  title: `${page.title} | ${APP.name}`,
  description: page.summary,
};

export default function DisclaimerPage() {
  return <LegalPage page={page} />;
}
