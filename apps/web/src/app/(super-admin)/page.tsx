import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@school-crm/ui';

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Super Admin Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Manage all schools, view analytics, and configure platform settings
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">0</CardTitle>
            <CardDescription>Total Schools</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">0</CardTitle>
            <CardDescription>Active Students</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">0</CardTitle>
            <CardDescription>Total Teachers</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">₹0</CardTitle>
            <CardDescription>Revenue (This Month)</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Schools</CardTitle>
          <CardDescription>Recently added schools to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">No schools added yet. Add your first school to get started.</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium">
              + Add New School
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium">
              View Platform Analytics
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium">
              Manage Subscriptions
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">API Status</span>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Database</span>
                <span className="text-sm font-medium text-green-600">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Uptime</span>
                <span className="text-sm font-medium text-slate-900">99.9%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
