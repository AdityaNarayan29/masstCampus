'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check for user role and redirect to appropriate route
    const userRole = localStorage.getItem('user_role');

    if (userRole === 'teacher') {
      router.push('/teacher');
    } else if (userRole === 'parent') {
      router.push('/parent');
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}
