import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Layers, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiCall } from '../api/apiClient';

export default function VerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      refs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { 
      setError('Please enter all 6 digits'); 
      return; 
    }
    
    setLoading(true); 
    setError('');
    
    try {
      await apiCall('/auth/verify-user', 'POST', { email, code });
      setSuccess('Account verified! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setSuccess('');
    try {
      await apiCall('/auth/forgot-password', 'POST', { email }); // reusing endpoint as in provided code
      setCountdown(60);
      setSuccess('A new code has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F9FC] to-[#EFF6FF] font-sans antialiased text-[#0F172A] p-4">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.04)] p-10 text-center relative overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#6366F1] to-[#4F46E5]" />

        <div className="w-16 h-16 bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShieldCheck size={28} className="text-[#6366F1]" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] rounded flex items-center justify-center shadow-sm">
            <Layers size={14} className="text-white fill-white/10" />
          </div>
          <span className="font-bold text-[14px] tracking-tight uppercase text-[#0F172A]">VendorBridge</span>
        </div>

        <h2 className="text-[24px] font-bold tracking-tight text-[#0F172A] mb-2">Verify your email</h2>
        <p className="text-[14px] text-[#64748B] mb-8 leading-relaxed">
          We sent a 6-digit code to<br />
          <strong className="text-[#0F172A] font-semibold">{email}</strong>
        </p>

        {error && (
          <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded-lg text-xs font-medium mb-6 text-left animate-in fade-in duration-150">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] rounded-lg text-xs font-medium mb-6 text-left animate-in fade-in duration-150">
            {success}
          </div>
        )}

        {/* OTP inputs */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-8" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => refs.current[i] = el}
              value={digit}
              onChange={e => handleOtpChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              maxLength={1}
              type="text"
              inputMode="numeric"
              className={`w-12 h-14 border-2 ${digit ? 'border-[#6366F1] bg-[#EFF6FF]' : 'border-[#E2E8F0] bg-white'} rounded-xl text-center text-xl font-bold text-[#0F172A] outline-none focus:border-[#6366F1] focus:ring-4 focus:ring-indigo-600/10 transition-all font-mono`}
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          className={`w-full ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-[#6366F1] hover:bg-[#4F46E5] active:scale-[0.98] cursor-pointer'} text-white font-semibold py-3 rounded-xl text-sm transition-all duration-150 flex items-center justify-center shadow-md shadow-indigo-600/10 mb-6`}
        >
          {loading ? 'Verifying...' : 'Verify Account'}
        </button>

        <div className="mb-6">
          {countdown > 0 ? (
            <p className="text-[13px] text-[#94A3B8]">
              Resend code in <strong className="text-[#475569]">{countdown}s</strong>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="bg-transparent border-none text-[#6366F1] text-[13px] font-semibold cursor-pointer hover:underline"
            >
              {resending ? 'Sending...' : 'Resend code'}
            </button>
          )}
        </div>

        <div>
          <Link to="/login" className="text-[13px] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center gap-1.5 transition-colors">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
