import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Headset } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const signup = useAuthStore((state) => state.signup);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('alex@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        await signup({
          name,
          email,
          password,
          avatar: `https://i.pravatar.cc/200?u=${encodeURIComponent(email)}`,
        });
      } else {
        await login(email, password);
      }
      navigate('/garage');
    } catch (err) {
      setError(err instanceof Error ? err.message : mode === 'login' ? 'Unable to sign in' : 'Unable to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex overflow-hidden bg-background">
      {/* Left Side: Visual Anchor */}
      <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-end p-margin-desktop overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5kVwu5SHQh1PJ7LQNALeYFPKycpVdnwgjoVz_D1W2a4Y1YzJkFSvIV-fsKoORr_EwcgQrzeaIzMKThmwG9amhlv-uGXStiielaInrUbmcK_mTlPpCi_odlc-hW9_3I3fA92yBTyZe_OZnaLmgo8U36iaMVaZVom2Sy0EeVUsmSxr1Br_-5ghlmUQnA9HHp0PN-6hl1pM9FwbMw67sLMG_oDoClfyZTSHrcUeAPtU4x2zU8Mi0VOop-2L5g7ad-ZumbqnqUM7WgA" 
            alt="Luxury Automotive"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="relative z-10 space-y-4 max-w-lg"
        >
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] text-primary tracking-[0.4em] uppercase">Legacy Defined</span>
          </div>
          <h1 className="font-display text-5xl text-on-background tracking-tighter leading-tight">Precision Engineering. Unrivaled Performance.</h1>
          <p className="font-sans text-lg text-on-surface-variant/80 leading-relaxed">
            Welcome to the exclusive circle of automotive connoisseurs. Access the world's most prestigious inventory.
          </p>
        </motion.div>
      </section>

      {/* Right Side: Authentication Form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 lg:p-24 bg-surface-container-lowest">
        <div className="w-full max-w-md flex flex-col space-y-10">
          {/* Brand Header */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <Link to="/" className="font-display text-2xl font-bold tracking-tighter text-on-background">AUTOVISTA</Link>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError('');
                }}
                className="font-mono text-[10px] text-primary uppercase tracking-[0.2em] hover:underline hover:tracking-[0.3em] transition-all"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-on-surface uppercase tracking-tight">
              {mode === 'login' ? 'Collector Sign In' : 'Create Account'}
            </h2>
            <p className="font-sans text-sm text-on-surface-variant opacity-80">
              {mode === 'login' ? 'Enter your credentials to access your private garage.' : 'Create your profile and start posting to the community.'}
            </p>
          </div>

          {/* Auth Form */}
          <form className="space-y-8" onSubmit={handleLogin}>
            <div className="space-y-6">
              {mode === 'signup' && (
                <div className="relative group">
                  <input
                    className="w-full bg-surface-container border-none border-b border-outline/20 focus:border-primary focus:ring-0 text-on-surface font-sans py-4 px-4 transition-all"
                    id="name"
                    placeholder="DISPLAY NAME"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>
              )}
              <div className="relative group">
                <input 
                  className="w-full bg-surface-container border-none border-b border-outline/20 focus:border-primary focus:ring-0 text-on-surface font-sans py-4 px-4 transition-all"
                  id="email"
                  placeholder={mode === 'login' ? 'EMAIL OR ADMIN USERNAME' : 'EMAIL ADDRESS'}
                  type={mode === 'login' ? 'text' : 'email'}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="block font-mono text-[8px] text-on-surface-variant uppercase tracking-widest">Security</span>
                  <a className="text-[10px] font-mono text-primary uppercase tracking-widest hover:text-on-primary-container transition-colors" href="#">Forgot Password?</a>
                </div>
                <input 
                  className="w-full bg-surface-container border-none border-b border-outline/20 focus:border-primary focus:ring-0 text-on-surface font-sans py-4 px-4 transition-all"
                  id="password"
                  placeholder="PASSWORD"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={mode === 'signup' ? 8 : undefined}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="flex items-center">
              <input className="w-4 h-4 bg-surface-container-high border-outline rounded focus:ring-primary text-primary transition-all cursor-pointer" id="remember" type="checkbox" />
              <label className="ml-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant select-none cursor-pointer hover:text-on-surface transition-colors" htmlFor="remember">
                Stay signed in for 30 days
              </label>
            </div>

            <button
              className="relative overflow-hidden w-full py-5 bg-primary text-on-primary font-mono text-[10px] uppercase tracking-[0.3em] rounded-xl hover:scale-[1.01] active:scale-[0.98] transition-all shadow-xl shadow-primary/10 shimmer-effect disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Authorize Access' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-outline-variant/30"></div>
            <span className="flex-shrink mx-4 font-mono text-[8px] text-on-surface-variant uppercase tracking-[0.3em]">Or Continue With</span>
            <div className="flex-grow border-t border-outline-variant/30"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center space-x-3 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all active:scale-95 group">
              <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface group-hover:text-primary transition-colors">Google</span>
            </button>
            <button className="flex items-center justify-center space-x-3 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all active:scale-95 group">
              <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface group-hover:text-primary transition-colors">Apple</span>
            </button>
          </div>

          {/* Footer Support */}
          <div className="pt-8 flex justify-center">
            <p className="font-mono text-[9px] text-on-surface-variant/40 uppercase tracking-[0.4em]">
              © {new Date().getFullYear()} AUTOVISTA LUXURY GROUP. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </section>

      {/* Support FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-surface-container-high text-primary rounded-full flex items-center justify-center shadow-2xl border border-white/10 hover:scale-110 active:scale-95 transition-all group z-50">
        <Headset className="w-6 h-6 transition-transform duration-500 group-hover:rotate-12" />
      </button>
    </main>
  );
}
