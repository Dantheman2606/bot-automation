'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store in localStorage for client-side API calls
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Cookie is already set by the API response
      router.push('/chat');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      <div className="w-full max-w-md p-10 space-y-8 border border-white/10 rounded-3xl bg-black/50 backdrop-blur-xl relative z-10 shadow-2xl shadow-white/5">
        <div className="text-center space-y-3">
          
          <h1 className="text-4xl font-light tracking-tight">
            Sign <span className="font-bold">In</span>
          </h1>
         
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-light">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-light tracking-wider uppercase text-white/70 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-black border border-white/20 rounded-xl focus:border-white text-white placeholder-white/30 transition-all duration-300 outline-none focus:shadow-lg focus:shadow-white/10"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-light tracking-wider uppercase text-white/70 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-black border border-white/20 rounded-xl focus:border-white text-white placeholder-white/30 transition-all duration-300 outline-none focus:shadow-lg focus:shadow-white/10"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-white text-black font-medium rounded-full hover:bg-white/90 hover:scale-105 hover:shadow-xl hover:shadow-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Authenticating...' : 'Access System'}
          </button>
        </form>

        <p className="text-center text-sm text-white/50 font-light">
          New user?{' '}
          <Link href="/signup" className="text-white hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
