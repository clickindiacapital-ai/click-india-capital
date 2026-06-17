import { LayoutDashboard, Users, FileText, Settings, Bell, Search, MessageSquare, ShieldCheck, BookOpen, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';
import CRMLogin from './components/CRMLogin';
import CommunicationCenter from './pages/CommunicationCenter';
import IntelligenceConsole from './components/IntelligenceConsole';
import Customers from './pages/Customers';
import CustomerProfile from './pages/CustomerProfile';
import LoanApplications from './pages/LoanApplications';
import PolicyManager from './pages/PolicyManager';
import BlogManager from './pages/BlogManager';
import OutreachCampaign from './pages/OutreachCampaign';
import SettingsPage from './pages/Settings';
import supabase from './services/supabaseClient';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

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
            { icon: LayoutDashboard, label: 'Dashboard' },
            { icon: MessageSquare, label: 'Communication Center' },
            { icon: Smartphone, label: 'Cold Outreach' },
            { icon: Users, label: 'Customers' },
            { icon: ShieldCheck, label: 'Credit Policies' },
            { icon: BookOpen, label: 'Insights Manager' },
            { icon: FileText, label: 'Loan Applications' },
            { icon: Settings, label: 'Settings' }
          ].map((item, i) => (
            <button 
              key={i} 
              onClick={() => {
                setActiveTab(item.label);
                setSelectedCustomerId(null); // Reset profile view when changing tabs
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.label ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white text-slate-300'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
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
        <div className="flex-1 overflow-hidden bg-slate-100">
          {activeTab === 'Communication Center' ? (
            <div className="p-4 h-full"><CommunicationCenter /></div>
          ) : activeTab === 'Dashboard' ? (
            <div className="h-full overflow-y-auto p-4">
              <IntelligenceConsole />
            </div>
          ) : activeTab === 'Cold Outreach' ? (
            <OutreachCampaign />
          ) : activeTab === 'Customers' ? (
            selectedCustomerId ? (
              <CustomerProfile 
                customerId={selectedCustomerId} 
                onBack={() => setSelectedCustomerId(null)} 
              />
            ) : (
              <Customers onSelectCustomer={setSelectedCustomerId} />
            )
          ) : activeTab === 'Credit Policies' ? (
            <PolicyManager />
          ) : activeTab === 'Insights Manager' ? (
            <BlogManager />
          ) : activeTab === 'Loan Applications' ? (
            <LoanApplications 
              onSelectCustomer={(customerId) => {
                setSelectedCustomerId(customerId);
                setActiveTab('Customers');
              }} 
            />
          ) : activeTab === 'Settings' ? (
            <SettingsPage />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mb-6">
                <Settings className="w-8 h-8 text-slate-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{activeTab}</h1>
              <p className="text-slate-500 max-w-sm">
                This module is currently under construction and will be available in a future update.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
