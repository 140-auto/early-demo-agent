'use client';

import React from "react"

import { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Car } from 'lucide-react';
import { ClipLoader, PulseLoader } from 'react-spinners';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  initialQuery: string;
  initialResponse: string;
  onBack: () => void;
  onSendMessage: (message: string) => Promise<string>;
}

export function ChatInterface({
  initialQuery,
  initialResponse,
  onBack,
  onSendMessage,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'user',
      content: initialQuery,
      timestamp: new Date(),
    },
    {
      id: '2',
      role: 'agent',
      content: initialResponse,
      timestamp: new Date(Date.now() + 1000),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await onSendMessage(inputValue);

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-4 md:px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Back to Search</span>
        </button>

        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-accent" />
          <h1 className="font-semibold text-foreground text-sm md:text-base">
            140Auto AI Agent
          </h1>
        </div>

        <div className="w-8" />
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs md:max-w-2xl rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-accent text-accent-foreground rounded-br-none'
                  : 'bg-card border border-border text-foreground rounded-bl-none'
              }`}
              {...(message.role === 'agent' ? { dir: 'auto' } : {})}
            >
              {message.role === 'agent' ? (
                <div className="agent-markdown text-sm md:text-base leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              )}
              <span
                className={`text-xs mt-2 block opacity-70 ${
                  message.role === 'user' ? 'text-accent-foreground' : 'text-muted-foreground'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
              <PulseLoader size={8} color="hsl(var(--accent))" speedMultiplier={0.8} />
              <span className="text-sm text-muted-foreground">Agent thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm px-4 md:px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a follow-up question..."
            disabled={isLoading}
            className="flex-1 bg-secondary text-foreground placeholder:text-muted-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:border-accent disabled:opacity-50 transition duration-200 text-sm md:text-base"
          />

          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-accent text-accent-foreground px-4 md:px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2 flex-shrink-0"
          >
            {isLoading ? (
              <ClipLoader size={16} color="hsl(var(--accent-foreground))" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
