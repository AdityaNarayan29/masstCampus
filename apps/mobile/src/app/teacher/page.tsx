'use client';

import { useState, useEffect } from 'react';

export default function TeacherDashboard() {
  const [userName, setUserName] = useState('Teacher');

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
        <p className="text-muted-foreground">Here's your dashboard</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-card border rounded-lg">
          <h3 className="font-semibold text-lg">0</h3>
          <p className="text-sm text-muted-foreground">Classes</p>
        </div>
        <div className="p-4 bg-card border rounded-lg">
          <h3 className="font-semibold text-lg">0</h3>
          <p className="text-sm text-muted-foreground">Students</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full p-3 text-left border rounded-lg hover:bg-muted transition">
            Mark Attendance
          </button>
          <button className="w-full p-3 text-left border rounded-lg hover:bg-muted transition">
            View Classes
          </button>
          <button className="w-full p-3 text-left border rounded-lg hover:bg-muted transition">
            Create Assignment
          </button>
        </div>
      </div>
    </div>
  );
}
