import { ReactNode } from 'react';

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-slate-900">Masst Campus Admin</h1>
            <div className="flex space-x-4">
              <a href="/super-admin" className="text-sm text-slate-600 hover:text-slate-900">
                Overview
              </a>
              <a href="/super-admin/schools" className="text-sm text-slate-600 hover:text-slate-900">
                Schools
              </a>
              <a href="/super-admin/analytics" className="text-sm text-slate-600 hover:text-slate-900">
                Analytics
              </a>
              <a href="/super-admin/settings" className="text-sm text-slate-600 hover:text-slate-900">
                Settings
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600">Super Admin</span>
          </div>
        </div>
      </nav>
      <main className="container mx-auto py-8 px-6">
        {children}
      </main>
    </div>
  );
}
