import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Flowing background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-16 space-y-6">
            <div className="inline-block px-4 py-2 border border-white/20 rounded-full text-xs tracking-widest uppercase mb-4">
              Powered by Gemini 2.5 Flash
            </div>
            <h1 className="text-7xl md:text-8xl font-light tracking-tight mb-6">
              AI <span className="font-bold">ChatBot</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto font-light">
              Experience the next generation of intelligent conversation
            </p>
          </div>

          {/* CTA Section */}
          <div className="mb-20">
            <div className="flex gap-4 justify-center">
              <Link
                href="/signup"
                className="group relative px-10 py-4 bg-white text-black font-medium rounded-full overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
              >
                <span className="relative z-10">Sign Up</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>
              <Link
                href="/login"
                className="px-10 py-4 border border-white/30 hover:border-white text-white font-medium rounded-full transition-all duration-500 hover:bg-white/10 hover:shadow-xl hover:shadow-white/10"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="group border border-white/10 hover:border-white/30 rounded-3xl p-8 transition-all duration-500 relative overflow-hidden hover:scale-105 hover:shadow-2xl hover:shadow-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 border-2 border-white/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-3 tracking-wide">
                  Neural Processing
                </h3>
                <p className="text-white/50 text-sm font-light leading-relaxed">
                  Advanced AI responses powered by cutting-edge language models
                </p>
              </div>
            </div>

            <div className="group border border-white/10 hover:border-white/30 p-8 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 border-2 border-white/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-3 tracking-wide">
                  Memory Core
                </h3>
                <p className="text-white/50 text-sm font-light leading-relaxed">
                  Persistent conversation history across all your sessions
                </p>
              </div>
            </div>

            <div className="group border border-white/10 hover:border-white/30 p-8 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 border-2 border-white/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-3 tracking-wide">
                  Security Protocol
                </h3>
                <p className="text-white/50 text-sm font-light leading-relaxed">
                  Enterprise-grade encryption safeguarding your data
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
