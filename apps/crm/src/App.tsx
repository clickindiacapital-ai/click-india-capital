import { LayoutDashboard, Users, FileText, Settings, Bell, Search, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import CRMLogin from './components/CRMLogin';
import supabase from './services/supabaseClient';

export default function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <CRMLogin onAuthenticated={() => {}} />;
  }

  return (

    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-white font-bold text-lg tracking-wide">Click Capital CRM</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', active: true },
            { icon: Users, label: 'Customers' },
            { icon: FileText, label: 'Loan Applications' },
            { icon: Settings, label: 'Settings' }
          ].map((item, i) => (
            <a key={i} href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${item.active ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
              {/* Using the icon component from array dynamically requires proper capital letter usage or React.createElement, which is fine as <item.icon/> works in React */}
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-2 text-slate-500 bg-slate-100 px-4 py-2 rounded-full w-96 focus-within:ring-2 focus-within:ring-blue-100 transition-shadow">
            <Search className="w-4 h-4" />
            <input type="text" placeholder="Search applications..." className="bg-transparent border-none focus:outline-none w-full text-sm placeholder-slate-400" />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 flex-1 overflow-y-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard Overview</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: 'Total Applications', value: '1,248', trend: '+12%' },
              { label: 'Pending Approvals', value: '45', trend: '-2%' },
              { label: 'Disbursed Amount', value: '₹4.2Cr', trend: '+24%' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                  <span className={`text-sm font-medium mb-1 ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Applications</h2>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50 text-slate-400">
              Data visualization component goes here...
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
