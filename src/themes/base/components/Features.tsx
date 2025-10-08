import React from 'react';
import { FeaturesBlock } from '@/types/cms';

// Simple SVG icons to replace heroicons
const CheckCircleIcon = (props: any) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UsersIcon = (props: any) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const CurrencyDollarIcon = (props: any) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

interface FeaturesProps {
  block: FeaturesBlock;
  className?: string;
}

const iconMap = {
  'check-circle': CheckCircleIcon,
  'users': UsersIcon,
  'dollar-sign': CurrencyDollarIcon,
};

export default function Features({ block, className = '' }: FeaturesProps) {
  const { title, description, items } = block;

  return (
    <section className={`py-24 sm:py-32 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          {title && (
            <h2 className="text-base font-semibold leading-7 text-blue-600">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {description}
            </p>
          )}
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {items.map((item) => {
              const IconComponent = item.icon && iconMap[item.icon as keyof typeof iconMap];

              return (
                <div key={item.id} className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                      {IconComponent ? (
                        <IconComponent className="h-6 w-6 text-white" aria-hidden="true" />
                      ) : (
                        <div className="h-6 w-6 bg-white rounded" />
                      )}
                    </div>
                    {item.title}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">
                    {item.description}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}