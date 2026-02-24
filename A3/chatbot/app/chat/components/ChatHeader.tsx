'use client';

interface ChatHeaderProps {
  sidebarOpen: boolean;
  renderMarkdown: boolean;
  selectedModel: string;
  onToggleSidebar: () => void;
  onToggleMarkdown: () => void;
  onModelChange: (model: string) => void;
}

export default function ChatHeader({
  sidebarOpen,
  renderMarkdown,
  selectedModel,
  onToggleSidebar,
  onToggleMarkdown,
  onModelChange,
}: ChatHeaderProps) {
  return (
    <div className="bg-black border-b border-white/10 p-4 flex items-center justify-between">
      <button
        onClick={onToggleSidebar}
        className="p-2 hover:bg-white/5 rounded-xl transition-all duration-300 border border-transparent hover:border-white/10 hover:scale-110"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="text-sm font-light tracking-widest uppercase">AI ChatBot</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMarkdown}
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
          onChange={(e) => onModelChange(e.target.value)}
          className="px-3 py-1.5 bg-black border border-white/20 rounded-full text-xs font-light text-white/80 hover:border-white/40 transition-all duration-300 outline-none focus:border-white cursor-pointer"
        >
          <option value="gemini-2.5-flash" className="bg-black">Gemini 2.5 Flash</option>
          <option value="gemini-2.5-pro" className="bg-black">Gemini 2.5 Pro</option>
          <option value="gemini-2.0-lite" className="bg-black">Gemini 2.0 Lite</option>
        </select>
      </div>
    </div>
  );
}
