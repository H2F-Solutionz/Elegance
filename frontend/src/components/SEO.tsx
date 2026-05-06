import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: 'website' | 'article' | 'product';
  image?: string;
  keywords?: string;
  schema?: Record<string, any>;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Sparkle Bangles | Premium Gold & Silver Jewelry',
  description = 'Discover exquisite 22K gold, silver, and diamond bangles and jewelry at Sparkle Bangles. Shop the latest wedding, casual, and kids collections.',
  canonical,
  type = 'website',
  image = 'https://sparkle-bangles.pages.dev/og-image.jpg', // Placeholder for actual domain
  keywords = 'bangles, gold jewelry, silver bangles, diamond kada, wedding jewelry, kids bangles, 22K gold',
  schema,
}) => {
  const siteName = 'Sparkle Bangles';
  const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
  const url = canonical || 'https://sparkle-bangles.pages.dev';

  // Base Organization Schema
  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    name: siteName,
    description,
    url: 'https://sparkle-bangles.pages.dev',
    logo: `${image}`,
    priceRange: '₹₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Hospital Road',
      addressLocality: 'Jaffna',
      addressRegion: 'Northern Province',
      addressCountry: 'LK',
    },
  };

  const finalSchema = schema || defaultSchema;

  return (
    <Helmet>
      {/* Basic HTML Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {canonical && <link rel="canonical" href={url} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(finalSchema)}
      </script>
    </Helmet>
  );
};

export default SEO;
