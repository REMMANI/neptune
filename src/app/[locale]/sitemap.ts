import type { MetadataRoute } from 'next';


export default function sitemap(): MetadataRoute.Sitemap {
    return [
        { url: 'http://localhost:3000/en', changeFrequency: 'weekly', priority: 0.7 },
        { url: 'http://localhost:3000/fr', changeFrequency: 'weekly', priority: 0.7 },
    ];
}