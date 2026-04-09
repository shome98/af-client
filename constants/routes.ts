/**
 * Centralized route constants for the application
 * All routes should be defined here and imported from this file
 */

// Public routes (no authentication required)
export const PUBLIC_ROUTES = {
  HOME: '/', // Landing page
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  RESEND_VERIFICATION: '/resend-verification',
  PRICING: '/pricing',
} as const;

// User routes (authentication required) - all prefixed with 'my-'
export const USER_ROUTES = {
  DASHBOARD: '/my-dashboard',
  APIS: '/my-apis',
  API_DETAIL: (id: string) => `/my-apis/${id}`,
  API_TEST: (id: string) => `/my-apis/${id}/test`,
  API_EDIT: (id: string) => `/my-apis/${id}/edit`,
  CREATE_API: '/my-create-api',
  SUBSCRIPTION: '/my-subscription',
  SUBSCRIPTION_CHECKOUT: '/my-subscription/checkout',
  PROFILE: '/my-profile',
} as const;

// Admin routes (admin authentication required) - all prefixed with 'admin-'
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin-controls',
  TIERS: '/admin-controls/tiers',
  DISCOUNTS: '/admin-controls/discounts',
  SUBSCRIPTIONS: '/admin-controls/subscriptions',
  PAYMENTS: '/admin-controls/payments',
} as const;

// API response page (after creating API)
export const API_RESPONSE = '/my-api-response';

// All sidebar routes (for hiding main navbar)
export const SIDEBAR_ROUTES = [
  USER_ROUTES.DASHBOARD,
  USER_ROUTES.APIS,
  USER_ROUTES.CREATE_API,
  USER_ROUTES.SUBSCRIPTION,
  USER_ROUTES.PROFILE,
  ADMIN_ROUTES.DASHBOARD,
];

// Helper to check if a path is a sidebar route
export const isSidebarRoute = (pathname: string): boolean => {
  return SIDEBAR_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );
};

// Navigation items for user sidebar
export const USER_NAV_ITEMS = [
  { title: 'Dashboard', href: USER_ROUTES.DASHBOARD, icon: 'Dashboard' },
  { title: 'My APIs', href: USER_ROUTES.APIS, icon: 'Database' },
  { title: 'Create API', href: USER_ROUTES.CREATE_API, icon: 'AddCircle' },
  {
    title: 'My Subscriptions',
    href: USER_ROUTES.SUBSCRIPTION,
    icon: 'CreditCard',
  },
  { title: 'Pricing', href: PUBLIC_ROUTES.PRICING, icon: 'PriceTag' },
  { title: 'My Profile', href: USER_ROUTES.PROFILE, icon: 'User' },
] as const;

// Navigation items for admin sidebar
export const ADMIN_NAV_ITEMS = [
  {
    title: 'User Controls',
    href: ADMIN_ROUTES.DASHBOARD,
    icon: 'Dashboard',
  },
  { title: 'Tier Management', href: ADMIN_ROUTES.TIERS, icon: 'PriceTag' },
  {
    title: 'Discount Management',
    href: ADMIN_ROUTES.DISCOUNTS,
    icon: 'Coupon',
  },
  {
    title: 'Subscription Management',
    href: ADMIN_ROUTES.SUBSCRIPTIONS,
    icon: 'UserSettings',
  },
  { title: 'Payment Management', href: ADMIN_ROUTES.PAYMENTS, icon: 'Money' },
] as const;
