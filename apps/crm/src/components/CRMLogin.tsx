import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CRMLoginProps {
  onAuthenticated: () => void;
}

const CRMLogin: React.FC<CRMLoginProps> = ({ onAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050B14] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12 justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-900/40">
            C
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white">CLICK INDIA</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Command Center</p>
          </div>
        </div>

        <div className="bg-[#0A111F] border border-white/5 rounded-[32px] p-10">
          {!sent ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-black tracking-tighter text-white mb-2">Admin Access</h2>
                <p className="text-sm text-gray-500 font-medium">
                  Enter your admin email. We'll send a secure magic link — no password needed.
                </p>
              </div>

              <form onSubmit={handleMagicLink} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@clickindia.in"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-medium outline-none focus:border-blue-600 transition-all placeholder:text-gray-700"
                  />
                </div>

                {error && (
                  <div className="px-5 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <p className="text-xs font-bold text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-900/40"
                >
                  {loading ? 'Sending...' : 'Send Magic Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-[24px] flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-white mb-3">Check your inbox</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Magic link sent to <span className="text-blue-400 font-bold">{email}</span>.
                <br />Click the link to access the dashboard.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-8 text-xs font-bold text-gray-600 hover:text-white uppercase tracking-widest transition-colors"
              >
                ← Use a different email
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-gray-700 font-bold uppercase tracking-widest mt-8">
          Secured by Supabase Auth · Click India Capital
        </p>
      </div>
    </div>
  );
};

export default CRMLogin;
