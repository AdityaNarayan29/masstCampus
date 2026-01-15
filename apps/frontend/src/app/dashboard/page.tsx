'use client';

import { useEffect, useState } from 'react';
import { Header, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@school-crm/ui';
import apiClient from '@/lib/api';

export default function DashboardPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await apiClient.get('/students');
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header tenantName="Dashboard">
        <span className="text-sm">Welcome back!</span>
      </Header>

      <main className="container mx-auto py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your school management system
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {students.length}
                </CardTitle>
                <CardDescription>Total Students</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">0</CardTitle>
                <CardDescription>Pending Fees</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">0</CardTitle>
                <CardDescription>Active Brokers</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">$0</CardTitle>
                <CardDescription>Commission Earned</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Students</CardTitle>
              <CardDescription>Latest student enrollments</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : students.length === 0 ? (
                <p className="text-sm text-muted-foreground">No students found</p>
              ) : (
                <div className="space-y-2">
                  {students.slice(0, 5).map((student) => (
                    <div
                      key={student.id}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {student.enrollmentNumber} • Grade {student.gradeLevel}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
