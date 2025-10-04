import saas from './saas';
import clinic from './clinic';
import portfolio from './portfolio';


export const TEMPLATE_REGISTRY = {
    saas,
    clinic,
    portfolio,
    // add more templates here (10+)
};
export type TemplateKey = keyof typeof TEMPLATE_REGISTRY;