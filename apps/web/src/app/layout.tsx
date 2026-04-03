import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { RouteLoading } from '@/components/route-loading';

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
      <body className={inter.className}>
        <RouteLoading />
        {children}
      </body>
    </html>
  );
}
