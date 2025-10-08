
import type { DealerOverrides } from '@/themes/types';

const overrides: DealerOverrides = {
  
  components: {
    Hero: () => import('./components/Hero'),  
  },
};

export default overrides;
