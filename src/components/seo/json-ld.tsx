export function JsonLd({
  type,
  data,
}: {
  type: 'LocalBusiness' | 'Product' | 'BreadcrumbList';
  data: Record<string, unknown>;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ProductJsonLd({
  name,
  description,
  image,
  price,
  currency = 'BRL',
  availability,
  brand,
  url,
}: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  availability: 'InStock' | 'OutOfStock';
  brand: string;
  url: string;
}) {
  return (
    <JsonLd
      type="Product"
      data={{
        name,
        description,
        image,
        brand: { '@type': 'Brand', name: brand },
        offers: {
          '@type': 'Offer',
          price: price.toFixed(2),
          priceCurrency: currency,
          availability: `https://schema.org/${availability}`,
          url,
        },
      }}
    />
  );
}
