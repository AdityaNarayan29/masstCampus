import { headers } from 'next/headers';
import { getTenantByHost, getHostFromHeaders } from '@/lib/tenant';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@school-crm/ui';

export default async function SchoolAdminDashboard() {
  const headersList = headers();
  const host = getHostFromHeaders(headersList);
  const tenant = await getTenantByHost(host);

  if (!tenant) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome to {tenant.name}</h1>
        <p className="text-muted-foreground mt-2">
          School Management Dashboard
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">0</CardTitle>
            <CardDescription>Total Students</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">0</CardTitle>
            <CardDescription>Active Teachers</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">0%</CardTitle>
            <CardDescription>Today's Attendance</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">₹0</CardTitle>
            <CardDescription>Pending Fees</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium">
              Mark Attendance
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium">
              Add Student
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium">
              Send Notification
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium">
              View Fee Reports
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">No recent activity</p>
          </CardContent>
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
  );
}
