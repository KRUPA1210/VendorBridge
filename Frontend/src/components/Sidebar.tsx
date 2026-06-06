import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FileSearch,
  FileText,
  BadgeCheck,
  ShoppingBag,
  Activity,
  BarChart3,
  GitCompare,
  LifeBuoy,
  Settings2,
  Layers,
  LogOut,
  ChevronLeft,
  Users,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate();

  // Load current user from session storage
  const userStr = localStorage.getItem('vb_current_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role || 'procurement_officer';
  const name = user ? `${user.firstName} ${user.lastName}` : 'Denish V.';
  const initials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : 'DV';

  const handleLogout = () => {
    localStorage.setItem('vb_logged_in', 'false');
    localStorage.removeItem('vb_current_user');
    navigate('/login');
  };

  // Build navigation lists based on role
  const getNavConfig = () => {
    if (role === 'vendor') {
      return {
        sections: [
          {
            label: 'Procurement ERP',
            items: [
              { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
              { name: 'My RFQs', icon: FileSearch, path: '/rfq-create' },
              { name: 'Submit Quotation', icon: FileText, path: '/quotation-submit' },
              { name: 'My Orders', icon: ShoppingBag, path: '/po-invoice' },
              { name: 'Activity', icon: Activity, path: '/activity-logs' },
            ]
          }
        ],
        bottom: [
          { name: 'Support', icon: LifeBuoy, path: '/support' }
        ]
      };
    }

    if (role === 'manager') {
      return {
        sections: [
          {
            label: 'Procurement ERP',
            items: [
              { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
              { name: 'Compare Qts', icon: GitCompare, path: '/quotation-compare' },
              { name: 'Approvals', icon: BadgeCheck, path: '/approval' },
              { name: 'PO & Invoice', icon: ShoppingBag, path: '/po-invoice' },
              { name: 'Activity Logs', icon: Activity, path: '/activity-logs' },
              { name: 'Reports', icon: BarChart3, path: '/reports' },
            ]
          }
        ],
        bottom: [
          { name: 'Support', icon: LifeBuoy, path: '/support' }
        ]
      };
    }

    if (role === 'admin') {
      return {
        sections: [
          {
            label: 'Procurement ERP',
            items: [
              { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
              { name: 'Vendors', icon: Building2, path: '/vendors' },
              { name: 'RFQ Mgmt', icon: FileSearch, path: '/rfq-create' },
              { name: 'Quotations', icon: FileText, path: '/quotation-submit' },
              { name: 'Compare Qts', icon: GitCompare, path: '/quotation-compare' },
              { name: 'Approvals', icon: BadgeCheck, path: '/approval' },
              { name: 'PO & Invoice', icon: ShoppingBag, path: '/po-invoice' },
              { name: 'Activity Logs', icon: Activity, path: '/activity-logs' },
              { name: 'Reports', icon: BarChart3, path: '/reports' },
            ]
          },
          {
            label: 'Administration',
            items: [
              { name: 'User Management', icon: Users, path: '/admin/users' },
              { name: 'System Settings', icon: Settings2, path: '/admin/users#settings' }, // redirect settings to anchor in user page
              { name: 'Audit Controls', icon: ShieldAlert, path: '/activity-logs' }, // maps to activity logs
            ]
          }
        ],
        bottom: [
          { name: 'Settings', icon: Settings2, path: '/settings' },
          { name: 'Support', icon: LifeBuoy, path: '/support' }
        ]
      };
    }

    // Default: Procurement Officer
    return {
      sections: [
        {
          label: 'Procurement ERP',
          items: [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
            { name: 'Vendors', icon: Building2, path: '/vendors' },
            { name: 'RFQ Mgmt', icon: FileSearch, path: '/rfq-create' },
            { name: 'Quotations', icon: FileText, path: '/quotation-submit' },
            { name: 'Compare Qts', icon: GitCompare, path: '/quotation-compare' },
            { name: 'Approvals', icon: BadgeCheck, path: '/approval' },
            { name: 'PO & Invoice', icon: ShoppingBag, path: '/po-invoice' },
            { name: 'Activity Logs', icon: Activity, path: '/activity-logs' },
            { name: 'Reports', icon: BarChart3, path: '/reports' },
          ]
        }
      ],
      bottom: [
        { name: 'Settings', icon: Settings2, path: '/settings' },
        { name: 'Support', icon: LifeBuoy, path: '/support' }
      ]
    };
  };

  const navConfig = getNavConfig();

  const getRoleLabel = () => {
    switch (role) {
      case 'procurement_officer': return 'Procurement Officer';
      case 'vendor': return 'Vendor';
      case 'manager': return 'Manager';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 bg-[#0F1117] z-40 flex flex-col justify-between transition-all duration-300 select-none border-r-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 w-[240px] md:w-[64px] lg:w-[240px] h-screen`}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto scrollbar-hidden">
          {/* LOGO & TITLE HEADER */}
          <div className="p-[20px_16px_16px] border-b border-white/5 flex flex-col gap-1.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] rounded-lg flex items-center justify-center shadow-sm shrink-0">
                <Layers size={16} className="text-white fill-white/10" />
              </div>
              <span className="font-semibold text-[15px] text-white tracking-tight md:hidden lg:block">
                VendorBridge
              </span>
            </div>
          </div>

          {/* DYNAMIC NAV SECTIONS */}
          <div className="py-4 space-y-6">
            {navConfig.sections.map((section, secIdx) => (
              <div key={secIdx} className="space-y-0.5">
                <p className="text-[9px] font-bold text-[#4B5563] uppercase tracking-[0.08em] p-[0_20px_6px] select-none md:hidden lg:block pointer-events-none">
                  {section.label}
                </p>
                {section.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={onMobileClose}
                    id={`sidebar-link-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    className={({ isActive }) =>
                      `flex items-center h-10 mx-2 px-3 rounded-lg text-[13px] transition-all duration-150 ease-in-out group ${
                        isActive
                          ? 'bg-[#6366F1] text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)] font-semibold'
                          : 'text-[#9CA3AF] hover:bg-[#181C2A] hover:text-[#FFFFFF] hover:translate-x-[2px]'
                      }`
                    }
                  >
                    {({ isActive }) => {
                      const Icon = item.icon;
                      return (
                        <>
                          <Icon
                            size={18}
                            className={`shrink-0 mr-2.5 transition-colors duration-150 ${
                              isActive ? 'text-white' : 'text-[#64748B] group-hover:text-[#C7D2FE]'
                            }`}
                          />
                          <span className="truncate md:hidden lg:block">{item.name}</span>
                          <span className="sr-only">{item.name}</span>
                        </>
                      );
                    }}
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM UTILITY LINKS & PROFILE CLIENT */}
        <div className="border-t border-white/5 shrink-0 bg-[#0F1117]">
          <div className="py-2 space-y-0.5">
            {navConfig.bottom.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center h-10 mx-2 px-3 rounded-lg text-[13px] transition-all duration-150 ease-in-out group ${
                    isActive
                      ? 'bg-[#6366F1] text-white font-semibold'
                      : 'text-[#9CA3AF] hover:bg-[#181C2A] hover:text-[#FFFFFF]'
                  }`
                }
              >
                {({ isActive }) => {
                  const Icon = item.icon;
                  return (
                    <>
                      <Icon
                        size={18}
                        className={`shrink-0 mr-2.5 transition-colors duration-150 ${
                          isActive ? 'text-white' : 'text-[#64748B] group-hover:text-[#C7D2FE]'
                        }`}
                      />
                      <span className="truncate md:hidden lg:block">{item.name}</span>
                    </>
                  );
                }}
              </NavLink>
            ))}
          </div>

          {/* Collapse Toggle Button (Standard sidebar element) */}
          <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between md:hidden lg:flex select-none text-[#4B5563]">
            <span className="text-[9px] uppercase tracking-wider text-[#4B5563] font-bold">Standard Layout</span>
            <button
              className="text-[#4B5563] hover:text-[#9CA3AF] transition-colors duration-150 cursor-pointer"
              title="Collapse Panel"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-3 border-t border-white/5 bg-white/[0.01] hover:bg-white/[0.03] rounded-lg transition-all duration-150 m-2 md:hidden lg:block">
            <div className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-[13px] shrink-0 select-none shadow-sm">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-white truncate">{name}</p>
                <p className="text-[11px] text-[#9CA3AF] truncate">{getRoleLabel()}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1 px-1.5 text-[#9CA3AF] hover:text-[#EF4444] rounded cursor-pointer shrink-0 transition-colors"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>

          {/* User Profile Mini - Collapsed for tablet */}
          <div className="p-3 border-t border-white/5 hidden md:block lg:hidden text-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs mx-auto select-none shadow-sm">
              {initials}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
