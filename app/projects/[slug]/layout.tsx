import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionFromCookie } from '@/lib/session';

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const session = await getSessionFromCookie();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-sm text-gray-500">{params.slug}</p>
        </div>

        <nav className="px-4 py-6">
          <div className="space-y-2">
            <Link
              href={`/projects/${params.slug}`}
              className="block px-4 py-2 rounded-lg text-gray-900 hover:bg-gray-100 font-medium"
            >
              💬 Chat
            </Link>
            {session.user.role === 'admin' && (
              <Link
                href={`/projects/${params.slug}/admin`}
                className="block px-4 py-2 rounded-lg text-gray-900 hover:bg-gray-100 font-medium"
              >
                ⚙️ Admin Dashboard
              </Link>
            )}
          </div>
        </nav>

        <div className="mt-auto p-6 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900">{session.user.email}</p>
            <p className="text-xs text-gray-600 capitalize">{session.user.role}</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
