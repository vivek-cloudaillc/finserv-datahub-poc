export interface Tenant {
  id: string;
  name: string;
  type: string;
}

/**
 * Single demo tenant.
 * The Hub is multi-tenant by design (account-per-tenant for Tier-1 customers,
 * pooled-with-isolation for fintechs), but the demo runs with one reference
 * customer so the audience focuses on the data, not the chooser.
 */
export const tenants: Tenant[] = [
  {
    id: 't_meridian',
    name: 'Meridian Financial Group',
    type: 'Multi-line FSI · reference customer ($80B AUM)',
  },
];
