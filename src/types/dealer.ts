import { z } from 'zod';

export const DealerSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  domain: z.string().nullable(),
  subdomain: z.string().nullable(),
  themeKey: z.string().default('base'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Dealer = z.infer<typeof DealerSchema>;