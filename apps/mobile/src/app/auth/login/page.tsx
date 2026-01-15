'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
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

      const data = await response.json();

      // Store token and user role
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_role', data.user.role);

      // Route based on role
      if (data.user.role === 'teacher') {
        router.push('/teacher');
      } else if (data.user.role === 'parent') {
        router.push('/parent');
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
    </div>
  );
}
