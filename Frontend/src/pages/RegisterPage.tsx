import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layers, Mail, Phone, Shield, User, Camera, ArrowRight, Building2, MapPin, BadgePercent, Lock } from 'lucide-react';
import { getFromStorage, saveToStorage, UserAccount } from '../data/mockData';
import { apiCall } from '../api/apiClient';

export default function RegisterPage() {
  const navigate = useNavigate();
  
  // Account Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'procurement_officer' | 'vendor' | 'manager' | 'admin'>('procurement_officer');
  
  // Vendor Specific Fields
  const [companyName, setCompanyName] = useState('');
  const [gstNo, setGstNo] = useState('');
  const [category, setCategory] = useState('IT Hardware');
  const [address, setAddress] = useState('');

  // Password fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Optional profile image
  const [avatar, setAvatar] = useState<string | null>(null);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(URL.createObjectURL(file));
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { label: '', color: 'bg-slate-200', width: 'w-0' };
    if (password.length < 5) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/3' };
    if (password.length < 8) return { label: 'Medium', color: 'bg-amber-500', width: 'w-2/3' };
    return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  const validateGST = (gst: string) => {
    // Standard Indian GSTIN format: 2 digits, 5 letters, 4 digits, 1 letter, 1 digit/letter, 'Z', 1 digit/letter
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
    return regex.test(gst.trim());
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Basic fields validation
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';

    // Vendor fields validation
    if (role === 'vendor') {
      if (!companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!gstNo.trim()) {
        newErrors.gstNo = 'GST number is required';
      } else if (!validateGST(gstNo)) {
        newErrors.gstNo = 'Invalid GST format (e.g. 27AAAAA1111A1Z1)';
      }
      if (!address.trim()) newErrors.address = 'Company address is required';
    }

    // Passwords validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 5) {
      newErrors.password = 'Password must be at least 5 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Check email duplication
    const currentUsers = getFromStorage<UserAccount>('users');
    if (currentUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      newErrors.email = 'Email already exists';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to top of form panel if there are errors
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await apiCall('/auth/create', 'POST', {
        userName: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
        email: email.trim(),
        password: password,
        phoneNo: phoneNumber.trim(),
        country: 'India', // Defaulting based on provided code
        roles: [role.toUpperCase()],
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      // Save vendor to vendors catalog locally (since we don't have a vendor API yet)
      if (role === 'vendor') {
        const currentVendors = getFromStorage<any>('vendors');
        const newVendor = {
          id: `VEN-${String(currentVendors.length + 1).padStart(3, '0')}`,
          name: companyName.trim(),
          gstNo: gstNo.trim().toUpperCase(),
          category: category,
          contactPhone: phoneNumber.trim(),
          contactEmail: email.trim(),
          status: 'Pending', // Awaiting Admin Approval
          rating: 4.0,
          initials: companyName.substring(0, 2).toUpperCase()
        };
        saveToStorage('vendors', [newVendor, ...currentVendors]);
      }

      // Navigate to verification page
      navigate('/verify', { state: { email: email.trim() } });
    } catch (err: any) {
      setErrors({ general: err.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength();

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

      {/* Right 55% Form Panel */}
      <div className="w-full md:w-[55%] flex flex-col justify-between p-8 sm:p-12 overflow-y-auto">
        
        {/* Top-Right Login Link */}
        <div className="text-right mb-6">
          <span className="text-xs text-[#475569] mr-1.5">Already have an account?</span>
          <Link
            id="link-login"
            to="/login"
            className="text-xs font-semibold text-[#6366F1] hover:text-[#4F46E5] hover:underline"
          >
            Sign in →
          </Link>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-[500px] mx-auto my-auto space-y-6">
          <div>
            <h3 className="text-[26px] font-bold tracking-tight text-[#0F172A]">Create your account</h3>
            <p className="text-xs text-[#94A3B8] font-medium mt-1">
              Join your organization's VendorBridge workspace
            </p>
          </div>

          {errors.general && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded-lg text-xs font-medium animate-in fade-in duration-150">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Profile Photo upload */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="register-avatar-upload"
                />
                <label
                  htmlFor="register-avatar-upload"
                  className="w-16 h-16 rounded-full border-2 border-dashed border-[#E2E8F0] bg-[#F4F5F8] flex flex-col items-center justify-center cursor-pointer group-hover:border-[#6366F1] group-hover:bg-white overflow-hidden transition-all shadow-inner"
                >
                  {avatar ? (
                    <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera size={18} className="text-[#94A3B8] group-hover:text-[#6366F1]" />
                      <span className="text-[9px] text-[#94A3B8] font-semibold mt-0.5 group-hover:text-[#6366F1]">Upload</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Row 1: First Name / Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#475569]">First Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-[#94A3B8] pointer-events-none">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    id="register-firstname"
                    placeholder="Denish"
                    className={`w-full bg-[#F4F5F8] border ${
                      errors.firstName ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                    } rounded-lg py-2 pl-[34px] pr-3 text-sm text-[#0F172A] focus:border-[#6366F1] focus:bg-white outline-none transition-all`}
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (errors.firstName) setErrors({ ...errors, firstName: undefined });
                    }}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-[11px] text-[#DC2626] font-medium mt-0.5">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#475569]">Last Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-[#94A3B8] pointer-events-none">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    id="register-lastname"
                    placeholder="Vekariya"
                    className={`w-full bg-[#F4F5F8] border ${
                      errors.lastName ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                    } rounded-lg py-2 pl-[34px] pr-3 text-sm text-[#0F172A] focus:border-[#6366F1] focus:bg-white outline-none transition-all`}
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (errors.lastName) setErrors({ ...errors, lastName: undefined });
                    }}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-[11px] text-[#DC2626] font-medium mt-0.5">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Row 2: Email / Phone Number */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#475569]">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-[#94A3B8] pointer-events-none">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    id="register-email"
                    placeholder="name@company.com"
                    className={`w-full bg-[#F4F5F8] border ${
                      errors.email ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                    } rounded-lg py-2 pl-[34px] pr-3 text-sm text-[#0F172A] focus:border-[#6366F1] focus:bg-white outline-none transition-all`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-[#DC2626] font-medium mt-0.5">{errors.email}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#475569]">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-[#94A3B8] pointer-events-none">
                    <Phone size={14} />
                  </span>
                  <input
                    type="text"
                    id="register-phone"
                    placeholder="+91 98765 43210"
                    className={`w-full bg-[#F4F5F8] border ${
                      errors.phoneNumber ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                    } rounded-lg py-2 pl-[34px] pr-3 text-sm text-[#0F172A] focus:border-[#6366F1] focus:bg-white outline-none transition-all`}
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: undefined });
                    }}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-[11px] text-[#DC2626] font-medium mt-0.5">{errors.phoneNumber}</p>
                )}
              </div>
            </div>

            {/* Row 3: Role Selector dropdown */}
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[#475569]">Workplace Role</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-[#94A3B8] pointer-events-none">
                  <Shield size={14} />
                </span>
                <select
                  id="register-role"
                  className="w-full bg-[#F4F5F8] border border-[#E2E8F0] rounded-lg py-2 pl-[34px] pr-8 text-sm text-[#0F172A] focus:border-[#6366F1] focus:bg-white outline-none appearance-none cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                >
                  <option value="procurement_officer">Procurement Officer</option>
                  <option value="vendor">Vendor</option>
                  <option value="manager">Manager/Approver</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Conditionally Render Vendor Details section */}
            {role === 'vendor' && (
              <div className="p-4 border border-[#E2E8F0] rounded-xl bg-[#F8F9FC] space-y-3.5 animate-in fade-in duration-200">
                <div className="text-xs font-bold text-[#6366F1] uppercase tracking-wider select-none">
                  ─── Vendor Details ───
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-semibold text-[#475569]">Company/Organization Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-[#94A3B8]">
                      <Building2 size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Prism Office Supplies Ltd"
                      className={`w-full bg-white border ${
                        errors.companyName ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                      } rounded-lg py-2 pl-[34px] pr-3 text-sm text-[#0F172A] focus:border-[#6366F1] outline-none`}
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value);
                        if (errors.companyName) setErrors({ ...errors, companyName: undefined });
                      }}
                    />
                  </div>
                  {errors.companyName && (
                    <p className="text-[11px] text-[#DC2626] font-medium mt-0.5">{errors.companyName}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[12px] font-semibold text-[#475569]">GST Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-[#94A3B8]">
                        <BadgePercent size={14} />
                      </span>
                      <input
                        type="text"
                        maxLength={15}
                        placeholder="27AAAAA1111A1Z1"
                        className={`w-full bg-white border ${
                          errors.gstNo ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                        } rounded-lg py-2 pl-[34px] pr-3 text-sm text-[#0F172A] focus:border-[#6366F1] outline-none font-mono uppercase`}
                        value={gstNo}
                        onChange={(e) => {
                          setGstNo(e.target.value);
                          if (errors.gstNo) setErrors({ ...errors, gstNo: undefined });
                        }}
                      />
                    </div>
                    {errors.gstNo && (
                      <p className="text-[11px] text-[#DC2626] font-medium mt-0.5">{errors.gstNo}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[12px] font-semibold text-[#475569]">Business Category</label>
                    <select
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#0F172A] outline-none cursor-pointer"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="IT Hardware">IT Hardware</option>
                      <option value="Office Supplies">Office Supplies</option>
                      <option value="Professional Services">Professional Services</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Stationery">Stationery</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-semibold text-[#475569]">Company Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-[#94A3B8]">
                      <MapPin size={14} />
                    </span>
                    <textarea
                      rows={2}
                      placeholder="Enter full physical address..."
                      className={`w-full bg-white border ${
                        errors.address ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                      } rounded-lg p-2 pl-[34px] text-sm text-[#0F172A] focus:border-[#6366F1] outline-none resize-none`}
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) setErrors({ ...errors, address: undefined });
                      }}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-[11px] text-[#DC2626] font-medium mt-0.5">{errors.address}</p>
                  )}
                </div>
              </div>
            )}

            {/* Row 4: Password / Confirm Password */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#475569]">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-[#94A3B8]">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className={`w-full bg-[#F4F5F8] border ${
                      errors.password ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                    } rounded-lg py-2 pl-[34px] pr-3 text-sm text-[#0F172A] focus:border-[#6366F1] focus:bg-white outline-none transition-all`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                  />
                </div>
                {errors.password && (
                  <p className="text-[11px] text-[#DC2626] font-medium mt-0.5">{errors.password}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#475569]">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-[#94A3B8]">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className={`w-full bg-[#F4F5F8] border ${
                      errors.confirmPassword ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                    } rounded-lg py-2 pl-[34px] pr-3 text-sm text-[#0F172A] focus:border-[#6366F1] focus:bg-white outline-none transition-all`}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                    }}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-[#DC2626] font-medium mt-0.5">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <div className="flex justify-between items-center text-[11px] font-semibold text-[#475569]">
                  <span>Password strength:</span>
                  <span className={
                    passwordStrength.label === 'Weak' ? 'text-red-500' :
                    passwordStrength.label === 'Medium' ? 'text-amber-500' :
                    'text-emerald-500'
                  }>{passwordStrength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${passwordStrength.color} ${passwordStrength.width} transition-all duration-300`} />
                </div>
              </div>
            )}

            {/* Submit Register Button */}
            <button
              id="btn-register-submit"
              type="submit"
              disabled={isLoading}
              className={`w-full ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-[#6366F1] hover:bg-[#4F46E5] active:scale-[0.98] cursor-pointer'} text-white font-semibold py-2.5 rounded-lg text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10`}
              style={{ height: '42px' }}
            >
              <span>{isLoading ? 'Creating account...' : 'Register Account'}</span>
              {!isLoading && <ArrowRight size={15} />}
            </button>
          </form>
        </div>

        {/* Footer copyright */}
        <div className="text-[11px] text-[#94A3B8] text-center mt-6 select-none">
          © 2026 VendorBridge ERP Software Platform, Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}
