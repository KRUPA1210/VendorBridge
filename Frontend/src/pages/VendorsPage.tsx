import React, { useState, useEffect } from 'react';
import ERPLayout from '../components/ERPLayout';
import StatusBadge from '../components/StatusBadge';
import { getFromStorage, saveToStorage, Vendor, ActivityLog } from '../data/mockData';
import { Search, UserPlus, Eye, Pencil, Trash2, Building2, Star, X } from 'lucide-react';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Pending' | 'Blocked'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendorForView, setSelectedVendorForView] = useState<Vendor | null>(null);

  // Form Fields setup
  const [name, setName] = useState('');
  const [gstNo, setGstNo] = useState('');
  const [category, setCategory] = useState<Vendor['category']>('IT Hardware');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load from Storage
  useEffect(() => {
    setVendors(getFromStorage<Vendor>('vendors'));
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Company Name is required.';
    if (!gstNo.trim()) newErrors.gstNo = 'GST Number is required.';
    if (!email.trim()) newErrors.email = 'Contact Email is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const currentVendors = getFromStorage<Vendor>('vendors');
    const newID = `VEN-${String(currentVendors.length + 1).padStart(3, '0')}`;
    const initials = name.substring(0, 2).toUpperCase();

    const newVendor: Vendor = {
      id: newID,
      name,
      gstNo,
      category,
      contactPhone: phone || '+91 99999 88888',
      contactEmail: email,
      status: 'Active',
      rating: 4.5,
      initials,
    };

    const updated = [newVendor, ...currentVendors];
    saveToStorage('vendors', updated);
    setVendors(updated);

    // Audit logs
    const logs = getFromStorage<ActivityLog>('activityLogs');
    saveToStorage('activityLogs', [{
      id: Date.now(),
      action: 'Vendor added',
      timestamp: '06 Jun 2026 · 04:00 PM',
      user: 'Denish V. (Procurement Officer)',
      details: `New supplier entity ${name} registered globally under tag ${category}`,
      type: 'vendor',
      color: 'blue',
      icon: 'Building2'
    }, ...logs]);

    setIsModalOpen(false);
    triggerToast(`Vendor "${name}" has been successfully added to ERP register!`);

    // Reset Form
    setName('');
    setGstNo('');
    setPhone('');
    setEmail('');
    setErrors({});
  };

  const handleDeleteVendor = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from our records?`)) {
      const currentVendors = getFromStorage<Vendor>('vendors');
      const filtered = currentVendors.filter(v => v.id !== id);
      saveToStorage('vendors', filtered);
      setVendors(filtered);
      triggerToast(`Vendor "${name}" removed from platform register.`);
    }
  };

  // Filter & Search match computing
  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.gstNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      v.status === statusFilter ||
      (statusFilter === 'Blocked' && (v.status as string) === 'Blocked');

    return matchesSearch && matchesStatus;
  });

  const getCategoryStyle = (cat: string) => {
    switch (cat) {
      case 'Professional Services':
        return 'bg-[#EDE9FE] text-[#5B21B6]';
      case 'IT Hardware':
        return 'bg-[#DBEAFE] text-[#1D4ED8]';
      case 'Logistics':
        return 'bg-[#D1FAE5] text-[#065F46]';
      case 'Office Supplies':
        return 'bg-[#FEF3C7] text-[#92400E]';
      case 'Furniture':
        return 'bg-[#FCE7F3] text-[#9D174D]';
      case 'Stationery':
      default:
        return 'bg-[#F1F5F9] text-[#475569]';
    }
  };

  const renderStars = (rating: number) => {
    const rounded = Math.round(rating);
    return (
      <div className="flex items-center gap-0.5 select-none">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={12}
            className={s <= rounded ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-[#E5E7EB]'}
          />
        ))}
        <span className="text-xs text-[#64748B] font-medium ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <ERPLayout title="Vendors" subtitle="Manage and audit supplier portfolios, trust ratings, and compliance registry">
      
      {/* Toast */}
      {toastMsg && (
        <div id="toast-success" className="fixed bottom-5 right-5 z-50 bg-[#0F172A] text-white border border-slate-700 font-sans shadow-2xl rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="w-6 h-6 rounded-full bg-[#D1FAE5] text-[#065F46] flex items-center justify-center font-bold text-xs shrink-0">✓</div>
          <p className="text-xs font-bold leading-none">{toastMsg}</p>
        </div>
      )}

      {/* Page Header Area */}
      <div className="flex justify-between items-center bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm hover:border-[#E2E8F0] transition-all select-none">
        <div>
          <h2 className="text-[14px] font-semibold text-[#0F172A] uppercase tracking-wider font-sans">Suppliers Directory Control</h2>
          <p className="text-xs text-[#475569] mt-0.5 font-sans">Audit active industrial vendors or add verified manufacturing partners.</p>
        </div>
        <button
          id="btn-vendors-add"
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white py-2 px-4 rounded-lg text-xs font-semibold cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.2)] hover:opacity-90 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)] active:scale-[0.97] transition-all duration-200 flex items-center gap-1.5"
        >
          <UserPlus size={14} />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Filter and Search Action Block */}
      <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm space-y-4 hover:border-[#E2E8F0] transition-all select-none">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          
          {/* Search box with prefix */}
          <div className="relative flex-1 max-w-lg">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#94A3B8]">
              <Search size={15} />
            </span>
            <input
              id="vendor-search-input"
              type="text"
              placeholder="Search by name, GST, vendor category..."
              className="w-full bg-white border border-[#E2E8F0] rounded-lg py-2 pl-[34px] pr-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#6366F1] focus:ring-0 focus:outline-none focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] outline-none transition-all duration-180"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Pills with step-by-step styles */}
          <div className="flex items-center gap-1.5 flex-wrap select-none">
            {(['All', 'Active', 'Pending', 'Blocked'] as const).map((filterOpt) => {
              const isActive = statusFilter === filterOpt;
              return (
                <button
                  key={filterOpt}
                  id={`filter-pill-${filterOpt.toLowerCase()}`}
                  onClick={() => setStatusFilter(filterOpt)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#6366F1] text-white shadow shadow-indigo-600/10'
                      : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#475569]'
                  }`}
                >
                  {filterOpt}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Vendor Records Card */}
      <div className="bg-white border border-[#F1F5F9] rounded-xl shadow-sm hover:border-[#E2E8F0] transition-all overflow-hidden">
        {filteredVendors.length === 0 ? (
          <div className="py-20 px-8 text-center flex flex-col items-center justify-center font-sans select-none">
            <div className="w-16 h-16 rounded-full bg-[#E0E7FF] flex items-center justify-center text-[#6366F1] mb-4">
              <Building2 size={28} />
            </div>
            <h3 className="text-base font-semibold text-[#0F172A]">No vendors registered yet</h3>
            <p className="text-xs text-[#94A3B8] max-w-sm mt-1">There are no supplier listings available matching current filter parameters.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white py-1.5 px-3.5 rounded-lg text-xs font-semibold cursor-pointer hover:opacity-92 transition-all inline-flex items-center gap-1"
            >
              <UserPlus size={14} /> Add Vendor
            </button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                  <th className="py-3.5 px-5 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Vendor Name</th>
                  <th className="py-3.5 px-5 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">GST No.</th>
                  <th className="py-3.5 px-5 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Category</th>
                  <th className="py-3.5 px-5 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Contact</th>
                  <th className="py-3.5 px-5 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Rating</th>
                  <th className="py-3.5 px-5 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="py-3.5 px-5 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredVendors.map((v, idx) => (
                  <tr
                    key={v.id}
                    className="hover:bg-[#FAFBFF] group transition-colors h-[64px]"
                    style={{
                      animation: 'fadeSlideLeft 300ms cubic-bezier(0.2, 0.8, 0.2, 1) backwards',
                      animationDelay: `${idx * 40}ms`,
                    }}
                  >
                    
                    {/* Name cell with Avatar Gradient */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white font-bold text-xs flex items-center justify-center select-none shadow-sm shrink-0">
                          {v.initials}
                        </div>
                        <div>
                          <p className="text-[13.5px] font-semibold text-[#0F172A] leading-tight font-sans tracking-tight">{v.name}</p>
                          <span className="text-[11px] text-[#94A3B8] font-medium block mt-0.5 truncate max-w-[180px]">{v.contactEmail}</span>
                        </div>
                      </div>
                    </td>

                    {/* GST */}
                    <td className="py-3 px-5 font-mono text-xs text-[#475569]">{v.gstNo}</td>

                    {/* Category Label */}
                    <td className="py-3 px-5">
                      <span className={`inline-block px-2.5 py-[3px] rounded-md text-[11px] font-medium ${getCategoryStyle(v.category)}`}>
                        {v.category}
                      </span>
                    </td>

                    {/* Contact Number */}
                    <td className="py-3 px-5 text-xs text-[#475569] font-medium">{v.contactPhone}</td>

                    {/* Trust stars */}
                    <td className="py-3 px-5">{renderStars(v.rating)}</td>

                    {/* Global badge status */}
                    <td className="py-3 px-5">
                      <StatusBadge status={v.status} />
                    </td>

                    {/* Actions column */}
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedVendorForView(v)}
                          title="View Details"
                          className="w-7 h-7 bg-[#EEF2FF] hover:bg-[#E0E7FF] rounded-md text-[#6366F1] flex items-center justify-center cursor-pointer transition-colors duration-150"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => { setSelectedVendorForView(v); alert('Edit functions require administrator level privilege override rules.'); }}
                          title="Edit Portfolio"
                          className="w-7 h-7 bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-md text-[#64748B] flex items-center justify-center cursor-pointer transition-colors duration-150"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteVendor(v.id, v.name)}
                          title="Unboard Supplier"
                          className="w-7 h-7 bg-[#FEF2F2] hover:bg-[#FEE2E2] rounded-md text-[#EF4444] flex items-center justify-center cursor-[#EF4444] transition-colors duration-150"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Lower design details pagination */}
        <div className="p-4 bg-white border-t border-[#F1F5F9] flex flex-col sm:flex-row justify-between sm:items-center gap-3 select-none text-xs text-[#94A3B8]">
          <p className="font-medium text-[#94A3B8] font-sans">
            Showing 1–{filteredVendors.length} of {vendors.length} supplier registries
          </p>
          <div className="flex gap-2">
            <button className="h-8 px-3 border border-[#E2E8F0] bg-white rounded-lg text-[#475569] hover:bg-[#F9FAFB] cursor-pointer inline-flex items-center justify-center text-xs font-semibold">Prev</button>
            <button className="h-8 px-3 border border-[#E2E8F0] bg-white rounded-lg text-[#475569] hover:bg-[#F9FAFB] cursor-pointer inline-flex items-center justify-center text-xs font-semibold">Next</button>
          </div>
        </div>
      </div>

      {/* Slide sheet detailed overview */}
      {selectedVendorForView && (
        <>
          <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setSelectedVendorForView(null)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-[#F1F5F9] shadow-2xl z-50 overflow-y-auto p-6 flex flex-col justify-between animate-fade-slide-left select-none">
            <div>
              <div className="flex justify-between items-start pb-5 border-b border-[#F1F5F9] mb-6">
                <div>
                  <span className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider block">Vendor Profile Sheet</span>
                  <h3 className="text-lg font-bold text-[#0F172A] mt-1 pr-6 truncate">{selectedVendorForView.name}</h3>
                </div>
                <button onClick={() => setSelectedVendorForView(null)} className="p-1 rounded-lg text-[#94A3B8] hover:bg-slate-100 transition-colors cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-6">
                
                {/* Visual Avatar Header in details screen */}
                <div className="flex items-center gap-4 bg-[#F8FAFC] border border-[#F1F5F9] p-4 rounded-xl">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-lg font-extrabold flex items-center justify-center shadow">
                    {selectedVendorForView.initials}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#94A3B8] uppercase block tracking-wider">{selectedVendorForView.id}</span>
                    <h4 className="text-sm font-bold text-[#0F172A] mt-0.5">{selectedVendorForView.name}</h4>
                    <span className="inline-flex mt-1.5"><StatusBadge status={selectedVendorForView.status} /></span>
                  </div>
                </div>

                {/* Grid info */}
                <div className="space-y-4">
                  <h5 className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider border-b pb-1">Compliance & Registry Info</h5>
                  <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                    <div>
                      <p className="text-[#94A3B8] font-medium">GSTIN Register</p>
                      <p className="text-[#475569] font-semibold mt-0.5">{selectedVendorForView.gstNo}</p>
                    </div>
                    <div>
                      <p className="text-[#94A3B8] font-medium">Onboard Segment</p>
                      <p className={`inline-block px-2 py-0.5 rounded-md font-semibold mt-0.5 text-[10px] ${getCategoryStyle(selectedVendorForView.category)}`}>{selectedVendorForView.category}</p>
                    </div>
                    <div>
                      <p className="text-[#94A3B8] font-medium">Business E-mail</p>
                      <p className="text-[#475569] font-semibold mt-0.5 break-all">{selectedVendorForView.contactEmail}</p>
                    </div>
                    <div>
                      <p className="text-[#94A3B8] font-medium">Telephone Helpline</p>
                      <p className="text-[#475569] font-mono font-semibold mt-0.5">{selectedVendorForView.contactPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Audit Rating */}
                <div className="bg-[#FFFBEB] border border-amber-100 p-4 rounded-xl">
                  <h5 className="text-[11px] font-bold text-[#92400E] uppercase tracking-wider">Performance Audit Record</h5>
                  <div className="flex items-center justify-between mt-2 select-none">
                    <span className="text-xs font-medium text-[#92400E]">Global Trust Rank:</span>
                    {renderStars(selectedVendorForView.rating)}
                  </div>
                </div>

              </div>
            </div>

            <div className="pt-6 border-t border-[#F1F5F9] flex gap-3">
              <button onClick={() => setSelectedVendorForView(null)} className="w-full h-10 border border-[#E2E8F0] text-[#374151] rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer">
                Close Sheet
              </button>
            </div>
          </div>
        </>
      )}

      {/* Verified suppliers addition popup */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-[#F1F5F9] rounded-xl w-full max-w-md shadow-2xl z-50 p-6 overflow-hidden animate-fade-slide-up select-none">
            <div className="flex justify-between items-center pb-4 border-b border-[#F1F5F9] mb-5">
              <h4 className="text-[14px] font-bold text-[#0F172A] tracking-tight uppercase flex items-center gap-2">
                <UserPlus size={16} className="text-[#6366F1]" />
                <span>Add Verified Vendor</span>
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-[#94A3B8] hover:bg-slate-100 transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#0F172A] block">Company Title (Legal Name)</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corporate Solutions"
                  className={`w-full bg-white border ${errors.name ? 'border-red-500' : 'border-[#E2E8F0]'} rounded-lg py-2 px-3 text-sm text-[#0F172A] outline-none focus:border-[#6366F1]`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#0F172A] block">GST Number (15-char)</label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="e.g. 27AAAAA1111A1Z1"
                    className={`w-full bg-white border ${errors.gstNo ? 'border-red-500' : 'border-[#E2E8F0]'} rounded-lg py-2 px-3 text-sm text-[#0F172A] outline-none focus:border-[#6366F1] font-mono`}
                    value={gstNo}
                    onChange={(e) => setGstNo(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#0F172A] block">Onboard Category</label>
                  <select
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#0F172A] outline-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                  >
                    <option value="IT Hardware font-sans">IT Hardware</option>
                    <option value="Furniture font-sans">Furniture</option>
                    <option value="Office Supplies font-sans">Office Supplies</option>
                    <option value="Logistics font-sans">Logistics</option>
                    <option value="Professional Services font-sans">Professional Services</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#0F172A] block">Helpline Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 99911 22334"
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm text-[#0F172A] outline-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#0F172A] block">Corporate Email</label>
                  <input
                    type="email"
                    placeholder="procure@company.com"
                    className={`w-full bg-white border ${errors.email ? 'border-red-500' : 'border-[#E2E8F0]'} rounded-lg py-2 px-3 text-sm text-[#0F172A] outline-none`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="h-9 px-4 border border-[#E2E8F0] text-[#374151] rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" className="h-9 px-4 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer shadow-md transition-all">Onboard Partner</button>
              </div>
            </form>
          </div>
        </>
      )}

    </ERPLayout>
  );
}
