'use client';

import { Session } from '../types.js';
import SessionItem from './SessionItem.js';

interface SidebarProps {
  isOpen: boolean;
  sessions: Session[];
  currentSessionId: number | null;
  user: any;
  editingSessionId: number | null;
  editingTitle: string;
  onCreateNewSession: () => void;
  onSelectSession: (sessionId: number) => void;
  onDeleteSession: (sessionId: number, e: React.MouseEvent) => void;
  onStartRenaming: (sessionId: number, currentTitle: string, e: React.MouseEvent) => void;
  onRenameSession: (sessionId: number, e?: React.FormEvent) => void;
  onEditingTitleChange: (title: string) => void;
  onListModels: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  isOpen,
  sessions,
  currentSessionId,
  user,
  editingSessionId,
  editingTitle,
  onCreateNewSession,
  onSelectSession,
  onDeleteSession,
  onStartRenaming,
  onRenameSession,
  onEditingTitleChange,
  onListModels,
  onLogout,
}: SidebarProps) {
  return (
    <div
      className={`${
        isOpen ? 'w-64' : 'w-0'
      } bg-black border-r border-white/10 transition-all duration-300 overflow-hidden flex flex-col`}
    >
      <div className="p-4 border-b border-white/10">
        <button
          onClick={onCreateNewSession}
          className="w-full py-2.5 px-4 bg-white text-black hover:bg-white/90 hover:scale-105 rounded-full font-medium transition-all duration-300 text-sm shadow-lg hover:shadow-xl hover:shadow-white/20"
        >
          + New Session
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sessions.map((session) => (
          <SessionItem
            key={session.id}
            session={session}
            isActive={currentSessionId === session.id}
            isEditing={editingSessionId === session.id}
            editingTitle={editingTitle}
            onSelect={() => onSelectSession(session.id)}
            onDelete={(e: React.MouseEvent) => onDeleteSession(session.id, e)}
            onStartRenaming={(e: React.MouseEvent) => onStartRenaming(session.id, session.title, e)}
            onRename={(e?: React.FormEvent) => onRenameSession(session.id, e)}
            onEditingTitleChange={onEditingTitleChange}
          />
        ))}
      </div>

      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="text-xs font-light text-white/50 truncate tracking-wide">
          {user?.name || user?.email}
        </div>
        <button
          onClick={onListModels}
          className="w-full py-2 px-4 border border-white/20 hover:border-white/40 rounded-full text-white/70 hover:text-white transition-all duration-300 text-xs font-light tracking-wider uppercase hover:scale-105 hover:bg-white/5"
        >
          List Models
        </button>
        <button
          onClick={onLogout}
          className="w-full py-2 px-4 border border-white/20 hover:border-white/40 rounded-full text-white/70 hover:text-white transition-all duration-300 text-xs font-light tracking-wider uppercase hover:scale-105 hover:bg-white/5"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
