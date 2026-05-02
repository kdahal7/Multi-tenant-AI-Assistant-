'use client';

import { useParams } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  const params = useParams();

  return (
    <div className="h-full overflow-auto">
      <AdminDashboard projectSlug={params.slug as string} />
    </div>
  );
}
