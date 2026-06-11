import { Search, Bell, Rocket } from 'lucide-react';

interface HeaderProps {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  liveAgentsCount?: number;
  onTriggerOutreach?: () => void;
}

const Header: React.FC<HeaderProps> = ({ unreadCount, setUnreadCount, liveAgentsCount = 12, onTriggerOutreach }) => {
  return (
    <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#050B14]/80 backdrop-blur-md sticky top-0 z-10 w-full">
      <div className="relative w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input 
          className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm outline-none focus:border-blue-600 transition-all text-white"
          placeholder="Search leads, phones, or agents..."
        />
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => setUnreadCount(0)}
          className="relative text-gray-400 hover:text-white transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[8px] font-black animate-pulse text-white">
              {unreadCount}
            </span>
          )}
        </button>
        <div className="h-8 w-px bg-white/10" />
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-600/20 hover:bg-emerald-600/20 transition-all">
          LIVE AGENTS: {liveAgentsCount}
        </button>
        <button 
          onClick={onTriggerOutreach}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/40"
        >
          <Rocket size={14} /> Launch Stealth Batch
        </button>
      </div>
    </header>
  );
};

export default Header;
