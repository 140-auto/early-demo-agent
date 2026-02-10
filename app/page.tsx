'use client';

import { useState } from 'react';
import { SearchInterface } from '@/components/search-interface';
import { ChatInterface } from '@/components/chat-interface';

type State = 'search' | 'chat';

interface ChatState {
  query: string;
  initialResponse: string;
}

export default function Home() {
  const [state, setState] = useState<State>('search');
  const [chatState, setChatState] = useState<ChatState | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setLastQuery(query);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setConversationId(data.conversationId);
      setChatState({
        query,
        initialResponse: data.response,
      });
      setState('chat');
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastQuery) {
      handleSearch(lastQuery);
    }
  };

  const handleChatMessage = async (message: string): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, conversationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return data.error || 'Sorry, something went wrong. Please try again.';
      }

      // Update conversationId in case it was created on this call
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      return data.response;
    } catch (error) {
      console.error('Chat failed:', error);
      return 'Sorry, I encountered an error processing your message. Please try again.';
    }
  };

  const handleBack = () => {
    setState('search');
    setChatState(null);
    setConversationId(null);
  };

  return (
    <main className="min-h-screen bg-background">
      {state === 'search' ? (
        <SearchInterface onSearch={handleSearch} isLoading={isLoading} error={error} onRetry={handleRetry} />
      ) : chatState ? (
        <ChatInterface
          initialQuery={chatState.query}
          initialResponse={chatState.initialResponse}
          onBack={handleBack}
          onSendMessage={handleChatMessage}
        />
      ) : null}
    </main>
  );
}
