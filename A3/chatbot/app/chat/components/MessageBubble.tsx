'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types.js';

interface MessageBubbleProps {
  message: Message;
  renderMarkdown: boolean;
}

export default function MessageBubble({ message, renderMarkdown }: MessageBubbleProps) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] px-5 py-3 rounded-3xl shadow-lg transition-all duration-300 ${
          message.role === 'user'
            ? 'bg-white text-black shadow-white/20'
            : 'bg-white/5 text-white border border-white/10 shadow-white/5'
        }`}
      >
        {renderMarkdown && message.role === 'assistant' ? (
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm font-light leading-relaxed whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  );
}
