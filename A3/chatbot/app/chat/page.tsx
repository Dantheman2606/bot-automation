'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
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
              <div className="flex items-center justify-between">
                <span className="text-xs font-light text-white truncate flex-1 tracking-wide">
                  {session.title}
                </span>
                <button
                  onClick={(e) => deleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-white transition-opacity ml-2 text-lg"
                >
                  ×
                </button>
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
          <div className="w-9"></div>
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
                  <p className="text-sm font-light leading-relaxed whitespace-pre-wrap">{message.content}</p>
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
    </div>
  );
}
