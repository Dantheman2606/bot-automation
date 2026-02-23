'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: number;
  role: string;
  content: string;
  created_at: string;
}

interface Session {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [showModels, setShowModels] = useState(false);
  const [renderMarkdown, setRenderMarkdown] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const savedModel = localStorage.getItem('selectedModel');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    if (savedModel) {
      setSelectedModel(savedModel);
    }
    fetchSessions(token);
  }, [router]);

  const fetchSessions = async (token: string) => {
    try {
      const response = await fetch('/api/sessions', {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const fetchMessages = async (sessionId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setMessages(data.messages || []);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const createNewSession = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: 'New Chat' }),
      });
      const data = await response.json();
      setSessions([data.session, ...sessions]);
      setCurrentSessionId(data.session.id);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const deleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(sessions.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const startRenaming = (sessionId: number, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  const cancelRenaming = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const renameSession = async (sessionId: number, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token || !editingTitle.trim()) return;

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editingTitle.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(sessions.map(s => 
          s.id === sessionId ? { ...s, title: editingTitle.trim() } : s
        ));
        setEditingSessionId(null);
        setEditingTitle('');
      }
    } catch (error) {
      console.error('Failed to rename session:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userMessage = input;
    setInput('');
    setLoading(true);

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages([...messages, tempUserMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: currentSessionId,
          model: selectedModel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.message,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update current session if it was created
      if (!currentSessionId && data.sessionId) {
        setCurrentSessionId(data.sessionId);
        fetchSessions(token);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const listAvailableModels = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/models', {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.models) {
        setAvailableModels(data.models);
        setShowModels(true);
        console.log('Available Models:', data.models);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const logout = async () => {
    // Call logout API to clear HTTP-only cookie
    await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include',
    });
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    router.push('/login');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-black border-r border-white/10 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-white/10">
          <button
            onClick={createNewSession}
            className="w-full py-2.5 px-4 bg-white text-black hover:bg-white/90 hover:scale-105 rounded-full font-medium transition-all duration-300 text-sm shadow-lg hover:shadow-xl hover:shadow-white/20"
          >
            + New Session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => fetchMessages(session.id)}
              className={`p-3 mb-1 rounded-2xl cursor-pointer transition-all duration-300 group border hover:scale-102 ${
                currentSessionId === session.id
                  ? 'bg-white/5 border-white/20 shadow-lg shadow-white/5'
                  : 'border-transparent hover:border-white/10 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                {editingSessionId === session.id ? (
                  <form onSubmit={(e) => renameSession(session.id, e)} className="flex-1 flex gap-1">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={() => renameSession(session.id)}
                      autoFocus
                      className="flex-1 px-2 py-1 bg-black border border-white/30 rounded text-xs font-light text-white outline-none focus:border-white"
                    />
                  </form>
                ) : (
                  <span className="text-xs font-light text-white truncate flex-1 tracking-wide">
                    {session.title}
                  </span>
                )}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => startRenaming(session.id, session.title, e)}
                    className="text-white/50 hover:text-white transition-colors p-1"
                    title="Rename"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => deleteSession(session.id, e)}
                    className="text-white/50 hover:text-white transition-colors text-lg"
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
              <span className="text-[10px] text-white/30 font-light">
                {new Date(session.updated_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="text-xs font-light text-white/50 truncate tracking-wide">
            {user?.name || user?.email}
          </div>
          <button
            onClick={listAvailableModels}
            className="w-full py-2 px-4 border border-white/20 hover:border-white/40 rounded-full text-white/70 hover:text-white transition-all duration-300 text-xs font-light tracking-wider uppercase hover:scale-105 hover:bg-white/5"
          >
            List Models
          </button>
          <button
            onClick={logout}
            className="w-full py-2 px-4 border border-white/20 hover:border-white/40 rounded-full text-white/70 hover:text-white transition-all duration-300 text-xs font-light tracking-wider uppercase hover:scale-105 hover:bg-white/5"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-black border-b border-white/10 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-xl transition-all duration-300 border border-transparent hover:border-white/10 hover:scale-110"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-sm font-light tracking-widest uppercase">AI Nexus</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRenderMarkdown(!renderMarkdown)}
              className="px-3 py-1.5 border border-white/20 hover:border-white/40 rounded-full text-xs font-light text-white/80 hover:text-white transition-all duration-300"
              title={renderMarkdown ? 'Show Raw Text' : 'Render Markdown'}
            >
              {renderMarkdown ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                localStorage.setItem('selectedModel', e.target.value);
              }}
              className="px-3 py-1.5 bg-black border border-white/20 rounded-full text-xs font-light text-white/80 hover:border-white/40 transition-all duration-300 outline-none focus:border-white cursor-pointer"
            >
              <option value="gemini-2.5-flash" className="bg-black">Gemini 2.5 Flash</option>
              <option value="gemini-2.5-pro" className="bg-black">Gemini 2.5 Pro</option>
              <option value="gemini-2.0-lite" className="bg-black">Gemini 2.0 Lite</option>
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 border border-white/20 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-light tracking-wide">
                  Initialize <span className="font-bold">Conversation</span>
                </h2>
                <p className="text-white/40 text-sm font-light">
                  Begin your neural dialogue
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
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
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-3xl px-5 py-3 shadow-lg shadow-white/5">
                <div className="flex space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-black border-t border-white/10 p-4">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter message..."
              disabled={loading}
              className="flex-1 px-4 py-3 bg-black border border-white/20 rounded-full focus:border-white text-white placeholder-white/30 disabled:opacity-50 outline-none text-sm font-light transition-all duration-300 focus:shadow-lg focus:shadow-white/10"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-white text-black hover:bg-white/90 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm hover:scale-105 hover:shadow-xl hover:shadow-white/20"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Models Modal */}
      {showModels && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModels(false)}>
          <div className="bg-black border border-white/20 rounded-3xl p-8 max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-light tracking-wide">Available <span className="font-bold">Models</span></h2>
              <button onClick={() => setShowModels(false)} className="text-white/50 hover:text-white text-2xl">
                ×
              </button>
            </div>
            <div className="space-y-2">
              {availableModels.length > 0 ? (
                availableModels.map((model, index) => (
                  <div key={index} className="p-3 border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                    <p className="text-sm font-light text-white/80">{model}</p>
                  </div>
                ))
              ) : (
                <p className="text-white/50 text-sm">No models available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
