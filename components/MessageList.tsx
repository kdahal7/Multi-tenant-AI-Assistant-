'use client';

interface Message {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  steps?: string[];
}

interface MessageListProps {
  messages: Message[];
  loading?: boolean;
}

export default function MessageList({ messages, loading }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
      {messages.length === 0 && !loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Start a conversation...</p>
        </div>
      ) : null}

      {messages.map((message) => (
        <div
          key={message._id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-100 text-gray-900 rounded-bl-none'
            }`}
          >
            <p className="text-sm">{message.content}</p>
            {message.steps && message.steps.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.steps.map((step, idx) => (
                  <p
                    key={idx}
                    className={`text-xs ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-600'
                    }`}
                  >
                    ⚙️ {step}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg rounded-bl-none">
            <p className="text-sm">Thinking...</p>
          </div>
        </div>
      )}
    </div>
  );
}
