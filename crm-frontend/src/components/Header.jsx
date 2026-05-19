import { useState, useRef, useEffect } from 'react';
import { Bell, Search, LogOut, User, ChevronDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Tổng quan';
      case '/pipeline': return 'Cơ hội bán hàng';
      case '/tasks': return 'Công việc';
      case '/customers': return 'Khách hàng';
      case '/payments': return 'Thanh toán';
      case '/settings': return 'Cài đặt';
      default: return '';
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = profile?.full_name
    ? profile.full_name.trim().split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()
    : '?';

  const roleLabel = {
    admin: 'Admin',
    team_lead: 'Trưởng nhóm',
    sales: 'Nhân viên kinh doanh',
  }[profile?.role] || profile?.role || '';

  return (
    <header className="h-[60px] sticky top-0 z-30 w-full bg-white/85 backdrop-blur-md border-b border-[#E3D7C8] shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex justify-between items-center px-6 shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-lg text-[#3F3A33] font-semibold">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-[#8B8375] hover:text-[#C89A3D] hover:bg-[#C89A3D]/10 transition-colors hidden sm:flex">
          <Bell size={18} />
        </button>

        {/* User Dropdown */}
        <div className="relative ml-2" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-[#C89A3D]/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#C89A3D]/20 border border-[#C89A3D]/40 flex items-center justify-center font-semibold text-sm text-[#C89A3D]">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-[#1f1b15] leading-tight">{profile?.full_name || 'Đang tải...'}</p>
              <p className="text-[10px] text-[#8B8375]">{roleLabel}</p>
            </div>
            <ChevronDown size={14} className={`text-[#8B8375] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white border border-[#E3D7C8] rounded-xl shadow-xl py-2 z-50">
              <div className="px-4 py-2.5 border-b border-[#E3D7C8]">
                <p className="text-sm font-medium text-[#1f1b15]">{profile?.full_name}</p>
                <p className="text-xs text-[#8B8375] truncate">{profile?.email}</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-[#C89A3D]/10 text-[#C89A3D] font-medium">
                  {roleLabel}
                </span>
              </div>
              <button
                onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#4f4637] hover:bg-[#f6ece2] transition-colors"
              >
                <User size={15} />
                Cài đặt tài khoản
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
