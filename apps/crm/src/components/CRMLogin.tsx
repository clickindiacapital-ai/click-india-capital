import React, { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';

interface CRMLoginProps {
  onAuthenticated: () => void;
}

const CRMLogin: React.FC<CRMLoginProps> = ({ onAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      onAuthenticated();
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
          <div className="mb-8">
            <h2 className="text-2xl font-black tracking-tighter text-white mb-2">Admin Access</h2>
            <p className="text-sm text-gray-500 font-medium">
              Enter your credentials to access the secure CRM.
            </p>
          </div>

          <form onSubmit={handlePasswordLogin} className="space-y-6">
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

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
                  disabled={loading || !email || !password}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-900/40"
                >
                  {loading ? 'Authenticating...' : 'Secure Login'}
                </button>
              </form>
        </div>

        <p className="text-center text-[10px] text-gray-700 font-bold uppercase tracking-widest mt-8">
          Secured by Supabase Auth · Click India Capital
        </p>
      </div>
    </div>
  );
};

export default CRMLogin;
