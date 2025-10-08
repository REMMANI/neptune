import React from 'react';
import Link from 'next/link';
import { Locale, t } from '@/lib/i18n';

interface FooterProps {
  locale: Locale;
  dealerId: string;
  className?: string;
}

export default function Footer({ locale, dealerId, className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const navigation = {
    main: [
      { name: t('nav.home', locale), href: `/${locale}` },
      { name: t('nav.inventory', locale), href: `/${locale}/inventory` },
      { name: t('nav.about', locale), href: `/${locale}/about` },
      { name: t('nav.contact', locale), href: `/${locale}/contact` },
    ],
    social: [
      {
        name: 'Facebook',
        href: '#',
        icon: (props: any) => (
          <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path
              fillRule="evenodd"
              d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
      {
        name: 'Instagram',
        href: '#',
        icon: (props: any) => (
          <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path
              fillRule="evenodd"
              d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.316-1.296C4.165 14.81 3.662 13.628 3.662 12.3c0-1.297.503-2.448 1.296-3.316C5.826 8.116 7.007 7.613 8.335 7.613c1.297 0 2.448.503 3.316 1.296.867.868 1.37 2.049 1.37 3.377 0 1.297-.503 2.448-1.37 3.316-.868.867-2.049 1.37-3.377 1.37z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
      {
        name: 'Twitter',
        href: '#',
        icon: (props: any) => (
          <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
          </svg>
        ),
      },
    ],
  };

  return (
    <footer className={`bg-gray-900 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          {navigation.social.map((item) => (
            <a key={item.name} href={item.href} className="text-gray-400 hover:text-gray-300">
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <div className="flex justify-center space-x-6 md:justify-start">
            {navigation.main.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm leading-6 text-gray-400 hover:text-gray-300"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-gray-400 text-center md:text-left">
            &copy; {currentYear} Dealership CMS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}