'use client';

import { useDashboardConfig, useUpdateDashboardConfig } from '@/hooks/useApi';
import { useState, useEffect } from 'react';
import DashboardWidget from './DashboardWidget';
import DashboardEditor from './DashboardEditor';

interface AdminDashboardProps {
  projectSlug: string;
}

export default function AdminDashboard({ projectSlug }: AdminDashboardProps) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { data: config, isLoading } = useDashboardConfig(projectId || '', !!projectId);
  const updateConfig = useUpdateDashboardConfig();

  useEffect(() => {
    // In a real app, fetch projectId from API using slug
    setProjectId(projectSlug);
  }, [projectSlug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Dashboard configuration not found</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Config-driven layout from MongoDB</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isEditing
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isEditing ? 'Done Editing' : 'Edit Layout'}
        </button>
      </div>

      {/* Content */}
      {isEditing ? (
        <DashboardEditor
          config={config}
          onSave={async (updatedConfig) => {
            await updateConfig.mutateAsync({
              projectId: projectId!,
              sections: updatedConfig.sections,
            });
            setIsEditing(false);
          }}
          loading={updateConfig.isPending}
        />
      ) : (
        <div className="space-y-8">
          {config.sections.map((section: any) => (
            <div key={section.id} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {section.widgets.map((widget: any) => (
                  <DashboardWidget key={widget.id} widget={widget} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
