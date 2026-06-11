import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  FileText, 
  ShieldAlert, 
  Wallet, 
  Bot, 
  BarChart3, 
  Activity as HealthIcon, 
  Settings,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingPaymentsCount: number;
  unreadMessagesCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  pendingPaymentsCount, 
  unreadMessagesCount 
}) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Rehab Center' },
    { id: 'leads', icon: Users, label: 'Debt Pipeline' },
    { id: 'messages', icon: MessageSquare, label: 'Communication', badge: unreadMessagesCount },
    { id: 'blueprints', icon: FileText, label: 'Strategy Blueprints' },
    { id: 'settlements', icon: ShieldAlert, label: 'Settlement Desk' },
    { id: 'assets', icon: Wallet, label: 'Collateral Engine' },
    { id: 'payments-audit', icon: ShieldCheck, label: 'Payment Audit', badge: pendingPaymentsCount },
    { id: 'agent-ops', icon: Bot, label: 'Agent Ops' },
    { id: 'pilot', icon: BarChart3, label: 'Pilot Data' },
    { id: 'health', icon: HealthIcon, label: 'System Health' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-[#0A111F] border-r border-white/5 flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-900/40">C</div>
          <div>
            <h1 className="text-lg font-black tracking-tighter">CLICK INDIA</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Admin CRM</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                activeTab === item.id 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-inner' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                {item.label}
              </div>
              {item.badge ? (
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${item.id === 'payments-audit' ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'}`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
          <div>
            <p className="text-xs font-bold">Sameer Khan</p>
            <p className="text-[10px] text-gray-500">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
