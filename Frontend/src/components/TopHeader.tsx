import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Calendar, LogOut, ChevronDown, Shield, Search } from 'lucide-react';

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export default function TopHeader({ title, subtitle, onMenuClick }: TopHeaderProps) {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Load current user dynamically
  const userStr = localStorage.getItem('vb_current_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const name = user ? `${user.firstName} ${user.lastName}` : 'Denish Vekariya';
  const email = user ? user.email : 'officer@vendorbridge.com';
  const role = user?.role || 'procurement_officer';
  const initials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : 'DV';

  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'procurement_officer': return 'Procurement Officer';
      case 'vendor': return 'Vendor';
      case 'manager': return 'Manager';
      case 'admin': return 'Admin';
      default: return r;
    }
  };

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'RFQ-001 requires executive approval comparison sheet', read: false },
    { id: 2, text: 'Quotation QT-2028-001 submitted by Infra Supplies', read: false },
    { id: 3, text: 'Customs cleared for VB-PO-2024-002 shipments', read: true },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    localStorage.setItem('vb_logged_in', 'false');
    localStorage.removeItem('vb_current_user');
    navigate('/login');
  };

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <header
      id="erp-top-header"
      className="h-[56px] bg-white border-b border-[#F1F5F9] px-7 flex items-center justify-between sticky top-0 z-30 select-none"
      style={{ minHeight: '56px' }}
    >
      {/* LEFT: Calendar and date */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            id="btn-sidebar-mobile-toggle"
            onClick={onMenuClick}
            className="p-1 text-[#475569] hover:bg-[#F1F5F9] rounded-lg md:hidden cursor-pointer"
          >
            <Menu size={18} />
          </button>
        )}
        <div className="hidden sm:flex items-center gap-1.5 text-[13px] text-[#64748B]">
          <Calendar size={15} className="text-[#6366F1] shrink-0" />
          <span className="font-medium font-sans">Saturday, June 6, 2026</span>
        </div>
      </div>

      {/* CENTER: Page title and subtitle */}
      <div className="text-center flex-1 flex flex-col items-center">
        <h1 className="text-[18px] md:text-[20px] font-semibold text-[#0F172A] leading-none tracking-tight font-sans">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] md:text-[12px] text-[#94A3B8] font-normal leading-none mt-1 hidden md:block font-sans">
            {subtitle}
          </p>
        )}
      </div>

      {/* RIGHT: Search, Notifications, Avatar */}
      <div className="flex items-center gap-3.5">
        
        {/* Search */}
        <div className="relative">
          <button
            id="btn-header-search"
            onClick={() => setSearchOpen(!searchOpen)}
            className="w-[34px] h-[34px] rounded-lg text-[#64748B] hover:text-[#6366F1] hover:bg-[#F1F5F9] flex items-center justify-center transition-all duration-180 cursor-pointer"
          >
            <Search size={17} />
          </button>

          {searchOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#F1F5F9] p-2 rounded-xl shadow-lg z-50">
              <input
                type="text"
                placeholder="Global ERP Search..."
                className="w-full bg-[#F8FAFC] text-xs border border-[#E2E8F0] rounded-lg p-2 outline-none focus:border-[#6366F1]"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && setSearchOpen(false)}
              />
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            id="btn-bell-notif"
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-[34px] h-[34px] rounded-lg text-[#64748B] hover:text-[#6366F1] hover:bg-[#F1F5F9] flex items-center justify-center transition-all duration-180 cursor-pointer relative hover-bell-swing"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-[8px] right-[8px] w-2 h-2 bg-[#EF4444] rounded-full" />
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#F1F5F9] rounded-xl shadow-lg py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-[#F1F5F9] flex justify-between items-center bg-[#F8FAFC]">
                  <span className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">Procurement Alerts</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-semibold text-[#6366F1] hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="divide-y divide-[#F1F5F9] max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs flex gap-2.5 hover:bg-[#F8FAFC] transition-colors ${
                        n.read ? 'text-[#94A3B8]' : 'text-[#475569] bg-[#E0E7FF]/10'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${n.read ? 'bg-transparent' : 'bg-[#6366F1]'}`} />
                      <p className="leading-snug">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-[24px] bg-[#E2E8F0]" />

        {/* Dynamic User avatar dropdown */}
        <div className="relative">
          <button
            id="btn-profile-dropdown"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
          >
            <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs select-none shadow-sm shrink-0">
              {initials}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-[13px] font-medium text-[#0F172A] leading-none">{name}</p>
              <span className="text-[11px] text-[#94A3B8] mt-0.5 block">{getRoleLabel(role)}</span>
            </div>
            <ChevronDown size={14} className="text-[#94A3B8] transition-transform duration-200 group-hover:text-[#475569] shrink-0" />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#F1F5F9] rounded-xl shadow-lg py-2 z-40 select-none animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 bg-[#F8FAFC] border-b border-[#F1F5F9] rounded-t-xl mb-1">
                  <p className="text-xs font-semibold text-[#0F172A]">{name}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5 truncate">{email}</p>
                </div>
                <div className="px-2">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs text-[#475569]">
                    <Shield size={14} className="text-[#6366F1]" />
                    <span>Role: {getRoleLabel(role)}</span>
                  </div>
                  <button
                    id="btn-dropdown-logout"
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-[#EF4444] hover:bg-[#FEE2E2]/30 rounded-lg cursor-pointer transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
