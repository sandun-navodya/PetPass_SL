'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Invalid credentials');
      }

      localStorage.setItem('access_token', json.data.accessToken);
      localStorage.setItem('refresh_token', json.data.refreshToken);
      localStorage.setItem('admin_user', JSON.stringify(json.data.admin));

      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/login-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark & Soft Blur Overlay for Contrast */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-10" />

      {/* Login Card Container */}
      <div className="relative z-20 w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/40">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#0d5c52] flex items-center justify-center text-white text-2xl font-black mx-auto mb-3 shadow-md">
            P
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">PetPass Admin</h2>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage veterinary and pet directories</p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Username or Email
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin01"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d5c52] focus:border-transparent text-sm font-medium transition shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d5c52] focus:border-transparent text-sm font-medium transition shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 bg-[#0d5c52] hover:bg-[#09443c] text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-150 disabled:opacity-60"
          >
            {isLoading ? 'Signing In...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}