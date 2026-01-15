'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem('user_role');
    if (userRole !== 'parent') {
      router.push('/auth/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-card">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Parent Portal</h1>
          <button
            onClick={() => {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_role');
              router.push('/auth/login');
            }}
            className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded-md"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-card">
        <div className="flex justify-around">
          <a
            href="/parent"
            className="flex-1 py-3 text-center border-r text-sm font-medium text-primary"
          >
            Home
          </a>
          <a
            href="/parent/children"
            className="flex-1 py-3 text-center border-r text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Children
          </a>
          <a
            href="/parent/attendance"
            className="flex-1 py-3 text-center border-r text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Attendance
          </a>
          <a
            href="/parent/profile"
            className="flex-1 py-3 text-center text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Profile
          </a>
        </div>
      </nav>
    </div>
  );
}
