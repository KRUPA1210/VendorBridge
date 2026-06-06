import React, { useState, useEffect } from 'react';
import ERPLayout from '../components/ERPLayout';
import { getFromStorage, saveToStorage, UserAccount } from '../data/mockData';
import { UserPlus, Search, Shield, X, Mail, Key, ShieldCheck, ShieldAlert, UserX, UserCheck } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Invite Form fields
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'procurement_officer' | 'vendor' | 'manager' | 'admin'>('procurement_officer');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteCompany, setInviteCompany] = useState('');

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setUsers(getFromStorage<UserAccount>('users'));
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const currentUsers = getFromStorage<UserAccount>('users');
    if (currentUsers.some(u => u.email.toLowerCase() === inviteEmail.toLowerCase())) {
      alert('A user with this email address already exists.');
      return;
    }

    const newUser: UserAccount = {
      email: inviteEmail,
      firstName: inviteFirstName || 'New',
      lastName: inviteLastName || 'User',
      role: inviteRole,
      status: 'Active',
      lastLogin: 'Never logged in',
      password: 'password123',
      companyName: inviteRole === 'vendor' ? (inviteCompany || 'Unspecified Vendor') : undefined
    };

    const updated = [...currentUsers, newUser];
    saveToStorage('users', updated);
    setUsers(updated);

    triggerToast(`Invitation sent to ${inviteEmail} (Temporary password: password123)`);
    
    // Reset form
    setInviteEmail('');
    setInviteFirstName('');
    setInviteLastName('');
    setInviteCompany('');
    setInviteRole('procurement_officer');
    setIsInviteModalOpen(false);
  };

  const handleToggleStatus = (email: string) => {
    const currentUsers = getFromStorage<UserAccount>('users');
    const updated = currentUsers.map(u => {
      if (u.email === email) {
        const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        return { ...u, status: nextStatus as 'Active' | 'Inactive' };
      }
      return u;
    });
    saveToStorage('users', updated);
    setUsers(updated);
    const updatedUser = updated.find(u => u.email === email);
    triggerToast(`User status updated to ${updatedUser?.status}`);
  };

  const handleResetPassword = (email: string) => {
    const currentUsers = getFromStorage<UserAccount>('users');
    const updated = currentUsers.map(u => {
      if (u.email === email) {
        return { ...u, password: 'password123' };
      }
      return u;
    });
    saveToStorage('users', updated);
    setUsers(updated);
    triggerToast(`Password reset to "password123" for ${email}`);
  };

  const handleUpdateRole = (email: string, newRole: UserAccount['role']) => {
    const currentUsers = getFromStorage<UserAccount>('users');
    const updated = currentUsers.map(u => {
      if (u.email === email) {
        return { ...u, role: newRole };
      }
      return u;
    });
    saveToStorage('users', updated);
    setUsers(updated);
    setEditingUser(null);
    triggerToast(`User role updated to ${newRole}`);
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'procurement_officer':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'vendor':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'manager':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'admin':
        return 'bg-red-50 text-red-600 border border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'procurement_officer': return 'Procurement Officer';
      case 'vendor': return 'Vendor';
      case 'manager': return 'Manager';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.companyName && u.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <ERPLayout title="User Management" subtitle="Manage team accounts, roles, and access permissions">
      {/* Toast Notification */}
      {toast && (
        <div id="toast-success" className="fixed bottom-5 right-5 z-50 bg-[#0F172A] text-white border border-slate-700 font-sans shadow-2xl rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
          <div className="w-6 h-6 rounded-full bg-[#D1FAE5] text-[#065F46] flex items-center justify-center font-bold text-xs shrink-0">✓</div>
          <p className="text-xs font-bold leading-none">{toast}</p>
        </div>
      )}

      {/* Header toolbar */}
      <div className="flex justify-between items-center bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:border-[#CBD5E1] transition-all select-none">
        <div>
          <h2 className="text-[14px] font-semibold text-[#0F172A] uppercase tracking-wider">Workspace Users</h2>
          <p className="text-xs text-[#475569] mt-0.5">Invite new team members and assign security roles.</p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white py-2 px-4 rounded-lg text-xs font-semibold cursor-pointer shadow flex items-center gap-1.5 transition-all duration-150 active:scale-[0.97]"
        >
          <UserPlus size={14} />
          <span>Invite User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#94A3B8]">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search users by name, email, company..."
            className="w-full bg-[#F4F5F8] border border-[#E2E8F0] rounded-lg py-2 pl-[34px] pr-3 text-sm text-[#0F172A] outline-none focus:border-[#6366F1] focus:bg-white transition-all duration-150"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-medium text-[#475569] whitespace-nowrap">Filter Role:</label>
          <select
            className="bg-white border border-[#E2E8F0] rounded-lg py-2 px-3 text-xs text-[#0F172A] font-semibold outline-none cursor-pointer"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="procurement_officer">Procurement Officer</option>
            <option value="manager">Manager/Approver</option>
            <option value="vendor">Vendor</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse select-none">
            <thead>
              <tr className="bg-[#F4F5F8] border-b border-[#E2E8F0]">
                <th className="py-3 px-5 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Avatar + Name</th>
                <th className="py-3 px-5 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Email Address</th>
                <th className="py-3 px-5 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Role</th>
                <th className="py-3 px-5 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Status</th>
                <th className="py-3 px-5 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Last Login</th>
                <th className="py-3 px-5 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredUsers.map((u) => (
                <tr key={u.email} className="hover:bg-[#F4F5F8] transition-colors h-[60px]">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                        {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[13.5px] font-semibold text-[#0F172A] leading-tight">{u.firstName} {u.lastName}</p>
                        {u.companyName && <span className="text-[10px] text-[#94A3B8] font-semibold block mt-0.5">{u.companyName}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-xs font-mono text-[#475569]">{u.email}</td>
                  <td className="py-3 px-5">
                    {editingUser?.email === u.email ? (
                      <select
                        className="bg-white border border-[#CBD5E1] rounded px-2 py-1 text-xs text-[#0f172a]"
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.email, e.target.value as any)}
                        onBlur={() => setEditingUser(null)}
                        autoFocus
                      >
                        <option value="admin">Admin</option>
                        <option value="procurement_officer">Procurement Officer</option>
                        <option value="manager">Manager</option>
                        <option value="vendor">Vendor</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2.5 py-[3px] rounded-full text-[11px] font-semibold ${getRoleBadgeStyle(u.role)}`}>
                        {getRoleLabel(u.role)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-5">
                    <span className={`badge ${u.status === 'Active' ? 'badge-active' : 'badge-closed'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-xs text-[#475569]">{u.lastLogin}</td>
                  <td className="py-3 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingUser(u)}
                        title="Edit Role"
                        className="w-7 h-7 bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#6366F1] rounded-md flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Shield size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u.email)}
                        title={u.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                        className={`w-7 h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                          u.status === 'Active' 
                            ? 'bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626]' 
                            : 'bg-green-50 hover:bg-green-100 text-green-700'
                        }`}
                      >
                        {u.status === 'Active' ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                      <button
                        onClick={() => handleResetPassword(u.email)}
                        title="Reset Password"
                        className="w-7 h-7 bg-[#F4F5F8] hover:bg-[#EDEEF2] text-[#475569] rounded-md flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Key size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite User Modal */}
      {isInviteModalOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsInviteModalOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-[#E2E8F0] rounded-xl w-full max-w-md shadow-2xl z-50 p-6 animate-fade-slide-up select-none">
            <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0] mb-5">
              <h4 className="text-[14px] font-bold text-[#0F172A] tracking-tight uppercase flex items-center gap-2">
                <UserPlus size={16} className="text-[#6366F1]" />
                <span>Invite Workspace User</span>
              </h4>
              <button onClick={() => setIsInviteModalOpen(false)} className="p-1 rounded-lg text-[#94A3B8] hover:bg-slate-100 transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#0F172A] block">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John"
                    className="w-full bg-[#F4F5F8] border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm text-[#0F172A] outline-none focus:border-[#6366F1] focus:bg-white"
                    value={inviteFirstName}
                    onChange={(e) => setInviteFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#0F172A] block">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Doe"
                    className="w-full bg-[#F4F5F8] border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm text-[#0F172A] outline-none focus:border-[#6366F1] focus:bg-white"
                    value={inviteLastName}
                    onChange={(e) => setInviteLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0F172A] block">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-[#94A3B8] pointer-events-none">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="user@organization.com"
                    className="w-full bg-[#F4F5F8] border border-[#E2E8F0] rounded-lg py-2 pl-[34px] pr-3 text-sm text-[#0F172A] outline-none focus:border-[#6366F1] focus:bg-white"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0F172A] block">Workspace Security Role</label>
                <select
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-sm text-[#0F172A] outline-none"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                >
                  <option value="admin">Administrator</option>
                  <option value="procurement_officer">Procurement Officer</option>
                  <option value="manager">Manager/Approver</option>
                  <option value="vendor">Vendor Representative</option>
                </select>
              </div>

              {inviteRole === 'vendor' && (
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="text-xs font-semibold text-[#0F172A] block">Associated Vendor Entity</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prism Office Supplies Ltd"
                    className="w-full bg-[#F4F5F8] border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm text-[#0F172A] outline-none focus:border-[#6366F1] focus:bg-white"
                    value={inviteCompany}
                    onChange={(e) => setInviteCompany(e.target.value)}
                  />
                </div>
              )}

              <div className="pt-4 border-t border-[#E2E8F0] flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="h-9 px-4 border border-[#E2E8F0] text-[#374151] rounded-lg text-xs font-semibold hover:bg-[#F4F5F8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md transition-all"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </ERPLayout>
  );
}
