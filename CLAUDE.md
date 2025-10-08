# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for faster builds)
- **Production build**: `npm run build` (uses Turbopack)
- **Start production server**: `npm start`
- **Linting**: `npm run lint` (ESLint with Prettier integration)
- **cPanel deployment**: `npm run pack:cpanel` (packages for cPanel deployment)

## Multi-Tenant Architecture

This is a multi-tenant Next.js application that dynamically routes based on subdomains or tenant query parameters:

- **Tenant Resolution**: Middleware extracts tenant from subdomain (e.g., `dealer1.domain.com`) or `?tenant=dealer1` query parameter
- **Configuration**: Each tenant gets dynamic configuration via `/src/app/api/dealers/[id]/site-config/route.ts`
- **Theme System**: Tenants can use different themes (`base`, `t1`) with custom overrides
- **Dealer Overrides**: Specific dealers can have custom components and styling in `/src/dealers/[dealerId]/`

## Key Architecture Components

### Theme System (`/src/themes/`)
- **Base Theme**: Default theme in `/src/themes/base/`
- **Theme Registry**: Defined in `/src/themes/index.ts`
- **Theme Resolution**: `/src/lib/config.ts` handles theme selection and dealer overrides
- **Components**: Each theme has its own component overrides

### Dealer-Specific Customizations (`/src/dealers/`)
- **Manifest**: `/src/dealers/manifest.ts` defines which dealers have custom overrides
- **Structure**: Each dealer directory (e.g., `102324`, `100133`) contains custom components and styling
- **Dynamic Import**: Dealer overrides are lazy-loaded when needed

### Content Blocks (`/src/blocks/`)
- Reusable content components (hero, features, footer)
- Used for dynamic page composition

## Configuration Files

- **Next.js**: Uses standalone output mode with typed routes enabled
- **TypeScript**: Path aliases configured (`@/*` maps to `./src/*`)
- **ESLint**: Configured with Next.js rules, Prettier integration, and unused vars disabled for TypeScript
- **Prettier**: Single quotes, trailing commas, 100 character line width, Tailwind plugin enabled

## Localization

- Internationalization support with locale-based routing (`/src/app/[locale]/`)
- i18n utilities in `/src/lib/i18n.ts`

## API Structure

- **Dealer Config**: `/src/app/api/dealers/[id]/site-config/route.ts` provides tenant-specific configuration
- **SEO**: Dynamic robots.txt and sitemap generation in `/src/app/`

## Development Notes

- Uses Turbopack for faster development and builds
- Husky pre-commit hooks with lint-staged for code quality
- Standalone deployment mode for production
- All images domains allowed in Next.js config (consider restricting for production)