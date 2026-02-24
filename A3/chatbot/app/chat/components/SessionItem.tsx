'use client';

import { Session } from '../types.js';

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  isEditing: boolean;
  editingTitle: string;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onStartRenaming: (e: React.MouseEvent) => void;
  onRename: (e?: React.FormEvent) => void;
  onEditingTitleChange: (title: string) => void;
}

export default function SessionItem({
  session,
  isActive,
  isEditing,
  editingTitle,
  onSelect,
  onDelete,
  onStartRenaming,
  onRename,
  onEditingTitleChange,
}: SessionItemProps) {
  return (
    <div
      onClick={onSelect}
      className={`p-3 mb-1 rounded-2xl cursor-pointer transition-all duration-300 group border hover:scale-102 ${
        isActive
          ? 'bg-white/5 border-white/20 shadow-lg shadow-white/5'
          : 'border-transparent hover:border-white/10 hover:bg-white/5'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        {isEditing ? (
          <form onSubmit={onRename} className="flex-1 flex gap-1">
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => onEditingTitleChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onBlur={() => onRename()}
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
            onClick={onStartRenaming}
            className="text-white/50 hover:text-white transition-colors p-1"
            title="Rename"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
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
  );
}
