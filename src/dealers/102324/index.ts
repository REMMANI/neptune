import type { DealerOverrides } from '@/themes/types';

const overrides: DealerOverrides = {
  components: {
    Nav: () => import('./components/Nav'),
    Hero: () => import('./components/Hero'),
  },
};

export default overrides;
