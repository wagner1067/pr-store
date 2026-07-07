import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://prstore.vercel.app';

  try {
    const products = await db.produto.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    const productUrls = products.map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: p.updatedAt,
    }));

    const staticUrls = ['', '/admin/login'].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
    }));

    return [...staticUrls, ...productUrls];
  } catch {
    // Fallback if db query fails during build
    return [
      { url: baseUrl, lastModified: new Date() },
      { url: `${baseUrl}/admin/login`, lastModified: new Date() },
    ];
  }
}
