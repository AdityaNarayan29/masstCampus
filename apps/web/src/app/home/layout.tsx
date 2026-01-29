import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://masstcampus.com'),
  title: 'Masst Campus - Modern School Management System for Indian Schools',
  description: 'The all-in-one school management platform for attendance, fee collection, parent communication, and analytics. Built for Indian schools, 70% cheaper than competitors. Start your free trial today.',
  keywords: [
    'school management system',
    'school ERP',
    'attendance management',
    'fee management software',
    'parent communication app',
    'school analytics',
    'education technology',
    'edtech India',
    'school administration software',
    'student management system',
    'coaching management',
    'tuition management software',
  ],
  authors: [{ name: 'Masst Campus', url: 'https://masstcampus.com' }],
  creator: 'Masst Campus',
  publisher: 'hey.school',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://masstcampus.com',
    siteName: 'Masst Campus',
    title: 'Masst Campus - School Management Made Simple',
    description: 'The all-in-one platform for attendance, fees, communication, and analytics. Built for Indian schools, priced for everyone.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Masst Campus - Modern School Management System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Masst Campus - Modern School Management System',
    description: 'The all-in-one platform for attendance, fees, communication, and analytics. Built for Indian schools.',
    images: ['/og-image.png'],
    creator: '@masstcampus',
  },
  alternates: {
    canonical: 'https://masstcampus.com',
  },
  category: 'Education Technology',
};

// JSON-LD structured data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Masst Campus',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'Modern school management system for attendance, fees, and parent communication',
  offers: {
    '@type': 'Offer',
    price: '20',
    priceCurrency: 'INR',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: '20',
      priceCurrency: 'INR',
      unitText: 'per student per year',
    },
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '150',
  },
  provider: {
    '@type': 'Organization',
    name: 'hey.school',
    url: 'https://masstcampus.com',
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
