import React, { useState, useEffect } from 'react';
import ERPLayout from '../components/ERPLayout';
import StatCard from '../components/StatCard';
import SpendAreaChart from '../components/SpendAreaChart';
import CategoryBarChart from '../components/CategoryBarChart';
import POTable from '../components/POTable';
import QuickActions from '../components/QuickActions';
import {
  getFromStorage,
  saveToStorage,
  Vendor,
  RFQ,
  PurchaseOrder,
  Invoice,
  ActivityLog
} from '../data/mockData';
import { Plus, X, Landmark, FileSearch, Building2, ShoppingBag } from 'lucide-react';

export default function DashboardPage() {
  const [activeModal, setActiveModal] = useState<'rfq' | 'vendor' | 'po' | 'invoice' | null>(null);
  
  // Data State loaded from central Storage
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Form Fields setup
  const [rfqTitle, setRfqTitle] = useState('');
  const [rfqCategory, setRfqCategory] = useState('IT Hardware');
  const [rfqDescription, setRfqDescription] = useState('');
  const [rfqPriority, setRfqPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');

  const [vendorName, setVendorName] = useState('');
  const [vendorGst, setVendorGst] = useState('');
  const [vendorCategory, setVendorCategory] = useState<'IT Hardware' | 'Office Supplies' | 'Professional Services' | 'Logistics' | 'Furniture' | 'Stationery'>('IT Hardware');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');

  const [poAmount, setPoAmount] = useState('');
  const [poDepartment, setPoDepartment] = useState('Facility & Infrastructure');
  const [poVendor, setPoVendor] = useState('Infra Supplies Ltd');

  const [invAmount, setInvAmount] = useState('');
  const [invPoId, setInvPoId] = useState('VB-PO-2024-001');

  // Load actual counts from DB
  useEffect(() => {
    setVendors(getFromStorage<Vendor>('vendors'));
    setRfqs(getFromStorage<RFQ>('rfqs'));
    setPos(getFromStorage<PurchaseOrder>('pos'));
    setInvoices(getFromStorage<Invoice>('invoices'));
  }, [activeModal]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreateRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqTitle.trim()) return;

    const currentRfqs = getFromStorage<RFQ>('rfqs');
    const newId = `RFQ-0${currentRfqs.length + 1}`;
    
    const newRFQ: RFQ = {
      id: newId,
      title: rfqTitle,
      category: rfqCategory,
      priority: rfqPriority,
      status: 'Active',
      closeDate: '30 Jun 2028',
      deadline: '2028-06-30',
      expectedDelivery: '2028-07-15',
      description: rfqDescription,
      items: [
        { id: '1', description: 'Enterprise Standard Equipment', qty: 10, unit: 'units', estPrice: 2000 }
      ],
      assignedVendorsCount: 2
    };

    const updated = [newRFQ, ...currentRfqs];
    saveToStorage('rfqs', updated);

    // Also write to audit trail
    const logs = getFromStorage<ActivityLog>('activityLogs');
    const newLog: ActivityLog = {
      id: Date.now(),
      action: 'RFQ created',
      timestamp: '06 Jun 2026 · 03:00 PM',
      user: 'Denish V. (Procurement Officer)',
      details: `RFQ "${rfqTitle}" launched via ERP Dashboard`,
      type: 'rfq',
      color: 'blue',
      icon: 'FileSearch'
    };
    saveToStorage('activityLogs', [newLog, ...logs]);

    triggerToast(`RFQ "${rfqTitle}" opened and broadcasted!`);
    setRfqTitle('');
    setRfqDescription('');
    setActiveModal(null);
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim() || !vendorEmail.trim()) return;

    const currentVendors = getFromStorage<Vendor>('vendors');
    const newId = `VEN-0${currentVendors.length + 1}`;
    
    const newVendor: Vendor = {
      id: newId,
      name: vendorName,
      gstNo: vendorGst || '27XXXXX0000X0Z0',
      category: vendorCategory,
      contactPhone: vendorPhone || '+91 91234 56789',
      contactEmail: vendorEmail,
      status: 'Active',
      rating: 5.0,
      initials: vendorName.substring(0, 2).toUpperCase()
    };

    const updated = [newVendor, ...currentVendors];
    saveToStorage('vendors', updated);

    // Audit logs
    const logs = getFromStorage<ActivityLog>('activityLogs');
    saveToStorage('activityLogs', [{
      id: Date.now(),
      action: 'Vendor added',
      timestamp: '06 Jun 2026 · 03:15 PM',
      user: 'Denish V. (Procurement Officer)',
      details: `${vendorName} registered successfully in global vendor catalog`,
      type: 'vendor',
      color: 'blue',
      icon: 'Building2'
    }, ...logs]);

    triggerToast(`Vendor partner "${vendorName}" onboarded!`);
    setVendorName('');
    setVendorGst('');
    setVendorEmail('');
    setVendorPhone('');
    setActiveModal(null);
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poAmount.trim()) return;

    const currentPos = getFromStorage<PurchaseOrder>('pos');
    const newId = `VB-PO-2026-0${currentPos.length + 1}`;
    const valueNum = parseFloat(poAmount);

    const newPO: PurchaseOrder = {
      id: newId,
      orderDate: '06/06/26 · 03:30 PM',
      deliveryDate: '28/06/26 · 06:00 PM',
      status: 'Pending Approval',
      total: `₹${valueNum.toLocaleString('en-IN')}.00`,
      vendorName: poVendor,
      department: poDepartment,
      paymentTerms: 'Net 30'
    };

    const updated = [newPO, ...currentPos];
    saveToStorage('pos', updated);

    const logs = getFromStorage<ActivityLog>('activityLogs');
    saveToStorage('activityLogs', [{
      id: Date.now(),
      action: 'PO generated',
      timestamp: '06 Jun 2026 · 03:30 PM',
      user: 'Denish V. (Procurement Officer)',
      details: `PO ${newId} with billing of ${newPO.total} queued for executive review`,
      type: 'po',
      color: 'indigo',
      icon: 'ShoppingBag'
    }, ...logs]);

    triggerToast(`Purchase Order ${newId} submitted for executive clearance!`);
    setPoAmount('');
    setActiveModal(null);
  };

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invAmount.trim()) return;

    const currentInvoices = getFromStorage<Invoice>('invoices');
    const newId = `INV-2026-${900 + currentInvoices.length + 1}`;
    const formattedAmount = `₹${parseFloat(invAmount).toLocaleString('en-IN')}`;

    const newInv: Invoice = {
      id: newId,
      poId: invPoId,
      vendor: 'Prism Office Supplies Ltd',
      amount: formattedAmount,
      status: 'Pending',
      issueDate: '06/06/26 · 03:45 AM',
      dueDate: '06/07/26 · 05:00 PM'
    };

    const updated = [newInv, ...currentInvoices];
    saveToStorage('invoices', updated);

    const logs = getFromStorage<ActivityLog>('activityLogs');
    saveToStorage('activityLogs', [{
      id: Date.now(),
      action: 'Invoice sent',
      timestamp: '06 Jun 2026 · 03:45 PM',
      user: 'External API Port',
      details: `New invoice billing ${formattedAmount} received for ${invPoId}`,
      type: 'invoice',
      color: 'green',
      icon: 'Mail'
    }, ...logs]);

    triggerToast(`Invoice ${newId} linked successfully against PO!`);
    setInvAmount('');
    setActiveModal(null);
  };

  // Derived counts
  const pendingApprovalsCount = pos.filter(o => o.status === 'Pending Approval').length;
  const activeRfqsCount = rfqs.filter(r => r.status === 'Active').length;

  return (
    <ERPLayout title="Dashboard" subtitle="Procurement and Supplier Relationship Pipeline Console">
      
      {/* Dynamic Notification Toast */}
      {toast && (
        <div id="toast-success" className="fixed bottom-5 right-5 z-50 bg-[#0F172A] text-white border border-slate-700 font-sans shadow-2xl rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="w-6 h-6 rounded-full bg-[#D1FAE5] text-[#065F46] flex items-center justify-center font-bold text-xs shrink-0">✓</div>
          <p className="text-xs font-bold leading-none">{toast}</p>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div id="stat-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Pending Approvals"
          value={pendingApprovalsCount}
          trendText="Action Required"
          trendType="warning"
          iconName="BadgeCheck"
          delayMs={0}
        />
        <StatCard
          label="Active RFQs"
          value={activeRfqsCount}
          trendText="Bidding Ongoing"
          trendType="info"
          iconName="FileSearch"
          delayMs={80}
        />
        <StatCard
          label="Purchase Orders"
          value={`₹${pos.length * 28000 + 45251}`}
          trendText="↓ 14% vs last month"
          trendType="danger"
          iconName="ShoppingBag"
          delayMs={160}
        />
        <StatCard
          label="Active Invoices"
          value={invoices.length}
          trendText="Pending Clearance"
          trendType="success"
          iconName="Receipt"
          delayMs={240}
        />
      </div>

      {/* Quick Launch Control Strip */}
      <div id="erp-shortcuts-banner" className="bg-white border border-[#F1F5F9] rounded-xl p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-[#E2E8F0] transition-all duration-200 shadow-sm">
        <div>
          <h4 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider text-[11px] text-[#94A3B8]">ERP Operations Shortcuts</h4>
          <p className="text-xs text-[#475569] mt-0.5 font-sans">Submit requisition specifications, register verified vendor facilities, and record invoices.</p>
        </div>
        <QuickActions
          onNewRFQ={() => setActiveModal('rfq')}
          onAddVendor={() => setActiveModal('vendor')}
          onCreatePO={() => setActiveModal('po')}
          onGenerateInvoice={() => setActiveModal('invoice')}
        />
      </div>

      {/* Dual Analytics Area Charts */}
      <div id="visual-dashboard-charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendAreaChart />
        <CategoryBarChart />
      </div>

      {/* Dynamic Orders Audit Table */}
      <POTable />

      {/* Creation Overlay Modals */}
      {activeModal && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActiveModal(null)} />
          
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-[#F1F5F9] rounded-xl w-full max-w-md shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-[#F1F5F9] mb-5">
              <h4 className="text-[15px] font-bold text-[#0F172A] tracking-tight uppercase flex items-center gap-2">
                {activeModal === 'rfq' && <><FileSearch size={16} className="text-[#6366F1]" /> <span>Launch RFQ Bid Run</span></>}
                {activeModal === 'vendor' && <><Building2 size={16} className="text-[#6366F1]" /> <span>Board Supplier Partner</span></>}
                {activeModal === 'po' && <><ShoppingBag size={16} className="text-[#6366F1]" /> <span>Authorize Purchase Order</span></>}
                {activeModal === 'invoice' && <><Landmark size={16} className="text-[#6366F1]" /> <span>Link Billing Statement</span></>}
              </h4>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-[#94A3B8] hover:bg-slate-100 transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={
              activeModal === 'rfq' ? handleCreateRFQ :
              activeModal === 'vendor' ? handleAddVendor :
              activeModal === 'po' ? handleCreatePO :
              handleGenerateInvoice
            } className="space-y-4">
              
              {activeModal === 'rfq' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#374151]">Specification / RFQ Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Office Furniture Procurement Q2"
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm text-[#0F172A] outline-none focus:border-[#6366F1]"
                      value={rfqTitle}
                      onChange={(e) => setRfqTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[12px] font-medium text-[#374151]">Target Category</label>
                      <select required className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#0F172A] outline-none" value={rfqCategory} onChange={(e) => setRfqCategory(e.target.value)}>
                        <option value="IT Hardware">IT Hardware</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Office Supplies">Office Supplies</option>
                        <option value="Professional Services">Legal & Services</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[12px] font-medium text-[#374151]">Level Priority</label>
                      <select required className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#0F172A] outline-none" value={rfqPriority} onChange={(e) => setRfqPriority(e.target.value as any)}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#374151]">RFQ Brief Details</label>
                    <textarea rows={3} placeholder="Requirements summary, quality alignment, deadlines..." className="w-full bg-white border border-[#E2E8F0] rounded-lg p-3 text-sm text-[#0F172A] outline-none resize-none" value={rfqDescription} onChange={(e) => setRfqDescription(e.target.value)} />
                  </div>
                </>
              )}

              {activeModal === 'vendor' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#374151]">Company Legal Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Infra Supplies India Ltd"
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm text-[#0F172A] outline-none"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[12px] font-medium text-[#374151]">GSTIN Number</label>
                      <input
                        type="text"
                        placeholder="GSTIN standard (e.g. 27AAAAA111A1)"
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm text-[#0F172A] outline-none"
                        value={vendorGst}
                        onChange={(e) => setVendorGst(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[12px] font-medium text-[#374151]">Operations Category</label>
                      <select required className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#0F172A] outline-none" value={vendorCategory} onChange={(e) => setVendorCategory(e.target.value as any)}>
                        <option value="IT Hardware">IT Hardware</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Office Supplies">Office Supplies</option>
                        <option value="Logistics">Logistics</option>
                        <option value="Professional Services">Professional Services</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#374151]">Primary E-mail contact</label>
                    <input
                      type="email"
                      required
                      placeholder="procure@supplier.com"
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm text-[#0F172A] outline-none"
                      value={vendorEmail}
                      onChange={(e) => setVendorEmail(e.target.value)}
                    />
                  </div>
                </>
              )}

              {activeModal === 'po' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#374151]">Order Monetary Subtotal (INR)</label>
                    <input
                      type="number"
                      required
                      placeholder="Amount to authorize (e.g. 185900)"
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm text-[#0F172A] outline-none"
                      value={poAmount}
                      onChange={(e) => setPoAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[12px] font-medium text-[#374151]">Authorized Vendor</label>
                      <select className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#0F172A] outline-none" value={poVendor} onChange={(e) => setPoVendor(e.target.value)}>
                        <option value="Infra Supplies Ltd">Infra Supplies Ltd</option>
                        <option value="Global Tech Solutions">Global Tech Solutions</option>
                        <option value="Prism Office Supplies Ltd">Prism Office Supplies Ltd</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[12px] font-medium text-[#374151]">Target Cost Department</label>
                      <select className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#0F172A] outline-none" value={poDepartment} onChange={(e) => setPoDepartment(e.target.value)}>
                        <option value="Facility & Infrastructure">Infrastructure Dep</option>
                        <option value="IT Hardware Support">Operations Dep</option>
                        <option value="Finance Operations">Finance Corporate</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activeModal === 'invoice' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#374151]">Applied Invoice Sum (INR)</label>
                    <input
                      type="number"
                      required
                      placeholder="Taxed subtotal (e.g. 14350)"
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm text-[#0F172A] outline-none"
                      value={invAmount}
                      onChange={(e) => setInvAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[12px] font-medium text-[#374151]">Link Active PO Ref</label>
                    <select className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2 text-sm text-[#0F172A] outline-none" value={invPoId} onChange={(e) => setInvPoId(e.target.value)}>
                      <option value="VB-PO-2024-001">VB-PO-2024-001 (Partner: Global Tech)</option>
                      <option value="VB-PO-2024-002">VB-PO-2024-002 (Partner: Apex Logistics)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Form buttons */}
              <div className="pt-4 flex gap-3.5 justify-end">
                <button type="button" onClick={() => setActiveModal(null)} className="h-9 px-4 border border-[#E2E8F0] text-[#374151] rounded-lg text-xs font-semibold hover:bg-[#F9FAFB] cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="h-9 px-4 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white rounded-lg text-xs font-semibold hover:opacity-92 cursor-pointer shadow-md">
                  Confirm dispatch
                </button>
              </div>

            </form>
          </div>
        </>
      )}

    </ERPLayout>
  );
}
