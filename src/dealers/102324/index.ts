// src/dealers/102324/index.ts
import type { DealerOverrides } from '@/themes/types';

const overrides: DealerOverrides = {
  // optional token/page tweaks too...
  components: {
    Hero: () => import('./components/Hero'),  // ← default export required
  },
};

export default overrides;
