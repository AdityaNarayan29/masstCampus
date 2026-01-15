import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { headers } from 'next/headers';
import { getTenantByHost, getHostFromHeaders } from '@/lib/tenant';
import { ThemeProvider } from '@school-crm/ui';
import { defaultTheme } from '@school-crm/config';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'School CRM',
  description: 'Multi-tenant School Management System',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const host = getHostFromHeaders(headersList);

  // Resolve tenant from host
  const tenant = await getTenantByHost(host);
  const theme = tenant?.theme || defaultTheme;

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={theme as any}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
