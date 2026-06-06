import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layers, Mail, Lock, Eye, EyeOff, X, KeyRound } from 'lucide-react';
import { getFromStorage, saveToStorage, UserAccount } from '../data/mockData';
import { authApi } from '../api/authApi';

export default function LoginPage() {
  const navigate = useNavigate();
  
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation and error states
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password flow
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const isNetworkError = (err: any) =>
    err?.code === 'ERR_NETWORK' ||
    err?.message?.includes('Failed to fetch') ||
    err?.message?.includes('NetworkError');

  const openForgotModal = () => {
    setShowForgotModal(true);
    setForgotStep('request');
    setForgotEmail(email.trim());
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
    setForgotSuccess('');
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep('request');
    setForgotError('');
    setForgotSuccess('');
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address.');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      await authApi.forgotPassword(forgotEmail.trim());
      setForgotSuccess('Password reset code sent! Check your email for a 6-digit code.');
      setForgotStep('reset');
    } catch (err: any) {
      if (isNetworkError(err)) {
        const users = getFromStorage<UserAccount>('users');
        const matched = users.find(u => u.email.toLowerCase() === forgotEmail.trim().toLowerCase());
        if (matched) {
          setForgotSuccess('Backend offline — demo mode: use any 6-digit code on the next step.');
          setForgotStep('reset');
        } else {
          setForgotError('Backend offline — no account found for that email in demo data.');
        }
      } else {
        setForgotError(err?.response?.data?.message || err?.message || 'Failed to send reset code.');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (resetCode.trim().length !== 6) {
      setForgotError('Please enter the 6-digit reset code from your email.');
      return;
    }
    if (!newPassword.trim()) {
      setForgotError('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);

    try {
      await authApi.resetPassword(resetCode.trim(), newPassword);
      closeForgotModal();
      setSuccessMessage('Password reset successful! Sign in with your new password.');
      setPassword('');
    } catch (err: any) {
      if (isNetworkError(err)) {
        const users = getFromStorage<UserAccount>('users');
        const idx = users.findIndex(u => u.email.toLowerCase() === forgotEmail.trim().toLowerCase());
        if (idx === -1) {
          setForgotError('Backend offline — account not found in demo data.');
        } else if (resetCode.trim().length !== 6) {
          setForgotError('Invalid reset code.');
        } else {
          const updated = [...users];
          updated[idx] = { ...updated[idx], password: newPassword };
          saveToStorage('users', updated);
          closeForgotModal();
          setSuccessMessage('Password reset successful (demo mode)! Sign in with your new password.');
          setPassword('');
        }
      } else {
        setForgotError(err?.response?.data?.message || err?.message || 'Failed to reset password.');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string; general?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'This field is required';
    }
    if (!password.trim()) {
      newErrors.password = 'This field is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Try real backend first
      const response = await authApi.login({ email, password });
      const roleStr = response.data.role || 'PROCUREMENT_OFFICER';
      const role = roleStr.toUpperCase() === 'PROCUREMENT_OFFICER' ? 'procurement_officer' :
                   roleStr.toUpperCase() === 'MANAGER' ? 'manager' :
                   roleStr.toUpperCase() === 'VENDOR' ? 'vendor' :
                   roleStr.toUpperCase() === 'ADMIN' ? 'admin' : 'procurement_officer';

      const user: UserAccount = {
        email: email,
        firstName: response.data.userName || email.split('@')[0],
        lastName: '',
        role: role as 'procurement_officer' | 'vendor' | 'manager' | 'admin',
        status: 'Active',
        lastLogin: new Date().toLocaleString()
      };

      // Set mock login flags and save current user
      localStorage.setItem('vb_logged_in', 'true');
      localStorage.setItem('vb_current_user', JSON.stringify(user));

      // Role-based redirects
      switch (user.role) {
        case 'procurement_officer':
          navigate('/dashboard');
          break;
        case 'vendor':
          navigate('/dashboard');
          break;
        case 'manager':
          navigate('/approval');
          break;
        case 'admin':
          navigate('/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (err: any) {
      // Backend offline — use mock credentials for development
      if (isNetworkError(err)) {
        console.warn('[Mock Fallback] Backend is unreachable. Using mock authentication.');

        const users = getFromStorage<UserAccount>('users');
        const matched = users.find(
          u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
        );

        if (matched) {
          localStorage.setItem('vb_logged_in', 'true');
          localStorage.setItem('vb_current_user', JSON.stringify({
            ...matched,
            lastLogin: new Date().toLocaleString(),
          }));
          switch (matched.role) {
            case 'manager':
              navigate('/approval');
              break;
            default:
              navigate('/dashboard');
          }
        } else {
          setErrors({
            general: 'Backend offline — try officer@vendorbridge.com / password123',
          });
        }
      } else {
        const errorMsg = err?.response?.data?.message || err?.message || 'Invalid email or password. Please try again.';
        setErrors({ general: errorMsg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans antialiased text-[#0F172A]">
      
      {/* Left 45% Brand Panel */}
      <div 
        className="hidden md:flex md:w-[45%] bg-[#0F1117] text-white p-12 flex-col justify-between relative overflow-hidden select-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Top-Left VendorBridge Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] rounded-xl flex items-center justify-center shadow-sm">
            <Layers size={20} className="text-white fill-white/10" />
          </div>
          <span className="font-bold text-[18px] tracking-tight uppercase">VendorBridge</span>
        </div>

        {/* Center Headline */}
        <div className="space-y-6 max-w-md">
          <h2 className="text-[40px] font-bold leading-[1.15] tracking-tight text-white">
            Procurement,<br />simplified.
          </h2>
          <p className="text-[#94A3B8] text-[15px] leading-relaxed">
            Manage vendors, RFQs, approvals, and invoices — all in one place.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-2.5 pt-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2130] text-[12px] font-medium rounded-full text-[#E2E8F0] border border-white/5">
            ✦ Vendor Management
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2130] text-[12px] font-medium rounded-full text-[#E2E8F0] border border-white/5">
            ✦ RFQ Workflows
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2130] text-[12px] font-medium rounded-full text-[#E2E8F0] border border-white/5">
            ✦ Smart Approvals
          </span>
        </div>
      </div>

      {/* Right 55% Login Form Panel */}
      <div className="w-full md:w-[55%] flex flex-col justify-between p-8 sm:p-12 relative">
        
        {/* Top-Right Register Link */}
        <div className="text-right">
          <span className="text-xs text-[#475569] mr-1.5">Don't have an account?</span>
          <Link
            id="link-register"
            to="/register"
            className="text-xs font-semibold text-[#6366F1] hover:text-[#4F46E5] hover:underline"
          >
            Register →
          </Link>
        </div>

        {/* Center Login Form */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-10 space-y-8">
          <div>
            <h3 className="text-[28px] font-bold tracking-tight text-[#0F172A]">Welcome back</h3>
            <p className="text-xs text-[#94A3B8] font-medium mt-1.5">
              Sign in to your VendorBridge workspace
            </p>
          </div>

          {errors.general && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded-lg text-xs font-medium animate-in fade-in duration-150">
              {errors.general}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] rounded-lg text-xs font-medium animate-in fade-in duration-150">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[#475569] block">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-[#94A3B8] pointer-events-none">
                  <Mail size={16} />
                </span>
                <input
                  id="login-username"
                  type="email"
                  placeholder="name@company.com"
                  className={`w-full bg-[#F4F5F8] border ${
                    errors.email ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                  } rounded-lg py-2.5 pl-[38px] pr-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#6366F1] focus:bg-white outline-none transition-all duration-150`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                    if (errors.general) setErrors({ ...errors, general: undefined });
                    if (successMessage) setSuccessMessage('');
                  }}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-[#DC2626] font-medium mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[13px] font-semibold text-[#475569] block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={openForgotModal}
                  className="text-xs font-semibold text-[#6366F1] hover:text-[#4F46E5] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-[#94A3B8] pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full bg-[#F4F5F8] border ${
                    errors.password ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                  } rounded-lg py-2.5 pl-[38px] pr-10 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#6366F1] focus:bg-white outline-none transition-all duration-150`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                    if (errors.general) setErrors({ ...errors, general: undefined });
                    if (successMessage) setSuccessMessage('');
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-[#94A3B8] hover:text-[#475569] cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-[#DC2626] font-medium mt-1">{errors.password}</p>
              )}
            </div>

            {/* Sign In Button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading}
              className={`w-full ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-[#6366F1] hover:bg-[#4F46E5] active:scale-[0.98] cursor-pointer'} text-white font-semibold py-2.5 rounded-lg text-sm transition-all duration-150 flex items-center justify-center shadow-md shadow-indigo-600/10`}
              style={{ height: '42px' }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer copyright */}
        <div className="text-[11px] text-[#94A3B8] text-center select-none">
          © 2026 VendorBridge ERP Software Platform, Inc. All rights reserved.
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-6 relative animate-in fade-in duration-150">
            <button
              type="button"
              onClick={closeForgotModal}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#475569] cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <KeyRound size={18} className="text-[#6366F1]" />
              <h4 className="text-lg font-bold text-[#0F172A]">
                {forgotStep === 'request' ? 'Reset your password' : 'Enter reset code'}
              </h4>
            </div>
            <p className="text-xs text-[#64748B] mb-5">
              {forgotStep === 'request'
                ? 'Enter your account email and we will send you a 6-digit reset code.'
                : `Enter the code sent to ${forgotEmail} and choose a new password.`}
            </p>

            {forgotError && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded-lg text-xs font-medium mb-4">
                {forgotError}
              </div>
            )}
            {forgotSuccess && (
              <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] rounded-lg text-xs font-medium mb-4">
                {forgotSuccess}
              </div>
            )}

            {forgotStep === 'request' ? (
              <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-[#475569] block">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-[#94A3B8] pointer-events-none">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      className="w-full bg-[#F4F5F8] border border-[#E2E8F0] rounded-lg py-2.5 pl-[38px] pr-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#6366F1] focus:bg-white outline-none transition-all"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className={`w-full ${forgotLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-[#6366F1] hover:bg-[#4F46E5] cursor-pointer'} text-white font-semibold py-2.5 rounded-lg text-sm transition-all`}
                >
                  {forgotLoading ? 'Sending...' : 'Send reset code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-[#475569] block">6-digit reset code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    className="w-full bg-[#F4F5F8] border border-[#E2E8F0] rounded-lg py-2.5 px-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#6366F1] focus:bg-white outline-none transition-all font-mono tracking-widest text-center"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-[#475569] block">New password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-[#F4F5F8] border border-[#E2E8F0] rounded-lg py-2.5 px-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#6366F1] focus:bg-white outline-none transition-all"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-[#475569] block">Confirm password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-[#F4F5F8] border border-[#E2E8F0] rounded-lg py-2.5 px-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#6366F1] focus:bg-white outline-none transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep('request');
                      setForgotError('');
                      setForgotSuccess('');
                    }}
                    className="flex-1 border border-[#E2E8F0] text-[#475569] font-semibold py-2.5 rounded-lg text-sm hover:bg-slate-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className={`flex-1 ${forgotLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-[#6366F1] hover:bg-[#4F46E5] cursor-pointer'} text-white font-semibold py-2.5 rounded-lg text-sm transition-all`}
                  >
                    {forgotLoading ? 'Resetting...' : 'Reset password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
