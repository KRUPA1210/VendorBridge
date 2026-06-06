import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

interface ERPLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function ERPLayout({ children, title, subtitle }: ERPLayoutProps) {
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Authenticate session on mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('vb_logged_in');
    if (isLoggedIn !== 'true') {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div id="erp-app-frame" className="min-h-screen bg-[#F8FAFC] flex text-[#0F172A] font-sans antialiased">
      {/* Shared Persistent Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main viewport frame */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-[64px] lg:pl-[240px] transition-all duration-300">
        
        {/* Shared Page header bar */}
        <TopHeader
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Dynamic Inner page wrapper bounded to max design density */}
        <main
          id={`page-viewport-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 w-full max-w-7xl mx-auto"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
