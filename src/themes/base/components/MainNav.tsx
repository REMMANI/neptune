import React from 'react';
import Link from 'next/link';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { MenuItem } from '@/types/cms';
import { Locale } from '@/lib/i18n';

interface MainNavProps {
  menu: MenuItem[];
  locale: Locale;
  className?: string;
}

export default function MainNav({ menu, locale, className = '' }: MainNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const href = item.href || `/${locale}/${item.slug || ''}`;

    if (item.children && item.children.length > 0) {
      return (
        <div key={item.id} className="relative group">
          <Link
            href={href}
            className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
            target={item.target}
          >
            {item.label}
          </Link>
          <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            <div className="py-1">
              {item.children.map((child) => (
                <Link
                  key={child.id}
                  href={child.href || `/${locale}/${child.slug || ''}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  target={child.target}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={href}
        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
        target={item.target}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <nav className={`bg-white shadow ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href={`/${locale}`} className="text-xl font-bold text-gray-900">
                Dealership
              </Link>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            {menu
              .sort((a, b) => a.order - b.order)
              .map((item) => renderMenuItem(item))}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            {menu
              .sort((a, b) => a.order - b.order)
              .map((item) => {
                const href = item.href || `/${locale}/${item.slug || ''}`;
                return (
                  <div key={item.id}>
                    <Link
                      href={href}
                      className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                      target={item.target}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {item.children && item.children.length > 0 && (
                      <div className="pl-6">
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            href={child.href || `/${locale}/${child.slug || ''}`}
                            className="block py-2 text-sm text-gray-500 hover:text-gray-700"
                            target={child.target}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </nav>
  );
}