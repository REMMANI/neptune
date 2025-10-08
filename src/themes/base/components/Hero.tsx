import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeroBlock } from '@/types/cms';

interface HeroProps {
  block: HeroBlock;
  className?: string;
}

export default function Hero({ block, className = '' }: HeroProps) {
  const { title, subtitle, image, ctaText, ctaLink, backgroundType } = block;

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Background */}
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
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-100">
              {subtitle}
            </p>
          )}
          {ctaText && ctaLink && (
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href={ctaLink}
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
              >
                {ctaText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
