import { headers } from 'next/headers';
import { getTenantByHost, getHostFromHeaders } from '@/lib/tenant';
import { Header, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@school-crm/ui';
import Link from 'next/link';

export default async function HomePage() {
  const headersList = headers();
  const host = getHostFromHeaders(headersList);
  const tenant = await getTenantByHost(host);

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Tenant Not Found</CardTitle>
            <CardDescription>
              No tenant configuration found for: {host}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please check your domain configuration or contact support.
            </p>
          </CardContent>
        </Card>
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
        <Link href="/dashboard" className="text-sm hover:underline">
          Dashboard
        </Link>
        <Link href="/login" className="text-sm hover:underline">
          Login
        </Link>
      </Header>

      <main className="container mx-auto py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome to {tenant.name}
            </h1>
            <p className="text-muted-foreground">
              Multi-tenant School Management System
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>
                  Manage student enrollments, grades, and records
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fee Management</CardTitle>
                <CardDescription>
                  Track payments, fees, and commission structures
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance</CardTitle>
                <CardDescription>
                  Monitor student and staff attendance
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tenant Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="font-medium">Tenant ID:</dt>
                  <dd className="text-muted-foreground">{tenant.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium">Domain:</dt>
                  <dd className="text-muted-foreground">
                    {tenant.primaryDomain || tenant.subdomain}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium">Locale:</dt>
                  <dd className="text-muted-foreground">{tenant.config?.locale}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium">Currency:</dt>
                  <dd className="text-muted-foreground">{tenant.config?.currency}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
