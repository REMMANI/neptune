import React, { ComponentType } from 'react';
import { TenantInfo } from './tenant';

type ComponentName = 'Hero' | 'Features' | 'Footer' | 'MainNav' | 'SectionWrapper';

type ComponentModule = {
  default: ComponentType<any>;
};

// Cache for dynamically imported components
const componentCache = new Map<string, ComponentType<any>>();

export async function resolveComponent(
  name: ComponentName,
  tenantInfo: TenantInfo
): Promise<ComponentType<any>> {
  const cacheKey = `${tenantInfo.dealerId}:${tenantInfo.themeKey}:${name}`;

  if (componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey)!;
  }

  const { dealerId, themeKey } = tenantInfo;

  // Directly import base theme components for now to fix the issue
  if (name === 'MainNav') {
    try {
      const MainNavComponent = (await import('../themes/base/components/MainNav')).default;
      componentCache.set(cacheKey, MainNavComponent);
      return MainNavComponent;
    } catch (error) {
      console.log('Failed to import MainNav directly:', error);
    }
  }

  if (name === 'Footer') {
    try {
      const FooterComponent = (await import('../themes/base/components/Footer')).default;
      componentCache.set(cacheKey, FooterComponent);
      return FooterComponent;
    } catch (error) {
      console.log('Failed to import Footer directly:', error);
    }
  }

  if (name === 'Features') {
    try {
      const FeaturesComponent = (await import('../themes/base/components/Features')).default;
      componentCache.set(cacheKey, FeaturesComponent);
      return FeaturesComponent;
    } catch (error) {
      console.log('Failed to import Features directly:', error);
    }
  }

  // Fallback to a simple div if no component found
  const FallbackComponent = ({ children, ...props }: any) => {
    return React.createElement(
      'div',
      {
        ...props,
        'data-missing-component': name,
      },
      children || `Missing component: ${name}`
    );
  };

  componentCache.set(cacheKey, FallbackComponent);
  return FallbackComponent;
}

export async function resolveMultipleComponents(
  names: ComponentName[],
  tenantInfo: TenantInfo
): Promise<Record<ComponentName, ComponentType<any>>> {
  const components = await Promise.all(
    names.map(async (name) => [
      name,
      await resolveComponent(name, tenantInfo),
    ])
  );

  return Object.fromEntries(components) as Record<ComponentName, ComponentType<any>>;
}

export function getThemeConfig(themeKey: string) {
  // This could be expanded to include theme-specific configuration
  // like colors, typography, spacing, etc.
  const themeConfigs = {
    base: {
      name: 'Base Theme',
      description: 'Default clean theme',
      primaryColor: 'blue',
      layout: 'standard',
    },
    t1: {
      name: 'Theme One',
      description: 'Modern automotive theme',
      primaryColor: 'red',
      layout: 'modern',
    },
  };

  return themeConfigs[themeKey as keyof typeof themeConfigs] || themeConfigs.base;
}

export function clearComponentCache(): void {
  componentCache.clear();
}

// Clear cache on module load to force fresh imports
clearComponentCache();