'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authApi.login(email.trim(), password);
      if (res.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(res.message || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'Unable to authenticate. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-primaryText flex flex-col justify-between selection:bg-accent/20">
      {/* Top minimal header */}
      <header className="px-6 py-4 border-b border-border/80 bg-white/70 backdrop-blur-md flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
          <span className="font-display font-black text-sm tracking-tight text-primaryText group-hover:text-accent transition-colors">
            HACKATHON 2027
          </span>
          <span className="text-[10px] font-mono text-secondaryText px-1.5 py-0.2 rounded bg-slate-100 border border-border">
            ADMIN CONSOLE
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs text-secondaryText hover:text-primaryText font-medium transition-colors"
        >
          ← Return to Public Site
        </Link>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-2xl border border-border/90 shadow-sm p-6 sm:p-8"
        >
          {/* Header icon and title */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent-subtle border border-accent/20 text-accent flex items-center justify-center mx-auto mb-3">
              <Shield size={24} />
            </div>
            <h1 className="font-display font-extrabold text-2xl text-primaryText tracking-tight">
              Event Administrator Login
            </h1>
            <p className="text-xs text-secondaryText mt-1.5">
              Authenticate to manage multi-event control, participants, categories, and team formation.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-primaryText mb-1.5"
              >
                Administrator Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondaryText/60"
                />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-canvas/40 text-primaryText text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-primaryText mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondaryText/60"
                />
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-canvas/40 text-primaryText text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Security note */}
          <div className="mt-6 pt-5 border-t border-border/70 text-center">
            <span className="text-[11px] font-mono text-secondaryText/60 inline-flex items-center gap-1.5">
              <Sparkles size={11} className="text-accent" />
              <span>Protected by Role-Based Access Control</span>
            </span>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-border/70 text-center text-xs text-secondaryText">
        <span>Hackathon Event Portal · Multi-Event Control System</span>
      </footer>
    </div>
  );
}
