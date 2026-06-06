import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ERPLayout from '../components/ERPLayout';
import { getFromStorage, saveToStorage, PurchaseOrder, ActivityLog, Invoice, generateInvoiceFromPO } from '../data/mockData';
import { ShieldCheck, X, FileCheck, Check, Clock, UserCheck, ChevronDown, MessageSquare } from 'lucide-react';

export default function ApprovalPage() {
  const navigate = useNavigate();
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [selectedPOId, setSelectedPOId] = useState('');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [comment, setComment] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Flow Steppers list
  const flowSteps = [
    { title: 'Draft Raised', status: 'done', desc: '06 Jun · 11:30 AM' },
    { title: 'Tender Comparison', status: 'done', desc: '06 Jun · 02:20 PM' },
    { title: 'Corporate Approval', status: 'active', desc: 'Pending Sign-off' },
    { title: 'Contract Dispatched', status: 'waiting', desc: 'Awaiting clearance' }
  ];

  // Load purchase orders from storage on render
  useEffect(() => {
    const list = getFromStorage<PurchaseOrder>('pos');
    // Filter down to show those pending approval first
    setPos(list);
    if (list.length > 0) {
      // Prioritize pending approval POs
      const pendingApproval = list.find(o => o.status === 'Pending Approval') || list[0];
      setSelectedPOId(pendingApproval.id);
      setSelectedPO(pendingApproval);
    }
  }, []);

  const handlePOChange = (id: string) => {
    setSelectedPOId(id);
    const matched = pos.find(p => p.id === id) || null;
    setSelectedPO(matched);
  };

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Perform clearance decision
  const handleDecision = (decision: 'Approved' | 'Rejected') => {
    if (!selectedPO) return;

    const currentPOs = getFromStorage<PurchaseOrder>('pos');
    const updatedPOs = currentPOs.map(o => {
      if (o.id === selectedPO.id) {
        return {
          ...o,
          status: decision === 'Approved' ? ('Active' as const) : ('Rejected' as const)
        };
      }
      return o;
    });

    saveToStorage('pos', updatedPOs);
    setPos(updatedPOs);
    setSelectedPO({
      ...selectedPO,
      status: decision === 'Approved' ? 'Active' : 'Rejected'
    });

    // Clear comment
    setComment('');

    // ── AUTO-GENERATE INVOICE when PO is approved ──────────────────
    if (decision === 'Approved') {
      const existingInvoices = getFromStorage<Invoice>('invoices');
      // Prevent duplicate invoice for same PO
      const alreadyExists = existingInvoices.some(inv => inv.poId === selectedPO.id);
      if (!alreadyExists) {
        const newInvoice = generateInvoiceFromPO(selectedPO);
        saveToStorage('invoices', [newInvoice, ...existingInvoices]);
      }
    }
    // ──────────────────────────────────────────────────────────────

    // Write audit trail log
    const logs = getFromStorage<ActivityLog>('activityLogs');
    saveToStorage('activityLogs', [{
      id: Date.now(),
      action: decision === 'Approved' ? 'PO approved — Invoice auto-generated' : 'PO rejected',
      timestamp: new Date().toLocaleString('en-IN'),
      user: 'Brijesh S. (Chief Procurement Officer)',
      details: decision === 'Approved'
        ? `Purchase Order ${selectedPO.id} approved. Invoice auto-generated for vendor ${selectedPO.vendorName}. Remark: "${comment || 'Approved standard requisition'}"`
        : `Requisition ${selectedPO.id} declined. Notice: "${comment || 'Budget cap overrun'}"`,
      type: decision === 'Approved' ? 'invoice' : 'approval',
      color: decision === 'Approved' ? 'green' : 'red',
      icon: decision === 'Approved' ? 'Receipt' : 'ShieldCheck'
    }, ...logs]);

    triggerToast(
      decision === 'Approved'
        ? `✓ PO ${selectedPO.id} approved! Invoice auto-generated — check PO & Invoice page.`
        : `PO ${selectedPO.id} rejected.`
    );
  };

  return (
    <ERPLayout title="Approval Routing" subtitle="Executive clearance desks, financial compliance audits, and board signatures">
      
      {/* Toast notifications */}
      {toast && (
        <div id="toast-success" className="fixed bottom-5 right-5 z-50 bg-[#0F172A] border border-slate-700 font-sans shadow-2xl rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
          <div className="w-6 h-6 rounded-full bg-[#D1FAE5] text-[#065F46] flex items-center justify-center font-bold text-xs shrink-0">✓</div>
          <p className="text-xs font-bold leading-none">{toast}</p>
        </div>
      )}

      {/* PO Select header panel */}
      <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-[#E2E8F0] transition-all select-none">
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#94A3B8]">Clearance Worklist</h4>
          <p className="text-xs text-[#64748B] mt-0.5 font-sans">Pick from recent purchase requisitions pending executive signature.</p>
        </div>
        <div>
          <select
            className="bg-white border border-[#E2E8F0] text-sm text-[#0F172A] font-bold rounded-lg py-2 px-3 outline-none cursor-pointer"
            value={selectedPOId}
            onChange={(e) => handlePOChange(e.target.value)}
          >
            {pos.map(p => (
              <option key={p.id} value={p.id}>{p.id} - {p.vendorName} ({p.status})</option>
            ))}
          </select>
        </div>
      </div>

      {selectedPO ? (
        <div className="space-y-8 select-none font-sans">
          
          {/* Horizontal stepper timeline bar */}
          <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm hover:border-[#E2E8F0] transition-colors">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B] mb-5 border-b pb-2">Procurement Routing Stepper</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
              {flowSteps.map((step, idx) => {
                const isDone = step.status === 'done';
                const isActive = step.status === 'active';
                return (
                  <div key={idx} className="flex gap-3 items-start relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isDone ? 'bg-[#D1FAE5] text-[#065F46]' :
                      isActive ? 'bg-[#6366F1] text-white shadow shadow-indigo-600/10' :
                      'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}>
                      {isDone ? <Check size={14} strokeWidth={3} /> : idx + 1}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isActive ? 'text-[#6366F1]' : 'text-[#0F172A]'}`}>{step.title}</p>
                      <span className="text-[10px] text-[#94A3B8] font-semibold mt-0.5 block">{step.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: detailed PDF style spec sheet (span 7) */}
            <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute right-4 top-4 text-[10px] font-bold text-[#6366F1] border border-indigo-200 bg-indigo-50 px-2 py-0.5 rounded font-mono">ERP INTERNAL SPEC DRAFT</div>
              
              <div className="border-b border-[#E2E8F0] pb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Requisition Reference</span>
                <h3 className="text-base font-bold text-[#0F172A] mt-1 font-mono">{selectedPO.id}</h3>
                <span className="text-xs text-[#64748B] block mt-1">Expected Delivery: {selectedPO.deliveryDate}</span>
              </div>

              {/* Grid block */}
              <div className="grid grid-cols-2 gap-5 text-xs font-sans border-b border-dashed border-[#E2E8F0] pb-5">
                <div>
                  <span className="text-[#94A3B8] font-bold block uppercase tracking-wider text-[9px]">Supplier Nominee</span>
                  <p className="text-sm font-bold text-[#0F172A] mt-1 pr-1 leading-tight">{selectedPO.vendorName}</p>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">Verified ERP Partner</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] font-bold block uppercase tracking-wider text-[9px]">Requested Department</span>
                  <p className="text-sm font-semibold text-[#475569] mt-1 leading-tight">{selectedPO.department}</p>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">Charge Area Account</span>
                </div>
              </div>

              {/* Scope & line spec */}
              <div className="space-y-3.5 text-xs">
                <span className="text-[#94A3B8] font-bold block uppercase tracking-wider text-[9px]">Line item requisition list</span>
                
                <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl space-y-2.5">
                  <div className="flex justify-between font-semibold">
                    <span className="text-[#0F172A]">Enterprise Equipment standard supply order</span>
                    <span className="font-mono text-[#0F172A]">₹{selectedPO.total}</span>
                  </div>
                  <div className="border-t border-[#F1F5F9] pt-2 flex justify-between text-[11px] font-medium text-[#64748B]">
                    <span>Expected Cargo lead:</span>
                    <span>14 Days express cargo</span>
                  </div>
                </div>
              </div>

              {/* Total Summary banner */}
              <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl flex justify-between items-center text-xs shadow-sm">
                <div>
                  <span className="text-[#94A3B8] font-bold block uppercase tracking-wider text-[9px]">Gross Liability Summary (Tax incl.)</span>
                  <p className="text-lg font-bold font-mono text-[#6366F1] mt-0.5">{selectedPO?.total ?? '—'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[#94A3B8] font-semibold block text-[10px]">Payment Clause:</span>
                  <span className="font-bold text-[#0F172A]">{selectedPO.paymentTerms || 'Net 30'} Days</span>
                </div>
              </div>

            </div>

            {/* Right Column: Approval Action card (span 5) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm hover:border-[#E2E8F0] transition-colors space-y-5">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#0F172A] border-b pb-2 flex items-center gap-1.5 select-none">
                  <shieldCheck className="text-indigo-600" />
                  <span>Authorized Clearance Actions</span>
                </h4>

                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-lg flex items-center justify-between text-xs font-sans">
                  <span className="font-medium text-slate-500">Current Status:</span>
                  <div className="inline-flex items-center gap-1 font-bold">
                    {selectedPO.status === 'Pending Approval' ? (
                      <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-300 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <Clock size={10} /> Pending Board Match
                      </span>
                    ) : selectedPO.status === 'Active' ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-300 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <shieldCheck size={10} /> Signed Active PO
                      </span>
                    ) : (
                      <span className="text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-300 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <X size={10} /> Rejected/Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Commentary field */}
                {selectedPO.status === 'Pending Approval' ? (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#0f172a] flex items-center gap-1">
                        <MessageSquare size={13} className="text-[#6366F1]" />
                        <span>Executive sign-off commentary remarks</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Provide reasoning, budgetary matching references, or audit clearance notes..."
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-xs text-[#0F172A] outline-none placeholder-[#94A3B8]"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDecision('Rejected')}
                        className="flex-1 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-semibold cursor-pointer transition-all inline-flex items-center justify-center gap-1"
                      >
                        <X size={13} />
                        <span>Deny Spec Request</span>
                      </button>

                      <button
                        onClick={() => handleDecision('Approved')}
                        className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg text-xs font-bold hover:opacity-92 transition-all cursor-pointer shadow inline-flex items-center justify-center gap-1"
                      >
                        <ShieldCheck size={13} />
                        <span>Sign & Approve PO</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-center text-[#94A3B8] italic font-sans py-3 leading-relaxed">
                    This requisition is already locked. Requisition decision is archived under audit ledger logs.
                  </p>
                )}

              </div>

              {/* Mini history log stepper */}
              <div className="bg-white border border-[#F1F5F9] rounded-xl p-5 shadow-sm hover:border-[#E2E8F0] transition-all space-y-3">
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#0F172A] border-b pb-2">Audit Trace Logs</h4>
                <div className="space-y-3.5 text-xs font-sans">
                  <div className="flex gap-2.5 items-start">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0 select-none">
                      <Clock size={10} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Tender broadcast initiated</p>
                      <span className="text-[10px] text-[#94A3B8] mt-0.5 block">06 Jun 2026 · 11:30 AM by Denish V.</span>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <div className="w-5 h-5 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-green-500 shrink-0 select-none">
                      <UserCheck size={10} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Proposal comparative analysis cleared</p>
                      <span className="text-[10px] text-[#94A3B8] mt-0.5 block">06 Jun 2026 · 02:40 PM by committee</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : (
        <p className="text-sm text-[#94A3B8]">No purchase order requisitions in workflow catalog.</p>
      )}

    </ERPLayout>
  );
}
