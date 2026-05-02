'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLogin } from '@/hooks/useApi';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [projectSlug, setProjectSlug] = useState('');
  const [error, setError] = useState('');
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await loginMutation.mutateAsync({ email, projectSlug });
      router.push(`/projects/${projectSlug}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            AI Assistant
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Multi-tenant chat with MongoDB config-driven dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email address"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="projectSlug" className="sr-only">
                Project Slug
              </label>
              <input
                id="projectSlug"
                type="text"
                value={projectSlug}
                onChange={(e) => setProjectSlug(e.target.value)}
                required
                placeholder="Project slug"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500 space-y-1">
            <p>Demo: Try email@example.com with project slug "demo"</p>
            <p className="text-xs">Users are auto-created on first login</p>
          </div>
        </form>
      </div>
    </div>
  );
}
