'use client';

import { useConversations, useCreateConversation, useSendMessage } from '@/hooks/useApi';
import { useState, useRef } from 'react';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatInterfaceProps {
  projectId: string;
  productInstanceId: string;
}

export default function ChatInterface({
  projectId,
  productInstanceId,
}: ChatInterfaceProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: conversationsLoading } = useConversations(
    projectId,
    productInstanceId,
    !!projectId
  );

  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();

  const handleCreateNewChat = async () => {
    if (!projectId) return;

    try {
      const newConversation = await createConversation.mutateAsync({
        projectId,
        productInstanceId,
        title: `Chat - ${new Date().toLocaleDateString()}`,
      });

      setSelectedConversationId(newConversation._id);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setMessages([]);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return;

    try {
      const response = await sendMessage.mutateAsync({
        conversationId: selectedConversationId,
        content,
      });

      setMessages((prev) => [...prev, response.userMessage, response.assistantMessage]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex h-full">
      {/* Conversations Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={handleCreateNewChat}
            disabled={createConversation.isPending}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {createConversation.isPending ? 'Creating...' : '+ New Chat'}
          </button>
        </div>

        <ConversationList
          conversations={conversations || []}
          selectedId={selectedConversationId}
          onSelect={handleSelectConversation}
          loading={conversationsLoading}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <>
            <MessageList
              messages={messages}
              loading={sendMessage.isPending}
            />
            <div ref={messagesEndRef} />
            <MessageInput
              onSend={handleSendMessage}
              disabled={sendMessage.isPending}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">No conversation selected</p>
              <p className="text-sm text-gray-500">Create a new chat or select an existing one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
