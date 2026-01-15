import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'School CRM Mobile',
  description: 'Mobile app for teachers and parents',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="true" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="School CRM" />
      </head>
      <body className="bg-background text-foreground">
        <div className="flex flex-col min-h-screen safe-area-inset">
          {children}
        </div>
      </body>
    </html>
  );
}
