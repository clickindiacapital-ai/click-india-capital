import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Palette, LogOut, Shield } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export default function Settings() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email || null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handlePasswordReset = async () => {
    if (userEmail) {
      await supabase.auth.resetPasswordForEmail(userEmail);
      alert('Password reset link sent to your email.');
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="px-8 py-6 border-b border-slate-200 bg-white">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account preferences and system settings.</p>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Profile Section */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-8 py-5 border-b border-slate-200 flex items-center gap-3">
              <User className="text-blue-600" size={20} />
              <h2 className="text-lg font-bold text-slate-900">Account Profile</h2>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-black">
                  {userEmail ? userEmail.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Administrator</h3>
                  <p className="text-slate-500">{userEmail}</p>
                  <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                    <Shield size={12} /> Super Admin
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <button 
                  onClick={handlePasswordReset}
                  className="flex items-center gap-2 text-slate-700 font-medium hover:text-blue-600 transition-colors"
                >
                  <Lock size={18} />
                  <span>Send Password Reset Email</span>
                </button>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-8 py-5 border-b border-slate-200 flex items-center gap-3">
              <Palette className="text-purple-600" size={20} />
              <h2 className="text-lg font-bold text-slate-900">System Preferences</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Dark Mode Dashboard</h4>
                  <p className="text-sm text-slate-500">Apply dark mode to the entire CRM interface.</p>
                </div>
                <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
                  <input type="checkbox" className="sr-only peer" disabled />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Bell className="text-slate-400" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Email Notifications</h4>
                    <p className="text-sm text-slate-500">Receive an email when a new lead enters the system.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-rose-50 rounded-2xl border border-rose-200 overflow-hidden shadow-sm">
            <div className="px-8 py-5 border-b border-rose-200 flex items-center gap-3">
              <LogOut className="text-rose-600" size={20} />
              <h2 className="text-lg font-bold text-rose-900">Session</h2>
            </div>
            <div className="p-8">
              <p className="text-rose-700 mb-6 font-medium">Securely terminate your current session and return to the login screen.</p>
              <button 
                onClick={handleLogout}
                className="bg-rose-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-sm"
              >
                Sign Out of CRM
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
