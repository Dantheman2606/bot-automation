'use client';

export default function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white/5 border border-white/10 rounded-3xl px-5 py-3 shadow-lg shadow-white/5">
        <div className="flex space-x-1.5">
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}
