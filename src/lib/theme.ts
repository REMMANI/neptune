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

  // Shadowing priority:
  // 1. dealers/<dealerId>/components/<Component>
  // 2. themes/<themeKey>/components/<Component>
  // 3. themes/base/components/<Component>

  const possiblePaths = [
    `@/dealers/${dealerId}/components/${name}`,
    `@/themes/${themeKey}/components/${name}`,
    `@/themes/base/components/${name}`,
  ];

  for (const path of possiblePaths) {
    try {
      const module: ComponentModule = await import(path);
      const Component = module.default;
      componentCache.set(cacheKey, Component);
      return Component;
    } catch (error) {
      // Continue to next path
      continue;
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