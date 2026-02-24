'use client';

export default function EmptyState() {
  return (
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
  );
}
