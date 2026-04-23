import { PUBLIC_ROUTES } from '@/constants/routes';

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalPageContent = {
  eyebrow: string;
  title: string;
  summary: string;
  sections: LegalSection[];
};

export const LEGAL_PAGES: Record<'about' | 'privacy' | 'disclaimer', LegalPageContent> = {
  about: {
    eyebrow: 'About API Factory',
    title: 'Accelerated Backend Engineering for Modern Teams',
    summary:
      'API Factory is an automated Backend-as-a-Service designed to remove the overhead of manual database provisioning and CRUD boilerplate.',
    sections: [
      {
        heading: 'Why teams use it',
        paragraphs: [
          'Whether you are an individual developer launching a public application or an internal engineering team building a rapid prototyping environment, API Factory provides a secure, multi-tenant infrastructure that scales with your needs.',
        ],
      },
      {
        heading: 'The architecture of isolation',
        paragraphs: [
          'Unlike standard shared database environments, API Factory treats every API as a distinct security entity.',
          'Even for the same user, every provisioned API is isolated with its own unique authentication credentials, ensuring that a compromise in one development environment never spills over into another.',
        ],
      },
    ],
  },
  privacy: {
    eyebrow: 'Data Privacy Policy',
    title: 'Commitment to Data Integrity and Security',
    summary:
      'We employ a multi-tenant architecture designed around the principle of maximum isolation.',
    sections: [
      {
        heading: 'Credential per API',
        paragraphs: [
          'Every API instance generated through the platform is assigned unique, cryptographically secure authentication credentials. This ensures strict data segregation between your projects and other users on the platform.',
        ],
      },
      {
        heading: 'Data retention and recovery',
        bullets: [
          'Active period: Data remains accessible for the duration of your API lifecycle.',
          'Grace period: After an API expires or is deleted, the data enters a 30-day dormant state and is preserved but inaccessible through the public API.',
          'Manual recovery: During the 30-day window, users may request a data export by contacting support via email. Data acquisition services may incur a processing fee based on the total volume and complexity of the dataset being recovered.',
          'Permanent erasure: After the 30-day grace period, data is permanently purged from our storage systems and cannot be recovered.',
        ],
      },
    ],
  },
  disclaimer: {
    eyebrow: 'Disclaimer and Terms of Use',
    title: 'Usage and Liability Notice',
    summary:
      'API Factory is provided as-is for internal development and public-facing commercial applications.',
    sections: [
      {
        heading: 'Service expectations',
        bullets: [
          'Purpose of service: The platform is designed for dynamic, often temporary, data environments while still maintaining high availability.',
          'Data acquisition fees: We provide a manual recovery path for expired data for 30 days, but we reserve the right to charge for the engineering resources required to extract and deliver those datasets, with costs scaling based on data size.',
          'Security responsibility: Users are responsible for securely managing the unique API keys provided at the time of creation. Because credentials are unique per API, the loss of a specific key limits access only to that specific instance.',
          'No implicit longevity: Unless a permanent tier is explicitly selected, APIs are considered ephemeral. Users should not use temporary endpoints for primary, long-term storage of critical data without an external backup strategy.',
        ],
      },
    ],
  },
};

export const LEGAL_FOOTER_LINKS = [
  { label: 'Data Privacy Policy', href: PUBLIC_ROUTES.PRIVACY },
  { label: 'Disclaimer & Terms', href: PUBLIC_ROUTES.DISCLAIMER },
] as const;
