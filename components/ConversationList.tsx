'use client';

interface ConversationListProps {
  conversations: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading,
}: ConversationListProps) {
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-gray-500">Loading conversations...</p>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-gray-500">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {conversations.map((conv) => (
        <button
          key={conv._id}
          onClick={() => onSelect(conv._id)}
          className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
            selectedId === conv._id
              ? 'bg-blue-100 text-blue-900 font-medium'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <p className="truncate font-medium">{conv.title}</p>
          <p className="text-xs text-gray-500">
            {new Date(conv.createdAt).toLocaleDateString()}
          </p>
        </button>
      ))}
    </div>
  );
}
