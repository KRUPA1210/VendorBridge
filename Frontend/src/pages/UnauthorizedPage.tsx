import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-6 font-sans antialiased text-[#0F172A]">
      <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center shadow-lg animate-in fade-in duration-200">
        <div className="w-16 h-16 bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShieldAlert size={32} />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight mb-2">Access restricted</h1>
        
        <p className="text-sm text-[#475569] leading-relaxed mb-8">
          You don't have permission to view this page.
          Contact your administrator if you believe this is an error.
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all duration-150 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10"
        >
          <ArrowLeft size={16} />
          <span>Go back to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
