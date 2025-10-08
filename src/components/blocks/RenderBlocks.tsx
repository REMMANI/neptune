import React from 'react';
import { PageBlock } from '@/types/cms';
import { resolveComponent } from '@/lib/theme';
import { getCurrentTenant } from '@/lib/tenant';
import { getDealerConfig } from '@/lib/config';
import { SectionsConfig } from '@/types/customization';

interface RenderBlocksProps {
  blocks: PageBlock[];
  className?: string;
  preview?: boolean;
}

interface BlockRendererProps {
  block: PageBlock;
  tenantInfo: Awaited<ReturnType<typeof getCurrentTenant>>;
}

async function BlockRenderer({ block, tenantInfo }: BlockRendererProps) {
  switch (block.type) {
    case 'hero': {
      const HeroComponent = await resolveComponent('Hero', tenantInfo);
      return <HeroComponent block={block} />;
    }

    case 'features': {
      const FeaturesComponent = await resolveComponent('Features', tenantInfo);
      return <FeaturesComponent block={block} />;
    }

    case 'richText': {
      return (
        <section className={`prose max-w-none ${block.className || ''}`}>
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div
              dangerouslySetInnerHTML={{ __html: block.html }}
              className="mx-auto max-w-3xl"
            />
          </div>
        </section>
      );
    }

    case 'gallery': {
      const { title, images, layout } = block;

      const gridClasses = {
        grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
        masonry: 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6',
        carousel: 'flex overflow-x-auto gap-6 pb-4',
      };

      return (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {title && (
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                {title}
              </h2>
            )}
            <div className={gridClasses[layout]}>
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-64 object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-shadow"
                  />
                  {image.caption && (
                    <p className="mt-2 text-sm text-gray-600 text-center">
                      {image.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'testimonial': {
      const { testimonials } = block;

      return (
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    {testimonial.avatar && (
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {testimonial.author}
                      </h4>
                      {testimonial.role && (
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{testimonial.content}</p>
                  {testimonial.rating && (
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < testimonial.rating! ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'contactForm': {
      const { title, description, fields } = block;

      return (
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            {title && (
              <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-gray-600 text-center mb-12">
                {description}
              </p>
            )}
            <form className="space-y-6">
              {fields.map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.id}
                      name={field.id}
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={field.id}
                      name={field.id}
                      required={field.required}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      id={field.id}
                      name={field.id}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="w-full text-white py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Send Message
              </button>
            </form>
          </div>
        </section>
      );
    }

    default: {
      console.warn(`Unknown block type: ${(block as any).type}`);
      return null;
    }
  }
}

export default async function RenderBlocks({
  blocks,
  className = '',
  preview = false
}: RenderBlocksProps) {
  const tenantInfo = await getCurrentTenant();

  // Get dealer configuration for section filtering
  const config = await getDealerConfig(tenantInfo.dealerId, { preview });
  const activatedSections = config.sections;

  // Filter blocks based on activated sections
  const filteredBlocks = blocks.filter((block) => {
    switch (block.type) {
      case 'hero':
        return activatedSections.showHero !== false;
      case 'features':
        return activatedSections.showFeatures !== false;
      case 'testimonial':
        return activatedSections.showTestimonials !== false;
      case 'gallery':
        return activatedSections.showGallery !== false;
      case 'contactForm':
        return activatedSections.showContactForm !== false;
      default:
        return true; // Show richText and other blocks by default
    }
  });

  return (
    <div className={className}>
      {filteredBlocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          tenantInfo={tenantInfo}
        />
      ))}
    </div>
  );
}