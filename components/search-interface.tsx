'use client';

import React from "react"

import { useState, useRef, useEffect } from 'react';
import { Search, Car } from 'lucide-react';
import { ClipLoader, PulseLoader } from 'react-spinners';

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function SearchInterface({ onSearch, isLoading, error, onRetry }: SearchInterfaceProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Car className="w-8 h-8 text-accent" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            140Auto
          </h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Intelligent automotive search powered by advanced AI
        </p>
      </div>

      {/* Search Box */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl mb-8"
      >
        <div className="relative group">
          {/* Gradient border effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-accent to-accent/50 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition duration-300" />

          {/* Search Input */}
          <div className="relative flex items-center gap-3 bg-card px-6 py-4 rounded-2xl border border-border group-hover:border-accent/50 transition duration-300">
            {isLoading ? (
              <ClipLoader size={20} color="hsl(var(--accent))" cssOverride={{ flexShrink: 0 }} />
            ) : (
              <Search className="w-5 h-5 text-accent flex-shrink-0" />
            )}

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about vehicles, specs, models, or market trends..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base md:text-lg disabled:opacity-50"
            />

            {query && !isLoading && (
              <button
                type="submit"
                className="px-6 py-2 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition duration-200 text-sm md:text-base"
              >
                Search
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Error Banner */}
      {error && !isLoading && (
        <div className="w-full max-w-2xl mb-8 px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-4">
          <p className="text-sm text-red-400">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition duration-200 text-sm whitespace-nowrap"
            >
              Try Again
            </button>
          )}
        </div>
      )}

      {/* Suggestions */}
      {!isLoading && !error && (
        <div className="w-full max-w-2xl">
          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">
            Try searching for:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'عايز عربية تويوتا بميزانية ٥٠٠ ألف',
              'أحسن عربية عائلية موديل ٢٠٢٠ أو أحدث',
              'نيسان صني ٢٠٢٢ مستعملة',
              'هيونداي توسان ممشى قليل',
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setQuery(suggestion);
                  onSearch(suggestion);
                }}
                className="text-left px-4 py-3 rounded-lg bg-card border border-border hover:border-accent/50 hover:bg-card/80 transition duration-200 text-sm text-foreground group"
              >
                <span className="flex items-center gap-2">
                  <span className="text-accent group-hover:translate-x-1 transition duration-200">
                    →
                  </span>
                  {suggestion}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-4">
            <PulseLoader size={10} color="hsl(var(--accent))" speedMultiplier={0.8} />
            <p className="text-foreground text-sm font-medium">
              Analyzing your query with AI...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
