'use client';

import { useState, useEffect } from 'react';

export default function ParentDashboard() {
  const [userName, setUserName] = useState('Parent');

  useEffect(() => {
    // TODO: Fetch user data from API
    const name = localStorage.getItem('user_name');
    if (name) {
      setUserName(name);
    }
  }, []);

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Welcome, {userName}!</h2>
        <p className="text-muted-foreground">Monitor your child's progress</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-card border rounded-lg">
          <h3 className="font-semibold text-lg">0</h3>
          <p className="text-sm text-muted-foreground">Children</p>
        </div>
        <div className="p-4 bg-card border rounded-lg">
          <h3 className="font-semibold text-lg">0%</h3>
          <p className="text-sm text-muted-foreground">Avg. Attendance</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Recent Updates</h3>
        <div className="space-y-2">
          <div className="p-3 bg-card border rounded-lg">
            <p className="text-sm font-medium">No updates yet</p>
            <p className="text-xs text-muted-foreground">Check back later</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Quick Links</h3>
        <div className="space-y-2">
          <button className="w-full p-3 text-left border rounded-lg hover:bg-muted transition">
            View Child Performance
          </button>
          <button className="w-full p-3 text-left border rounded-lg hover:bg-muted transition">
            Attendance Report
          </button>
          <button className="w-full p-3 text-left border rounded-lg hover:bg-muted transition">
            Contact Teacher
          </button>
        </div>
      </div>
    </div>
  );
}
