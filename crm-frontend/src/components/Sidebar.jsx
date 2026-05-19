import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sparkles, 
  ClipboardList, 
  Users, 
  CreditCard, 
  Settings,
  Plus
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: 'Tổng quan', path: '/', icon: LayoutDashboard },
    { name: 'Cơ hội', path: '/pipeline', icon: Sparkles },
    { name: 'Công việc', path: '/tasks', icon: ClipboardList },
    { name: 'Khách hàng', path: '/customers', icon: Users },
    { name: 'Thanh toán', path: '/payments', icon: CreditCard },
    { name: 'Cài đặt', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-[230px] h-screen sticky left-0 top-0 overflow-y-auto bg-white/85 dark:bg-surface-container/80 backdrop-blur-md border-r border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hidden md:flex flex-col py-8 z-40">
      <div className="px-6 mb-8 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary-container">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>spa</span>
          </div>
          <div>
            <h2 className="text-lg text-[#3F3A33] tracking-tight font-bold leading-tight">Vĩnh Hưng Heritage</h2>
            <p className="text-xs text-[#8B8375]">Premium CRM</p>
          </div>
        </div>
        <button className="w-full bg-[#C89A3D] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#b08735] transition-colors flex items-center justify-center gap-2 shadow-sm">
          <Plus size={16} />
          New Entry
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group ${
                isActive
                  ? 'text-[#C89A3D] font-bold border-r-4 border-[#C89A3D] bg-[#C89A3D]/20 scale-[0.98]'
                  : 'text-[#8B8375] hover:text-[#C89A3D] hover:bg-[#C89A3D]/10'
              }`}
            >
              <item.icon size={20} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
