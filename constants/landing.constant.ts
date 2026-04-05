// ─────────────────────────────────────────────────────────────────────────────
// App-wide constants — all hardcoded copy lives here
// ─────────────────────────────────────────────────────────────────────────────

export const publicUrls = {
  docs: 'https://docs.crudfactory.dev',
  github: 'https://github.com/crudfactory',
  support: 'support@crudfactory.dev',
};

export const APP = {
  name: 'Own API',
  subName:'API Factory',
  tagline: 'Spin up REST APIs in seconds — no boilerplate, no hassle.',
  shortDesc: 'Instant, configurable REST APIs.',
  meta_description:'Spin up rest apis in minutes.',
  logoSuffix: ' · ', // sits between logo name and tier badge
  version: 'v1',
  supportEmail: publicUrls.support,
  docsUrl: publicUrls.docs,
  githubUrl: publicUrls.github,
} as const;

export const LANDING = {
  hero: {
    headline: 'Instant REST APIs,\nwithout the boilerplate.',
    subheadline:
      'Define your schema, choose your permissions, and get a fully functional CRUD API with authentication — live in under a minute.',
    ctaPrimary: 'Start for free',
    ctaSecondary: 'See how it works',
  },
  features: {
    title: "Everything you need, nothing you don't",
    subtitle:
      'Built for developers who want production-ready APIs without writing the same CRUD code every project.',
    items: [
      {
        icon: '⚡',
        title: 'Instant provisioning',
        desc: 'Your API is live the moment you save. No deploy steps, no waiting.',
      },
      {
        icon: '🔒',
        title: 'API key authentication',
        desc: 'Every API is secured by a unique key. Regenerate anytime from your dashboard.',
      },
      {
        icon: '🗂️',
        title: 'Flexible schema builder',
        desc: 'Define fields with types, validations, enums, defaults and relations — visually.',
      },
      {
        icon: '🔍',
        title: 'Query & search',
        desc: 'MCRUDQ and SCRUDQ permissions unlock full filtering, sorting and full-text search.',
      },
      {
        icon: '🗑️',
        title: 'Soft delete support',
        desc: 'Enable soft delete per API — records are flagged isDeleted instead of destroyed.',
      },
      {
        icon: '📄',
        title: 'Optional Swagger docs',
        desc: 'Enable docs access on any API and share the Swagger UI with your team.',
      },
    ],
  },
  pricing: {
    title: 'Simple, transparent pricing',
    subtitle: 'Start for free. Upgrade when you need more power.',
    freeTierNote: 'No credit card required to get started.',
    ctaFree: 'Get started free',
    ctaPaid: 'Upgrade now',
    ctaCurrent: 'Current plan',
    tiers: [
      {
        name: 'Free',
        price: '$0',
        period: '/month',
        description:
          'Perfect for exploring the platform and launching your first API project.',
        badge: 'For starters',
        cta: 'Get started free',
        isHighlighted: false,
        features: [
          '1 active project',
          'Up to 3 API resources',
          'Community support',
          'Basic usage analytics',
        ],
      },
      {
        name: 'Basic',
        price: '$19',
        period: '/month',
        description:
          'A strong fit for freelancers and growing teams building client-ready APIs.',
        badge: 'Most popular',
        cta: 'Choose Basic',
        isHighlighted: false,
        features: [
          '5 active projects',
          'Unlimited API resources',
          'Email support',
          'Role-based access control',
        ],
      },
      {
        name: 'Pro',
        price: '$49',
        period: '/month',
        description:
          'Built for teams that need higher limits, deeper control, and faster support.',
        badge: 'Scale faster',
        cta: 'Choose Pro',
        isHighlighted: true,
        features: [
          'Unlimited projects',
          'Advanced audit logs',
          'Priority support',
          'Custom environments',
        ],
      },
    ],
  },
  footer: {
    copy: `© ${new Date().getFullYear()} CrudFactory. Built for builders.`,
    links: [
      { label: 'Docs', href: publicUrls.docs },
      { label: 'GitHub', href: publicUrls.github },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
} as const;
