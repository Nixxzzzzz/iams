/**
 * Portal Site & Metadata Configuration
 * Source of Truth: docs/PRODUCT_REQUIREMENTS.md, docs/UI_UX_GUIDELINES.md
 */

export const siteConfig = {
  name: 'Asset Management Portal',
  description: 'Enterprise IT & Institutional Asset Management System',
  version: '1.0.0',
  organization: {
    name: 'Institutional Operations',
    department: 'IT Infrastructure & Logistics',
  },
  links: {
    docs: '/docs',
    support: '/support',
  },
} as const;
