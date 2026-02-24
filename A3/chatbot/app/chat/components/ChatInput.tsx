'use client';

interface ChatInputProps {
  input: string;
  loading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ChatInput({ input, loading, onInputChange, onSubmit }: ChatInputProps) {
  return (
    <div className="bg-black border-t border-white/10 p-4">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
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
  );
}
