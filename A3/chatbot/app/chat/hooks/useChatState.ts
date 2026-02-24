'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Message, Session } from '../types.js';

export function useChatState() {
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
    await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include',
    });
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    router.push('/login');
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    localStorage.setItem('selectedModel', model);
  };

  return {
    // State
    messages,
    sessions,
    currentSessionId,
    input,
    loading,
    sidebarOpen,
    user,
    selectedModel,
    availableModels,
    showModels,
    renderMarkdown,
    editingSessionId,
    editingTitle,
    
    // State setters
    setInput,
    setSidebarOpen,
    setRenderMarkdown,
    setShowModels,
    setEditingTitle,
    
    // Actions
    fetchMessages,
    createNewSession,
    deleteSession,
    startRenaming,
    cancelRenaming,
    renameSession,
    sendMessage,
    listAvailableModels,
    logout,
    handleModelChange,
  };
}
