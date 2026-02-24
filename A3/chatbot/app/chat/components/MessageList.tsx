'use client';

import { useRef, useEffect } from 'react';
import { Message } from '../types.js';
import MessageBubble from './MessageBubble.js';
import EmptyState from './EmptyState.js';
import LoadingIndicator from './LoadingIndicator.js';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  renderMarkdown: boolean;
}

export default function MessageList({ messages, loading, renderMarkdown }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              renderMarkdown={renderMarkdown}
            />
          ))}
          {loading && <LoadingIndicator />}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
