'use client';

import { useState, FormEvent } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/backend/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const result = await response.json();

      // Handle both wrapped and unwrapped response formats
      const data = result.data || result;

      // Store token and user role in cookies (for middleware) and localStorage (for client)
      const role = data.user.role.toLowerCase();
      document.cookie = `auth_token=${data.accessToken}; path=/; max-age=604800`; // 7 days
      document.cookie = `user_role=${role}; path=/; max-age=604800`;
      localStorage.setItem('auth_token', data.accessToken);
      localStorage.setItem('user_role', role);

      // Route based on role
      if (role === 'teacher') {
        window.location.href = '/teacher';
      } else if (role === 'parent') {
        window.location.href = '/parent';
      } else if (role === 'admin') {
        window.location.href = '/teacher'; // Admin can access teacher dashboard for now
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <p className="text-muted-foreground">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Don't have an account?{' '}
          <a href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-sm font-medium text-center mb-3">Demo Credentials</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center p-2 bg-background rounded border">
            <div>
              <p className="font-medium">Teacher</p>
              <p className="text-muted-foreground text-xs">teacher@vidyamandir.com / teacher123</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('teacher@vidyamandir.com');
                setPassword('teacher123');
              }}
              className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20"
            >
              Use
            </button>
          </div>
          <div className="flex justify-between items-center p-2 bg-background rounded border">
            <div>
              <p className="font-medium">Admin</p>
              <p className="text-muted-foreground text-xs">admin@vidyamandir.com / admin123</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@vidyamandir.com');
                setPassword('admin123');
              }}
              className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20"
            >
              Use
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
