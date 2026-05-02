'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import ProductInstanceSelector from '@/components/ProductInstanceSelector';
import { useProductInstances, useProjectBySlug } from '@/hooks/useApi';

export default function ChatPage() {
  const params = useParams();
  const [selectedProductInstanceId, setSelectedProductInstanceId] = useState<string | null>(null);
  const slug = params.slug as string;
  const { data: project, isLoading: projectLoading } = useProjectBySlug(slug, !!slug);
  const { data: productInstances, isLoading: productInstancesLoading } = useProductInstances(
    project?._id || '',
    !!project?._id
  );

  if (projectLoading) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">
        Loading project...
      </div>
    );
  }

  if (!project?._id) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">
        Project not found.
      </div>
    );
  }

  if (!selectedProductInstanceId) {
    return (
      <div className="h-full flex flex-col">
        <ProductInstanceSelector
          productInstances={productInstances || []}
          loading={productInstancesLoading}
          onSelect={setSelectedProductInstanceId}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ChatInterface
        projectId={project._id}
        productInstanceId={selectedProductInstanceId}
      />
    </div>
  );
}
