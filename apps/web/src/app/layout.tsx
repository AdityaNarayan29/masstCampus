import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { RouteLoading } from '@/components/route-loading';
import { PWARegister } from '@/components/pwa-register';
import { MobileNavWrapper } from '@/components/mobile-nav-wrapper';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MasstCampus - School Management',
  description: 'Multi-tenant School Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MasstCampus" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className={inter.className}>
        <PWARegister />
        <PWAInstallPrompt />
        <RouteLoading />
        {children}
        <MobileNavWrapper />
      </body>
    </html>
  );
}
