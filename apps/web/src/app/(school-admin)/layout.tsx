import { ReactNode } from 'react';
import { headers } from 'next/headers';
import { getTenantByHost, getHostFromHeaders } from '@/lib/tenant';
import { Header } from '@school-crm/ui';
import Link from 'next/link';

export default async function SchoolAdminLayout({ children }: { children: ReactNode }) {
  const headersList = headers();
  const host = getHostFromHeaders(headersList);
  const tenant = await getTenantByHost(host);

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Tenant Not Found</h1>
          <p className="text-slate-600">No tenant configuration found for: {host}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        tenantTheme={tenant.theme as any}
        logo={tenant.theme?.logo}
        tenantName={tenant.name}
      >
        <Link href="/school-admin" className="text-sm hover:underline">
          Dashboard
        </Link>
        <Link href="/school-admin/students" className="text-sm hover:underline">
          Students
        </Link>
        <Link href="/school-admin/teachers" className="text-sm hover:underline">
          Teachers
        </Link>
        <Link href="/school-admin/attendance" className="text-sm hover:underline">
          Attendance
        </Link>
        <Link href="/school-admin/fees" className="text-sm hover:underline">
          Fees
        </Link>
        <Link href="/school-admin/notifications" className="text-sm hover:underline">
          Notifications
        </Link>
      </Header>
      <main className="container mx-auto py-8 px-6">
        {children}
      </main>
    </div>
  );
}
