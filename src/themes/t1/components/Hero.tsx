import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeroBlock } from '@/types/cms';

interface HeroProps {
  block: HeroBlock;
  className?: string;
}

export default function T1Hero({ block, className = '' }: HeroProps) {
  const { title, subtitle, image, ctaText, ctaLink, backgroundType } = block;

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Background with red accent */}
      {image && (
        <div className="absolute inset-0 z-0">
          {backgroundType === 'video' ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            >
              <source src={image} type="video/mp4" />
            </video>
          ) : (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/60 to-black/40" />
        </div>
      )}

      {/* Content with red theme */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-32 sm:px-6 sm:py-40 lg:px-8">
        <div className="text-center">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-sm font-medium text-red-100 bg-red-600/20 rounded-full border border-red-500/30">
              Premium Automotive Experience
            </span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
            <span className="block">{title.split(' ')[0]}</span>
            <span className="block text-red-400">
              {title.split(' ').slice(1).join(' ')}
            </span>
          </h1>
          {subtitle && (
            <p className="mx-auto mt-8 max-w-3xl text-xl leading-8 text-gray-100">
              {subtitle}
            </p>
          )}
          {ctaText && ctaLink && (
            <div className="mt-12 flex items-center justify-center gap-x-6">
              <Link
                href={ctaLink}
                className="group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-red-700 px-8 py-4 text-base font-semibold text-white shadow-xl hover:from-red-700 hover:to-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-all duration-300 transform hover:scale-105"
              >
                {ctaText}
                <svg
                  className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-red-900/10 to-transparent" />
    </section>
  );
}
