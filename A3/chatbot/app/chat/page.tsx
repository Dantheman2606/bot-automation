'use client';

import { useChatState } from './hooks/useChatState.js';
import Sidebar from './components/Sidebar.js';
import ChatHeader from './components/ChatHeader.js';
import MessageList from './components/MessageList.js';
import ChatInput from './components/ChatInput.js';
import ModelsModal from './components/ModelsModal.js';

export default function ChatPage() {
  const {
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
    setInput,
    setSidebarOpen,
    setRenderMarkdown,
    setShowModels,
    setEditingTitle,
    fetchMessages,
    createNewSession,
    deleteSession,
    startRenaming,
    renameSession,
    sendMessage,
    listAvailableModels,
    logout,
    handleModelChange,
  } = useChatState();

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar
        isOpen={sidebarOpen}
        sessions={sessions}
        currentSessionId={currentSessionId}
        user={user}
        editingSessionId={editingSessionId}
        editingTitle={editingTitle}
        onCreateNewSession={createNewSession}
        onSelectSession={fetchMessages}
        onDeleteSession={deleteSession}
        onStartRenaming={startRenaming}
        onRenameSession={renameSession}
        onEditingTitleChange={setEditingTitle}
        onListModels={listAvailableModels}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col">
        <ChatHeader
          sidebarOpen={sidebarOpen}
          renderMarkdown={renderMarkdown}
          selectedModel={selectedModel}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleMarkdown={() => setRenderMarkdown(!renderMarkdown)}
          onModelChange={handleModelChange}
        />

        <MessageList
          messages={messages}
          loading={loading}
          renderMarkdown={renderMarkdown}
        />

        <ChatInput
          input={input}
          loading={loading}
          onInputChange={setInput}
          onSubmit={sendMessage}
        />
      </div>

      <ModelsModal
        isOpen={showModels}
        models={availableModels}
        onClose={() => setShowModels(false)}
      />
    </div>
  );
}
